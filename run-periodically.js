const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const serverSettings = require('./config/serverSettings')
const year = '2018'
const term = '1'
const period = '3'


async function syncCourses(){
  createCoursesFile.koppsBaseUrl = serverSettings.koppsBaseUrl
  await createCoursesFile.createCoursesFile({term, year, period})
}

module.exports = {
  start () {
    syncCourses()
    //setInterval(syncCourses, 1000)
  }
}
