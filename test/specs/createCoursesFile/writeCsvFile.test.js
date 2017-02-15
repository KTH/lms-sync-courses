const test = require('tape')
const sinon = require('sinon')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const writeCsvFile = createCoursesFile.__get__('writeCsvFile')
const csvFile = createCoursesFile.__get__('csvFile')
const fs = createCoursesFile.__get__('fs')
fs.mkdirAsync = () => Promise.resolve()

csvFile.writeLine = sinon.stub()

test('should call buildCanvasCourseObjects to rebuild the input to a format that is easier to handle', t => {
  t.plan(1)

  const buildCanvasCourseObjects = sinon.stub()
  createCoursesFile.__set__('buildCanvasCourseObjects', buildCanvasCourseObjects)
  const courseRounds = [[{ courseCode: 'AL0001'}]]
  writeCsvFile(courseRounds)
  t.ok(buildCanvasCourseObjects.calledWith(courseRounds))
})

test('should write a line with the headers', t => {
  t.plan(1)
  createCoursesFile.__set__('buildCanvasCourseObjects', arg => [])
  const courseRounds = [[{ courseCode: 'AL0001'}]]

  writeCsvFile(courseRounds, 'fileName').then(() => {
    t.ok(csvFile.writeLine.calledWith(['course_id', 'short_name', 'long_name', 'start_date', 'account_id', 'status'], 'fileName'))
  })
})

test('should write a line for each course', t => {
  t.plan(1)
  createCoursesFile.__set__('buildCanvasCourseObjects', arg => [{sisCourseId: '1', shortName: 'shortName', longName: 'longName', startDate: 'startDate', sisAccountId: 'sisAccountId'}])
  const courseRounds = [[{ courseCode: 'AL0001'}]]

  writeCsvFile(courseRounds, 'fileName').then(() => {
    const secondCallArgs = csvFile.writeLine.getCall(1).args[0]
    console.log(secondCallArgs)
    t.deepEqual(secondCallArgs, ['1', 'shortName', 'longName', 'startDate', 'sisAccountId', 'active'])
  }).catch(e => console.error(e))
})
