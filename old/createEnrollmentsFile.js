const Promise = require('bluebird')
const ldap = require('ldapjs')
const fs = Promise.promisifyAll(require('fs'))
const csvFile = require('./csvFile')
const logger = require('../server/logger')
const {deleteFile} = require('./utils')
const attributes = ['ugKthid', 'name']

/*
* For string array with ldap keys for users, fetch every user object
*/
function getUsersForMembers (members, ldapClient) {
  return Promise.map(members, member => {
    return ldapClient.searchAsync('OU=UG,DC=ug,DC=kth,DC=se', {
      scope: 'sub',
      filter: `(distinguishedName=${member})`,
      timeLimit: 10,
      paging: true,
      attributes,
      paged: {
        pageSize: 1000,
        pagePause: false
      }
    })
      .then(res => new Promise((resolve, reject) => {
        const users = []
        res.on('searchEntry', entry => users.push(entry.object))
        res.on('end', () => resolve(users))
        res.on('error', reject)
      }))
  })
    .then(flatten)
}

function flatten (arr) {
  return [].concat.apply([], arr)
}

async function searchGroup (filter, ldapClient) {
  const res = await ldapClient.searchAsync('OU=UG,DC=ug,DC=kth,DC=se', {
    scope: 'sub',
    filter,
    timeLimit: 11,
    paged: true
  })

  const member = await new Promise((resolve, reject) => {
    res.on('searchEntry', entry => resolve(entry.object.member)) // We will get one result for the group where querying for
    res.on('end', entry => resolve(entry.object && entry.object.member))
    res.on('error', reject)
  })

      // Always use arrays as result
  if (Array.isArray(member)) {
    return member
  } else {
    if (member) {
      return [member]
    } else {
      return []
    }
  }
}

/*
* Fetch the members for the examinator group for this course.
*/
async function getExaminatorMembers (courseCode, ldapClient) {
  const courseInitials = courseCode.substring(0, 2)
  return await searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseInitials}.${courseCode}.examiner))`, ldapClient)
}

async function writeUsersForCourse ({canvasCourse, termin, ldapClient, fileName}) {
  const courseInitials = canvasCourse.courseCode.substring(0, 2)
  const startTerm = termin.replace(':', '')
  const roundId = canvasCourse.sisCourseId.substring(canvasCourse.sisCourseId.length - 1, canvasCourse.sisCourseId.length)

  for (let {type, role} of [{type:'teachers', role: 'teacher'}, {type:'assistants', role: 'ta'}, {type:'courseresponsible', role: 'Course Responsible'}]) {
    const courseInitials = canvasCourse.courseCode.substring(0, 2)
    const startTerm = termin.replace(':', '')
    const roundId = canvasCourse.sisCourseId.substring(canvasCourse.sisCourseId.length - 1, canvasCourse.sisCourseId.length)

    const members = await searchGroup(
      `(&(objectClass=group)(CN=edu.courses.${courseInitials}.${canvasCourse.courseCode}.${startTerm}.${roundId}.${type}))`,
      ldapClient
    )
    const users = await getUsersForMembers(members, ldapClient)
    for (let user of users) {
      await csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, role, 'active'], fileName)
    }
  }
  // examinators
  const examinatorMembers = await getExaminatorMembers(canvasCourse.courseCode, ldapClient)
  const examinators = await getUsersForMembers(examinatorMembers, ldapClient)
  for (let user of examinators) {
    await csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, 'Examiner', 'active'], fileName)
  }
}

module.exports = async function ({term, year, period, canvasCourses}) {
  const ldapClient = Promise.promisifyAll(ldap.createClient({
    url: process.env.ugUrl
  }))
  await ldapClient.bindAsync(process.env.ugUsername, process.env.ugPwd)

  const termin = `${year}${term}`
  const fileName = `${process.env.csvDir}enrollments-${termin}-${period}.csv`
  await deleteFile(fileName)
  await csvFile.writeLine([
    'section_id',
    'user_id',
    'role',
    'status'
  ], fileName)

  for (let canvasCourse of canvasCourses) {
    await writeUsersForCourse({canvasCourse, ldapClient, termin, fileName})
  }
  await ldapClient.unbindAsync()
  return fileName
}
