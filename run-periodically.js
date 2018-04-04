const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const year = '2018'
const term = '1'
const period = '5'
const CanvasApi = require('kth-canvas-api')
const schedule = require('node-schedule')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)
canvasApi.logger = logger
const cronTime = '2 * * *'

async function runCourseSync(job) {
  job.cancel()
  try {
    logger.info('sync...')
    await syncCourses()
    job.reschedule(cronTime)
  }
  catch(e) {
    logger.info("Nånting är trasigt, try again", e)
    // IN case of error, run more often until it's successful
    job.reschedule('1 * * * *')

  }
}
async function syncCourses(){
  createCoursesFile.koppsBaseUrl = process.env.koppsBaseUrl
  const [coursesFileName, sectionsFileName] = await createCoursesFile.createCoursesFile({term, year, period, csvDir:process.env.csvDir})

  // Courses and sections files are complete, send them to canvas regardless of if we can create enrollmentsfile or not.
  const canvasReturnCourse = await canvasApi.sendCsvFile(coursesFileName, true)
  logger.info("Done sending courses", canvasReturnCourse)

  const canvasReturnSection = await canvasApi.sendCsvFile(sectionsFileName, true)
  logger.info("Done sending sections", canvasReturnSection)

  const enrollmentsFileName = await createEnrollmentsFile({
    ugUsername:process.env.ugUsername,
    ugUrl:process.env.ugUrl,
    ugPwd:process.env.ugPwd,
    term,
    year,
    period,
    csvDir:process.env.csvDir
  })

  const canvasReturnEnroll = await canvasApi.sendCsvFile(enrollmentsFileName, true)
  logger.info("Done sending enrollments", canvasReturnEnroll)
}


module.exports = {
  async start () {
    const job = schedule.scheduleJob(cronTime, async function(){
      await runCourseSync(job)
    })
  }
}
