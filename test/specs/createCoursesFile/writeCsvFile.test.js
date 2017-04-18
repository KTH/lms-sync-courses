const test = require('tape')
const sinon = require('sinon')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const writeCsvFile = createCoursesFile.__get__('writeCsvFile')
const csvFile = createCoursesFile.__get__('csvFile')
csvFile.writeLine = sinon.stub()

createCoursesFile.__set__('mkdirAsync', () => Promise.resolve())

test.skip('should write a line with the headers, and one for each course', t => {
  t.plan(2)
  createCoursesFile.__set__('buildCanvasCourseObjects', arg => [
    {sisCourseId: 'sisCourseId',
      courseCode: 'courseCode',
      shortName: 'shortName',
      longName: 'longName',
      startDate: 'startDate',
      sisAccountId: 'sisAccountId'}])
  const courseRounds = [[{ courseCode: 'AL0001'}]]

  writeCsvFile(courseRounds, 'fileName').then(() => {
    t.ok(csvFile.writeLine.calledWith(['course_id', 'short_name', 'long_name', 'start_date', 'account_id', 'status'], 'fileName'))
    t.ok(csvFile.writeLine.calledWith(['sisCourseId', 'courseCode', 'longName', 'startDate', 'sisAccountId', 'active'], 'fileName'))
  })
})
