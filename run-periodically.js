const logger = require('./server/logger')
const createCoursesFile = require('./server/createCoursesFile')
const createEnrollmentsFile = require('./server/createEnrollmentsFile')
const CanvasApi = require('@kth/canvas-api')
const schedule = require('node-schedule')
const canvasApi = new CanvasApi(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_KEY
)
canvasApi.logger = logger
const { getYear } = require('date-fns')
const createSectionsFile = require('./server/createSectionsFile')
const cronTime = process.env.SUCCESSFUL_SCHEDULE || '0 5 * * *'

async function runCourseSync (job) {
  // Cancel, because we only want this job to run once.
  // Then if it fails, we can reschedule to run more often.
  job.cancel()
  try {
    logger.info('~~~~~~~~~~~~~~~~~~~~~~~ sync ~~~~~~~~~~~~~~~~~~~~~~~')
    await syncCoursesSectionsAndEnrollments()
    job.reschedule(cronTime)
    logger.info(
      '^^^^^^^^^^^^^^^^ finished with syncing courses ^^^^^^^^^^^^^^^^^^^'
    )
  } catch (e) {
    const errorCronTime = process.env.ERROR_SCHEDULE || '15 * * * *'
    logger.error(`Something broke, try again with schedule ${errorCronTime}`, e)
    // In case of error, run more often until it's successful
    job.reschedule(errorCronTime)
  }
}

async function syncCoursesSectionsAndEnrollments () {
  const currentYear = getYear(new Date())
  for (const year of [currentYear, currentYear + 1]) {
    for (const term of [1, 2]) {
      logger.info(`creating sis files for year: ${year}, term: ${term}`)

      const courseOfferings = await createCoursesFile.getCourseOfferings({
        term,
        year
      })
      const canvasCourses = createCoursesFile.prepareCoursesForCanvas(
        courseOfferings
      )
      const coursesFileName = await createCoursesFile.createCoursesFile({
        term,
        year,
        canvasCourses
      })
      const coursesResponse = await canvasApi.sendCsvFile(coursesFileName, true)
      logger.info('Done sending courses', coursesResponse)

      const sectionsFileName = await createSectionsFile({
        canvasCourses,
        term,
        year
      })
      const sectionsResponse = await canvasApi.sendCsvFile(
        sectionsFileName,
        true
      )
      logger.info('Done sending sections', sectionsResponse)

      const enrollmentsFileName = await createEnrollmentsFile({
        canvasCourses,
        term,
        year
      })
      const enrollResponse = await canvasApi.sendCsvFile(
        enrollmentsFileName,
        true
      )
      logger.info('Done sending enrollments', enrollResponse)
    }
  }
}

module.exports = {
  async start () {
    try {
      logger.info('initial run of job')
      await syncCoursesSectionsAndEnrollments()
      logger.info('finished initial run of job')
    } catch (e) {
      logger.error('initial run failed, proceeding with standard scheduling', e)
    }
    logger.info('scheduling job with interval: ', cronTime)
    const job = schedule.scheduleJob(cronTime, async function () {
      await runCourseSync(job)
    })
  }
}
