const util = require('util')
const ldap = require('ldapjs')
const {csvFile} = require('kth-canvas-utilities')
const {deleteFile} = require('./utils')
const attributes = ['ugKthid', 'name']

/*
 * For string array with ldap keys for users, fetch every user object
 */
async function getUsersForMembers (members, ldapClient) {
  const usersForMembers = []
  for (let member of members) {
    const searchResult = await new Promise((resolve, reject) => {
      ldapClient.search('OU=UG,DC=ug,DC=kth,DC=se', {
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
    ldapClient.search('OU=UG,DC=ug,DC=kth,DC=se', {
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
  const courseInitials = courseCode.length > 6 ? courseCode.substring(0, 3) : courseCode.substring(0, 2)
  return searchGroup(`(&(objectClass=group)(CN=edu.courses.${courseInitials}.${courseCode}.examiner))`, ldapClient)
}

async function writeUsersForCourse ({canvasCourse, ldapClient, fileName}) {
  const courseInitials = canvasCourse.courseCode.length > 6 ? canvasCourse.courseCode.substring(0, 3) : canvasCourse.courseCode.substring(0, 2)

  const ugRoleCanvasRole = [
    {type: 'teachers', role: 'teacher'},
    {type: 'courseresponsible', role: 'Course Responsible'},
    {type: 'assistants', role: 'ta'}
  ]

  const roundId = canvasCourse.sisCourseId.slice(-1)

  for (let {type, role} of ugRoleCanvasRole) {
    const members = await searchGroup(
      `(&(objectClass=group)(CN=edu.courses.${courseInitials}.${canvasCourse.courseCode}.${canvasCourse.startTerm}.${roundId}.${type}))`,
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
  const ldapClient = ldap.createClient({
    url: process.env.ugUrl
  })
  const ldapClientBindAsync = util.promisify(ldapClient.bind).bind(ldapClient)
  await ldapClientBindAsync(process.env.ugUsername, process.env.ugPwd)

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
    await writeUsersForCourse({canvasCourse, ldapClient, fileName})
  }

  const ldapClientUnbindAsync = util.promisify(ldapClient.unbind).bind(ldapClient)
  await ldapClientUnbindAsync()
  return fileName
}
