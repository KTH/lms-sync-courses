const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const year = '2018'
const term = '1'
const period = '5'
const CanvasApi = require('kth-canvas-api')
const schedule = require('node-schedule')
const Promise = require('bluebird')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)
canvasApi.logger = logger


async function runCourseSync() {
  try {
    logger.info('sync...')
    await syncCourses()
  }
  catch(e) {
    logger.info("Nånting är trasigt, try again", e)
    //setTimeout(runCourseSync, 1000 * 6 * 10) // Try again in a while
    //delay 1 minute
    // return try again
    await Promise.delay(10000)
    return await runCourseSync()
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
    const cronTime = '* * * * * *'
    const job = schedule.scheduleJob(cronTime, async function(){
      console.log(`



        ---------------------





        `)
      job.cancel() // Run once, to avoid multiple parallell jobs
      await runCourseSync() // Retries until successful
      job.reschedule(cronTime)
    })
  }
}
