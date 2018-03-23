const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const year = '2018'
const term = '1'
const period = '5'
const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)
canvasApi.logger = logger

async function runCourseSync() {
  try {
    logger.info('sync...')
    await syncCourses()
  }
  catch(e) {
    logger.info("Nånting är tråsig", e)
  }
  finally {
    logger.info('schedule a sync in a while...')
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
  
  const canvasReturnCourse = await canvasApi.sendCsvFile(coursesFileName, true)
  logger.info("Done sending courses", canvasReturnCourse)

  const canvasReturnSection = await canvasApi.sendCsvFile(sectionsFileName, true)
  logger.info("Done sending sections", canvasReturnSection)

  const canvasReturnEnroll = await canvasApi.sendCsvFile(enrollmentsFileName, true)
  logger.info("Done sending enrollments", canvasReturnEnroll)

}

module.exports = {
  async start () {
    await runCourseSync()
    //setInterval(runCourseSync, 60000)
  }
}
