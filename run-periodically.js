const logger = require('./server/logger')
const createCoursesFile = require('./old/createCoursesFile')
const createEnrollmentsFile = require('./old/createEnrollmentsFile')
const CanvasApi = require('kth-canvas-api')
const schedule = require('node-schedule')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)
canvasApi.logger = logger
const moment = require('moment')
async function runCourseSync (job) {
  job.cancel()
  try {
    logger.info('sync...')
    await syncCourses()
    job.reschedule(cronTime)
  } catch (e) {
    logger.error('Nånting är trasigt, try again', e)
    // In case of error, run more often until it's successful
    job.reschedule(process.env.errorSchedule || '15 * * * *')
  }
}
async function syncCourses () {
  createCoursesFile.koppsBaseUrl = process.env.koppsBaseUrl

  const currentYear = moment().year()
  for (let year of [currentYear, currentYear + 1]) {
    // [HT]: ['0', '1', '2'],
    // [VT]: ['3', '4', '5']\
    // 'VT':1,
    // 'HT':2,
    for (let {term, period} of [{term: 1, period: 3}, {term: 2, period: 0}]) {
      logger.info(`creating sis files for year: ${year}, term: ${term}, period: ${period}`)

      const [coursesFileName, sectionsFileName] = await createCoursesFile.createCoursesFile({term, year, period, csvDir: process.env.csvDir})

      // Courses and sections files are com
      logger.info('About to send the first csv file, courses')
      const canvasReturnCourse = await canvasApi.sendCsvFile(coursesFileName, true)
      logger.info('Done sending courses', canvasReturnCourse)

      const canvasReturnSection = await canvasApi.sendCsvFile(sectionsFileName, true)
      logger.info('Done sending sections', canvasReturnSection)

      const enrollmentsFileName = await createEnrollmentsFile({
        ugUsername: process.env.ugUsername,
        ugUrl: process.env.ugUrl,
        ugPwd: process.env.ugPwd,
        term,
        year,
        period,
        csvDir: process.env.csvDir
      })

      const canvasReturnEnroll = await canvasApi.sendCsvFile(enrollmentsFileName, true)
      logger.info('Done sending enrollments', canvasReturnEnroll)
    }
  }
}

module.exports = {
  async start () {
    const cronTime = process.env.successfulSchedule || '2 * * *'

    logger.info('scheduling job with interval: ', cronTime)
    const job = schedule.scheduleJob(cronTime, async function () {
      await runCourseSync(job)
    })
  }
}
