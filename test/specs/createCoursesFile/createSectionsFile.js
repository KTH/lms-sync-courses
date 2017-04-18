const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const writeLine = sinon.stub().returns(Promise.resolve())
const createSectionsFile = proxyquire('../../../createSectionsFile', {
  './csvFile': {writeLine},
  './utils':{
    buildCanvasCourseObjects(){
      return [[{
        sisCourseId:'SIS_COURSE_ID',
        longName: 'A LONG NAME'
      }]]
    }
  }
})

test('should write a file with a section for each course, and return the courses', t => {
  t.plan(3)
  const courses = [
    [
      {
        courseCode: 'AL2140',
      }
    ]
  ]
  createSectionsFile(courses, 'fileName.csv').then(result => {
    const firstCallArgs = writeLine.getCall(0).args
    t.deepEqual([firstCallArgs[0], firstCallArgs[1]], [['section_id', 'course_id', 'name', 'status'], 'fileName.csv'])

    const secondCallArgs = writeLine.getCall(1).args
    t.deepEqual([secondCallArgs[0], secondCallArgs[1]], [['SIS_COURSE_ID', 'SIS_COURSE_ID', `Section for the course A LONG NAME`, 'active'], 'fileName.csv'])

    t.deepEqual(result, courses)
  })
})
