const { Client } = require('ldapts')
const { AndFilter, EqualityFilter } = require('ldapts/filters')
const { csvFile } = require('kth-canvas-utilities')
const { deleteFile } = require('./utils')
const attributes = ['ugKthid', 'name']
const logger = require('./logger')

function createGroupFilter (groupName) {
  return new AndFilter({
    filters: [
      new EqualityFilter({
        attribute: 'objectClass',
        value: 'group'
      }),
      new EqualityFilter({
        attribute: 'CN',
        value: groupName
      })
    ]
  })
}

/*
 * For string array with ldap keys for users, fetch every user object
 */
async function getUsersForMembers (members, ldapClient) {
  const usersForMembers = []
  for (const member of members) {
    const filter = new EqualityFilter({
      attribute: 'distinguishedName',
      value: member
    })
    const { searchEntries } = await ldapClient.search(
      process.env.UG_LDAP_BASE,
      {
        scope: 'sub',
        filter,
        timeLimit: 10,
        attributes,
        paged: {
          pageSize: 1000
        }
      }
    )
    usersForMembers.push(...searchEntries)
  }
  return usersForMembers
}

async function searchGroup (filter, ldapClient) {
  const { searchEntries } = await ldapClient.search(process.env.UG_LDAP_BASE, {
    scope: 'sub',
    filter,
    timeLimit: 11,
    paged: true
  })
  let members = []
  if (searchEntries[0] && searchEntries[0].member) {
    if (Array.isArray(searchEntries[0].member)) {
      members = searchEntries[0].member
    } else {
      members = [searchEntries[0].member]
    }
  }
  return members
}

/*
 * Fetch the members for the examinator group for this course.
 */
async function getExaminatorMembers (courseCode, ldapClient) {
  const filter = createGroupFilter(
    `edu.courses.${courseCode.substring(0, 2)}.${courseCode}.examiner`
  )
  return searchGroup(filter, ldapClient)
}

async function writeUsersForCourse ({ canvasCourse, ldapClient, fileName }) {
  const ugRoleCanvasRole = [
    // role_id's are defined in Canvas
    { type: 'teachers', roleId: 4 },
    { type: 'courseresponsible', roleId: 9 },
    { type: 'assistants', roleId: 5 }
  ]

  const roundId = canvasCourse.sisCourseId.slice(-1)

  for (const { type, roleId } of ugRoleCanvasRole) {
    const filter = createGroupFilter(
      `edu.courses.${canvasCourse.courseCode.substring(0, 2)}.${
        canvasCourse.courseCode
      }.${canvasCourse.startTerm}.${roundId}.${type}`
    )
    const members = await searchGroup(filter, ldapClient)
    const users = await getUsersForMembers(members, ldapClient)
    for (const user of users) {
      await csvFile.writeLine(
        [canvasCourse.sisCourseId, user.ugKthid, roleId, 'active'],
        fileName
      )
    }
  }
  // examinators, role_id: 10
  const examinatorMembers = await getExaminatorMembers(
    canvasCourse.courseCode,
    ldapClient
  )
  const examinators = await getUsersForMembers(examinatorMembers, ldapClient)
  for (const user of examinators) {
    await csvFile.writeLine(
      [canvasCourse.sisCourseId, user.ugKthid, 10, 'active'],
      fileName
    )
  }

  // Registered students, role_id: 3
  try {
    let lengthOfInitials
    if (canvasCourse.courseCode.length > 6) {
      lengthOfInitials = 3
    } else {
      lengthOfInitials = 2
    }
    const courseInitials = canvasCourse.courseCode.substring(
      0,
      lengthOfInitials
    )
    const courseCodeWOInitials = canvasCourse.courseCode.substring(
      lengthOfInitials
    )
    const filter = createGroupFilter(
      `ladok2.kurser.${courseInitials}.${courseCodeWOInitials}.registrerade_${canvasCourse.startTerm}.${roundId}`
    )
    const registeredMembers = await searchGroup(filter, ldapClient)
    const registeredStudents = await getUsersForMembers(
      registeredMembers,
      ldapClient
    )
    for (const user of registeredStudents) {
      await csvFile.writeLine(
        [canvasCourse.sisCourseId, user.ugKthid, 3, 'active'],
        fileName
      )
    }
  } catch (err) {
    logger.info(
      err,
      'Could not get registered students for this course. Perhaps there are no students?'
    )
  }
}

module.exports = async function ({ term, year, canvasCourses }) {
  const ldapClient = new Client({
    url: process.env.UG_URL
  })
  await ldapClient.bind(process.env.UG_USERNAME, process.env.UG_PWD)

  const fileName = `${process.env.CSV_DIR}enrollments-${year}-${term}.csv`
  await deleteFile(fileName)
  await csvFile.writeLine(
    ['section_id', 'user_id', 'role_id', 'status'],
    fileName
  )

  for (const canvasCourse of canvasCourses) {
    await writeUsersForCourse({ canvasCourse, ldapClient, fileName })
  }

  await ldapClient.unbind()
  return fileName
}
