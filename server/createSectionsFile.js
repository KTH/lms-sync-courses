const csvFile = require('./csvFile')
const Promise = require('bluebird')
const {deleteFile} = require('./utils')

const columns = ['section_id', 'course_id', 'name', 'status']

module.exports = async function ({canvasCourses, term, year, period}) {
  const fileName = `${process.env.csvDir}sections-${year}${term}-${period}.csv`

  await deleteFile(fileName)
  await csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName)

  for (const canvasCourse of canvasCourses) {
    await csvFile.writeLine([
      canvasCourse.sisCourseId,
      canvasCourse.sisCourseId,
      `Section for the course ${canvasCourse.longName}`,
      'active'], fileName)
  }

  return fileName
}
