const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const writeLine = sinon.stub().returns(Promise.resolve())
const createSectionsFile = proxyquire('../../../createSectionsFile', {
  './csvFile': {writeLine}
})

test('should write a file with a section for each course', t => {
  t.plan(2)
  const courses = [
      {
        sisCourseId:'SIS_COURSE_ID',
        courseCode: 'AL2140',
        longName: 'A LONG NAME'
      }
  ]
  createSectionsFile(courses, 'fileName.csv').then(result => {
    const firstCallArgs = writeLine.getCall(0).args
    t.deepEqual([firstCallArgs[0], firstCallArgs[1]], [['section_id', 'course_id', 'name', 'status'], 'fileName.csv'])

    const secondCallArgs = writeLine.getCall(1).args
    t.deepEqual([secondCallArgs[0], secondCallArgs[1]], [['SIS_COURSE_ID', 'SIS_COURSE_ID', `Section for the course A LONG NAME`, 'active'], 'fileName.csv'])
  })
})
