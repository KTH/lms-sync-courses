const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const writeLine = sinon.stub().returns(Promise.resolve())
const createSectionsFile = proxyquire('../../../createSectionsFile', {
  './csvFile': {writeLine},
  './createCoursesFile':{
    buildCanvasCourseObjects(){
      return [[{
        sisCourseId:'SIS_COURSE_ID',
        longName: 'A LONG NAME'
      }]]
    }
  }
})

test.only('should write a file with a section for each course, and return the courses', t => {
  // t.plan(2)
  t.plan(3)
  const courses = [
    [
      {
        courseCode: 'AL2140',
        startTerm: '20171',
        startWeek: '2017-03',
        roundId: 'roundId',
        tutoringLanguage: 'Swedish',
        title: {
          sv: 'Renare produktion',
          en: 'Cleaner Production'
        }
      }
    ]
  ]
  createSectionsFile(courses, 'fileName.csv').then(result => {
    const firstCallArgs = writeLine.getCall(0).args
    t.deepEqual([firstCallArgs[0], firstCallArgs[1]], [['section_id', 'course_id', 'name', 'status'], 'fileName.csv'])

    const secondCallArgs = writeLine.getCall(1).args
    t.deepEqual([secondCallArgs[0], secondCallArgs[1]], [['SIS_COURSE_ID_DEFAULT_SECTION', 'SIS_COURSE_ID', `Default section for the course A LONG NAME`, 'active'], 'fileName.csv'])

    t.deepEqual(result, courses)
  })
})
