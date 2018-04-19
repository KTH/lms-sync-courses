const Promise = require('bluebird')
const ldap = require('ldapjs')
const fs = Promise.promisifyAll(require('fs'))
const csvFile = require('./csvFile')
const logger = require('../server/logger')
const {deleteFile} = require('./utils');
const attributes = ['ugKthid', 'name']
const columns = [
  'section_id',
  'user_id',
  'role',
  'status'
]

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

/*
* For the given course, fetch all user types from UG and add write all of them to the enrollments file
*/
function writeUsersForCourse ({canvasCourse, termin, ldapClient, fileName}) {
  function writeUsers (users, role) {
    return Promise.map(users, user => csvFile.writeLine([canvasCourse.sisCourseId, user.ugKthid, role, 'active'], fileName))
  }

  return Promise.map(['teachers', 'assistants', 'courseresponsible'], type => {
    const courseInitials = canvasCourse.courseCode.substring(0, 2)
    const startTerm = termin.replace(':', '')
    const roundId = canvasCourse.sisCourseId.substring(canvasCourse.sisCourseId.length - 1, canvasCourse.sisCourseId.length)

    return searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseInitials}.${canvasCourse.courseCode}.${canvasCourse.startTerm}.${canvasCourse.roundId}.${type}))`, ldapClient)
  })
    .then(arrayOfMembers => addExaminators(arrayOfMembers, canvasCourse.courseCode, ldapClient))
  // .then(arrayOfMembers => addAdmittedStudents(arrayOfMembers, courseCode, termin, sisCourseId))
    .then(arrayOfMembers => Promise.map(arrayOfMembers, members => getUsersForMembers(members, ldapClient)))
    .then(([teachers, assistants, courseresponsible, examinators /* admittedStudents */]) => Promise.all([
      writeUsers(teachers, 'teacher'),
      writeUsers(courseresponsible, 'Course Responsible'),
      writeUsers(assistants, 'ta'),
      writeUsers(examinators, 'Examiner')
    // writeUsers(admittedStudents, 'Admitted not registered')
    ])
    )
}
//
/*
* Reads the courses file and splits it's content into an array of arrays.
* One array per line, containing one array per column
*/
function getAllCoursesAsLinesArrays () {
  return fs.readFileAsync(coursesFileName, 'utf8')
    .catch(e => console.error('Could not read the courses file. Have you run the npm script for creating the courses csv file? ', e))
    .then(fileContentStr => fileContentStr.split('\n')) // one string per line
    .then(lines => lines.splice(1, lines.length - 2)) // first line is columns, last is new empty line. Ignore them
    .then(lines => lines.map(line => line.split(','))) // split into values per column
}

function createFileAndWriteHeadlines (fileName) {
  return csvFile.writeLine(columns, fileName)
}

module.exports = async function ({term, year, period, canvasCourses}) {
  const ldapClient = Promise.promisifyAll(ldap.createClient({
    url: process.env.ugUrl
  }))
  await ldapClient.bindAsync(process.env.ugUsername, process.env.ugPwd)

  const termin = `${year}${term}`
  const fileName = `${process.env.csvDir}enrollments-${termin}-${period}.csv`
  await deleteFile(fileName)
  await createFileAndWriteHeadlines(fileName)
  for (let canvasCourse of canvasCourses) {
    await writeUsersForCourse({canvasCourse, ldapClient, termin, fileName})
  }
  await ldapClient.unbindAsync()
  return fileName
}
