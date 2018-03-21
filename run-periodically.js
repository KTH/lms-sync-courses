const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const serverSettings = require('./config/serverSettings')
const Zip = require('node-zip')
const fs = require('fs')
const path = require('path')

const year = '2018'
const term = '1'
const period = '3'


async function syncCourses(){
  createCoursesFile.koppsBaseUrl = serverSettings.koppsBaseUrl
  const [coursesFileName, sectionsFileName] = await createCoursesFile.createCoursesFile({term, year, period, csvDir:serverSettings.csvDir})
  const enrollmentsFileName = await createEnrollmentsFile({
    ugUsername:serverSettings.ugUsername, 
    ugUrl:serverSettings.ugUrl, 
    ugPwd:serverSettings.ugPwd, 
    term, 
    year, 
    period, 
    csvDir:serverSettings.csvDir
  })
  console.log('Now: zip them up: ', coursesFileName, enrollmentsFileName, sectionsFileName)
  const zipFileName = `${serverSettings.csvDir}/${year}-${term}-${period}.zip`
  const zip = new Zip()
  zip.file('courses.csv', fs.readFileSync(path.join(__dirname, coursesFileName)))
  zip.file('sections.csv', fs.readFileSync(path.join(__dirname, sectionsFileName)))
  if (enrollmentsFileName) {
    zip.file('enrollments.csv', fs.readFileSync(path.join(__dirname, enrollmentsFileName)))
  }

  const data = zip.generate({ base64: false, compression: 'DEFLATE' })
  fs.writeFileSync(zipFileName, data, 'binary')
  console.log(`The zip file ${zipFileName} is now created. Go to canvas and upload it in SIS Imports.`)
}

module.exports = {
  start () {
    syncCourses()
    //setInterval(syncCourses, 1000)
  }
}
