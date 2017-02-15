const test = require('tape')
const sinon = require('sinon')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const writeCsvFile = createCoursesFile.__get__('writeCsvFile')
const csvFile = createCoursesFile.__get__('csvFile')
csvFile.writeLine = sinon.stub()
test.only('should call buildCanvasCourseObjects to rebuild the input to a format that is easier to handle', t => {
  t.plan(1)

  const buildCanvasCourseObjects = sinon.stub()
  createCoursesFile.__set__('buildCanvasCourseObjects', buildCanvasCourseObjects)
  const courseRounds = [[{ courseCode: 'AL0001'}]]
  writeCsvFile(courseRounds)
  t.ok(buildCanvasCourseObjects.calledWith(courseRounds))
})
