const util = require('util')
const ldap = require('ldapjs')
const { csvFile } = require('kth-canvas-utilities')
const { deleteFile } = require('./utils')
const attributes = ['ugKthid', 'name']
const logger = require('./logger')
/*
 * For string array with ldap keys for users, fetch every user object
 */
async function getUsersForMembers (members, ldapClient) {
  const usersForMembers = []
  for (let member of members) {
    const searchResult = await new Promise((resolve, reject) => {
      ldapClient.search(process.env.UG_LDAP_BASE, {
        scope: 'sub',
        filter: `(distinguishedName=${member})`,
        timeLimit: 10,
        paging: true,
        attributes,
        paged: {
          pageSize: 1000,
          pagePause: false
        }
      }, (err, res) => {
        if (err) {
          reject(err)
          return
        }
        const users = []
        res.on('searchEntry', entry => {
          if (Array.isArray(entry.object)) {
            users.push(...entry.object)
          } else {
            users.push(entry.object)
          }
        })
        res.on('end', entry => {
          if (entry.status !== 0) {
            reject(new Error(`Rejected with status: ${entry.status}`))
            return
          }
          resolve(users)
        })
        res.on('error', reject)
      })
    })

    usersForMembers.push(...searchResult)
  }
  return usersForMembers
}

async function searchGroup (filter, ldapClient) {
  return new Promise((resolve, reject) => {
    ldapClient.search(process.env.UG_LDAP_BASE, {
      scope: 'sub',
      filter,
      timeLimit: 11,
      paged: true
    }, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      const members = []
      res.on('searchEntry', entry => {
        if (Array.isArray(entry.object.member)) {
          members.push(...entry.object.member)
        } else {
          members.push(entry.object.member)
        }
      })
      res.on('end', entry => {
        if (entry.status !== 0) {
          reject(new Error(`Rejected with status: ${entry.status}`))
          return
        }
        resolve(members)
      })
      res.on('error', reject)
    })
  })
}

/*
 * Fetch the members for the examinator group for this course.
 */
async function getExaminatorMembers (courseCode, ldapClient) {
  return searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseCode.substring(0, 2)}.${courseCode}.examiner))`, ldapClient)
}

async function writeUsersForCourse ({ canvasCourse, ldapClient, fileName }) {
  const ugRoleCanvasRole = [
    { type: 'teachers', role_id: 4},//role: 'teacher' }, //id:4
    { type: 'courseresponsible', role_id: 9},//role: 'Course Responsible' }, //id:9
    { type: 'assistants', role_id: 5}//role: 'ta' } // id:5
  ]

  const roundId = canvasCourse.sisCourseId.slice(-1)

  for (let { type, role_id } of ugRoleCanvasRole) {//role } of ugRoleCanvasRole) {
    const members = await searchGroup(
      `(&(objectClass=group)(CN=edu.courses.${canvasCourse.courseCode.substring(0, 2)}.${canvasCourse.courseCode}.${canvasCourse.startTerm}.${roundId}.${type}))`,
      ldapClient
    )
    const users = await getUsersForMembers(members, ldapClient)
    for (let user of users) {
      await csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, role_id, 'active'], fileName)//role, 'active'], fileName)
    }
  }
  // examinators
  const examinatorMembers = await getExaminatorMembers(canvasCourse.courseCode, ldapClient)
  const examinators = await getUsersForMembers(examinatorMembers, ldapClient)
  for (let user of examinators) {
    await csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, 'Examiner', 'active'], fileName)
  }

  // Registered students
  try {
    let lengthOfInitials
    if (canvasCourse.courseCode.length > 6) {
      lengthOfInitials = 3
    } else {
      lengthOfInitials = 2
    }
    const courseInitials = canvasCourse.courseCode.substring(0, lengthOfInitials)
    const courseCodeWOInitials = canvasCourse.courseCode.substring(lengthOfInitials)
    const registeredMembers = await searchGroup(`(&(objectClass=group)(CN=ladok2.kurser.${courseInitials}.${courseCodeWOInitials}.registrerade_${canvasCourse.startTerm}.${roundId}))`, ldapClient)
    const registeredStudents = await getUsersForMembers(registeredMembers, ldapClient)
    for (let user of registeredStudents) {
      await csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, 'Student', 'active'], fileName)
    }
  } catch (err) {
    logger.info(err, 'Could not get registered students for this course. Perhaps there are no students?')
  }
}

module.exports = async function ({ term, year, period, canvasCourses }) {
  const ldapClient = ldap.createClient({
    url: process.env.UG_URL
  })
  const ldapClientBindAsync = util.promisify(ldapClient.bind).bind(ldapClient)
  await ldapClientBindAsync(process.env.UG_USERNAME, process.env.UG_PWD)

  const termin = `${year}${term}`
  const fileName = `${process.env.CSV_DIR}enrollments-${termin}-${period}.csv`
  await deleteFile(fileName)
  await csvFile.writeLine([
    'section_id',
    'user_id',
    'role_id',//'role',
    'status'
  ], fileName)

  for (let canvasCourse of canvasCourses) {
    await writeUsersForCourse({ canvasCourse, ldapClient, fileName })
  }

  const ldapClientUnbindAsync = util.promisify(ldapClient.unbind).bind(ldapClient)
  await ldapClientUnbindAsync()
  return fileName
}
