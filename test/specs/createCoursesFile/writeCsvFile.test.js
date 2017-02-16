const test = require('tape')
const sinon = require('sinon')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const writeCsvFile = createCoursesFile.__get__('writeCsvFile')
const csvFile = createCoursesFile.__get__('csvFile')
const fs = createCoursesFile.__get__('fs')
fs.mkdirAsync = () => Promise.resolve()

test('should call buildCanvasCourseObjects to rebuild the input to a format that is easier to handle', t => {
  t.plan(1)

  const buildCanvasCourseObjects = sinon.stub()
  createCoursesFile.__set__('buildCanvasCourseObjects', buildCanvasCourseObjects)
  const courseRounds = [[{ courseCode: 'AL0001'}]]
  writeCsvFile(courseRounds)
  t.ok(buildCanvasCourseObjects.calledWith(courseRounds))
})

test('should write a line with the headers, and one for each course', t => {
  t.plan(2)
  createCoursesFile.__set__('buildCanvasCourseObjects', arg => [
    {sisCourseId: 'sisCourseId',
    courseCode: 'courseCode',
    shortName: 'shortName',
    longName: 'longName',
    startDate: 'startDate',
    sisAccountId: 'sisAccountId'}])
  const courseRounds = [[{ courseCode: 'AL0001'}]]
  csvFile.writeLine = sinon.stub()

  writeCsvFile(courseRounds, 'fileName').then(() => {
    t.ok(csvFile.writeLine.calledWith(['course_id', 'short_name', 'long_name', 'start_date', 'account_id', 'status'], 'fileName'))
    t.ok(csvFile.writeLine.calledWith(['1', 'courseCode', 'longName', 'startDate', 'sisAccountId', 'active'], 'fileName'))
  })
})
