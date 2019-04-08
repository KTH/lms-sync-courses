const rp = require('request-promise')
const {
  buildCanvasCourseObjectV2,
  deleteFile
} = require('./utils')
const { csvFile } = require('kth-canvas-utilities')
const logger = require('../server/logger')

async function createCsvFile (fileName) {
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'status']

  return csvFile.writeLine(columns, fileName)
}

function createCourseOfferingObj (courseOffering) {
  return {
    courseCode: courseOffering.course_code,
    startTerm: courseOffering.first_yearsemester,
    roundId: courseOffering.offering_id,
    startSemester: courseOffering.offered_semesters.filter(s => s.semester === courseOffering.first_yearsemester)[0], // take start_Week for whole course
    shortName: courseOffering.short_name,
    tutoringLanguage: courseOffering.language,
    departmentCode: courseOffering.department_code,
    schoolCode: courseOffering.school_code,
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
    const res = await rp({
      url: `${process.env.KOPPS_BASE_URL}v2/courses/offerings?from=${year}${term}&skip_coordinator_info=true`,
      method: 'GET',
      json: true,
      headers: { 'content-type': 'application/json' }
    })

    return res.filter(courseOffering => courseOffering.state === 'Godkänt' || courseOffering.state === 'Fullsatt')
  },

  async createCoursesFile ({ term, year, period, canvasCourses }) {
    const csvDir = process.env.CSV_DIR
    const termin = `${year}${term}`
    const coursesFileName = `${csvDir}courses-${termin}-${period}.csv`
    logger.info('Using file name:', coursesFileName)
    await deleteFile(coursesFileName)
    await createCsvFile(coursesFileName)
    logger.info('Calling kopps...')

    for (const course of canvasCourses) {
      await csvFile.writeLine([
        course.sisCourseId,
        course.sisCourseId,
        course.longName,
        course.startDate,
        course.sisAccountId,
        'active'], coursesFileName)
    }

    return coursesFileName
  } }
