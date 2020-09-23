const { csvFile } = require('kth-canvas-utilities')
const { deleteFile } = require('./utils')

module.exports = async function ({ canvasCourses, term, year }) {
  const fileName = `${process.env.CSV_DIR}sections-${year}-${term}.csv`

  await deleteFile(fileName)
  await csvFile.writeLine(
    ['section_id', 'course_id', 'integration_id', 'name', 'status'],
    fileName
  )

  for (const canvasCourse of canvasCourses) {
    await csvFile.writeLine(
      [
        canvasCourse.sisCourseId,
        canvasCourse.sisCourseId,
        canvasCourse.integrationId,
        `Section for the course ${canvasCourse.longName}`,
        'active'
      ],
      fileName
    )
  }

  return fileName
}
