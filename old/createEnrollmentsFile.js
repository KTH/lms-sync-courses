const Promise = require('bluebird')
const ldap = require('ldapjs')
const fs = Promise.promisifyAll(require('fs'))
const csvFile = require('./csvFile')
const logger = require('../server/logger')
const {deleteFile} = require('./utils');
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
        res.on('searchEntry', ({object}) => users.push(object))
        res.on('end', () => resolve(users))
        res.on('error', reject)
      }))
  })
    .then(flatten)
}

function flatten (arr) {
  return [].concat.apply([], arr)
}

function searchGroup (filter, ldapClient) {
  return ldapClient.searchAsync('OU=UG,DC=ug,DC=kth,DC=se', {
    scope: 'sub',
    filter,
    timeLimit: 11,
    paged: true
  })
    .then(res => new Promise((resolve, reject) => {
      res.on('searchEntry', ({object}) => resolve(object.member)) // We will get one result for the group where querying for
      res.on('end', ({object}) => resolve(object && object.member))
      res.on('error', reject)
    }))
    .then(member => {
    // Always use arrays as result
      if (typeof member === 'string') {
        return [member]
      } else {
        return member || []
      }
    })
}

/*
* Fetch the members for the examinator group for this course.
* Return a similar array as the in-parameter, with the examinators added
*/
function addExaminators ([teachersMembers, assistantsMembers, courseresponsibleMembers], courseCode, ldapClient) {
  const courseInitials = courseCode.substring(0, 2)
  return searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseInitials}.${courseCode}.examiner))`, ldapClient)
    .then(examinatorMembers => {
      return [teachersMembers, assistantsMembers, courseresponsibleMembers, examinatorMembers]
    })
}

/*
* Fetch the members for the examinator group for this course.
* Return a similar array as the in-parameter, with the examinators added
*/
function addAdmittedStudents ([teachersMembers, assistantsMembers, courseresponsibleMembers, examinatorMembers], courseCode, termin, sisCourseId) {
  const startTerm = termin.replace(':', '')
  const roundId = sisCourseId.substring(sisCourseId.length - 1, sisCourseId.length)
  const courseInitials = courseCode.substring(0, 2)
  const courseCodeLast = courseCode.substring(2)
  return searchGroup(`(&(objectClass=group)(CN=ladok2.kurser.${courseInitials}.${courseCodeLast}.antagna_${startTerm}.${roundId}))`)
    .then(admittedStudents => {
      return [teachersMembers, assistantsMembers, courseresponsibleMembers, examinatorMembers, admittedStudents]
    })
}

async function writeUsersForCourse ({canvasCourse, termin, ldapClient, fileName}) {
  function writeUsers (users, role) {
    return Promise.map(users, user => csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, role, 'active'], fileName))
  }

  for (let type of ['teachers', 'assistants', 'courseresponsible']) {
    const courseInitials = canvasCourse.courseCode.substring(0, 2)
    const startTerm = termin.replace(':', '')
    const roundId = canvasCourse.sisCourseId.substring(canvasCourse.sisCourseId.length - 1, canvasCourse.sisCourseId.length)

    const arrayOfMembers = await searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseInitials}.${canvasCourse.courseCode}.${canvasCourse.startTerm}.${canvasCourse.roundId}.${type}))`, ldapClient)
    await addExaminators(arrayOfMembers, canvasCourse.courseCode, ldapClient)
    await addAdmittedStudents(arrayOfMembers, courseCode, termin, sisCourseId)
    for (let members of arrayOfMembers) {
      const [
        teachers,
        assistants,
        courseresponsible,
        examinators
      /*, admittedStudents */] = await getUsersForMembers(members, ldapClient)
      await writeUsers(teachers, 'teacher')
      await writeUsers(courseresponsible, 'Course Responsible')
      await writeUsers(assistants, 'ta')
      await writeUsers(examinators, 'Examiner')
    }
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
