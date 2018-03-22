const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const Zip = require('node-zip')
const fs = require('fs')
const path = require('path')

const year = '2018'
const term = '1'
const period = '5'
const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)

async function runCourseSync() {
  try {
    console.log('sync...')
    await syncCourses()
  }
  catch(e) {
    console.log("Nånting är tråsig", e)
  }
  finally {
    console.log('schedule a sync in a while...')
    setTimeout(runCourseSync, 6000)
  }
}
async function syncCourses(){
  createCoursesFile.koppsBaseUrl = process.env.koppsBaseUrl
  const [coursesFileName, sectionsFileName] = await createCoursesFile.createCoursesFile({term, year, period, csvDir:process.env.csvDir})
  const enrollmentsFileName = await createEnrollmentsFile({
    ugUsername:process.env.ugUsername, 
    ugUrl:process.env.ugUrl, 
    ugPwd:process.env.ugPwd, 
    term, 
    year, 
    period, 
    csvDir:process.env.csvDir
  })
  console.log('Now: zip them up: ', coursesFileName, enrollmentsFileName, sectionsFileName)
  const zipFileName = `${process.env.csvDir}/${year}-${term}-${period}.zip`
  
  // TODO: Async
  const zip = new Zip()
  zip.file('courses.csv', fs.readFileSync(coursesFileName))
  zip.file('sections.csv', fs.readFileSync(sectionsFileName))
  if (enrollmentsFileName) {
    zip.file('enrollments.csv', fs.readFileSync(enrollmentsFileName))
  }

  const data = zip.generate({ base64: false, compression: 'DEFLATE' })
  // TODO: Async!
  fs.writeFileSync(zipFileName, data, 'binary')
  console.log(`The zip file ${zipFileName} is now created. Prepared to be sent to canvas.`)

  const canvasReturnValue = await canvasApi.sendCsvFile(zipFileName, true)
  console.log("Done sending", canvasReturnValue)
}

module.exports = {
  async start () {
    await runCourseSync()
    //setInterval(runCourseSync, 60000)
  }
}
