const got = require('got')
const { buildCanvasCourseObjectV2, deleteFile } = require('./utils')
const { csvFile } = require('kth-canvas-utilities')
const logger = require('../server/logger')

async function createCsvFile (fileName) {
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'integration_id',
    'status'
  ]

  return csvFile.writeLine(columns, fileName)
}

function createCourseOfferingObj (courseOffering) {
  return {
    courseCode: courseOffering.course_code,
    startTerm: courseOffering.first_yearsemester,
    roundId: courseOffering.offering_id,
    startSemester: courseOffering.offered_semesters.filter(
      s => s.semester === courseOffering.first_yearsemester
    )[0], // take start_Week for whole course
    shortName: courseOffering.short_name,
    tutoringLanguage: courseOffering.language,
    departmentCode: courseOffering.department_code,
    schoolCode: courseOffering.school_code,
    integrationId: courseOffering.course_round_applications[0].ladok_uid,
    title: {
      sv: courseOffering.course_name,
      en: courseOffering.course_name_en
    }
  }
}

module.exports = {
  prepareCoursesForCanvas (courseOfferings) {
    // Re-map the objects from Kopps to objects more similar to CanvasApi
    const courseOfferingObjects = courseOfferings.map(createCourseOfferingObj)

    // Create a new object with sis_id, long name and short name
    return courseOfferingObjects.map(buildCanvasCourseObjectV2)
  },

  async getCourseOfferings ({ term, year }) {
    const { body } = await got(
      `${process.env.KOPPS_BASE_URL}v2/courses/offerings?from=${year}${term}&skip_coordinator_info=true`,
      {
        json: true
      }
    )

    const acceptedCourses = body.filter(
      courseOffering =>
        courseOffering.state === 'Godkänt' ||
        courseOffering.state === 'Fullsatt'
    )
    const invalidCourseRounds = acceptedCourses.filter(
      courseOffering => !/^\d+$/.test(courseOffering.offering_id)
    )

    if (invalidCourseRounds.length > 0) {
      logger.error(`Found ${invalidCourseRounds.length} invalid course rounds.`)
    }
    return acceptedCourses
  },

  async createCoursesFile ({ term, year, canvasCourses }) {
    const csvDir = process.env.CSV_DIR
    const coursesFileName = `${csvDir}courses-${year}-${term}.csv`
    logger.info('Using file name:', coursesFileName)
    await deleteFile(coursesFileName)
    await createCsvFile(coursesFileName)
    logger.info('Calling kopps...')

    for (const course of canvasCourses) {
      await csvFile.writeLine(
        [
          course.sisCourseId,
          course.sisCourseId,
          course.longName,
          course.startDate,
          course.sisAccountId,
          course.integrationId,
          'active'
        ],
        coursesFileName
      )
    }

    return coursesFileName
  }
}
