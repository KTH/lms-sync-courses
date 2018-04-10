const test = require('tape')
const rewire = require('rewire')
const util = rewire('../../../../utils.js')
const createSisCourseId = util.__get__('createSisCourseId')

// let sis_course_id = `${course_code}${_courseTerm(courseRoundObj)}${courseRoundObj.courseRound.$.roundId}`
test('should take a 2d array as input, and return a 1d array', t => {
  const result = createSisCourseId({
    courseCode: 'AL2140',
    startTerm: '20171',
    roundId: '1'
  })

  t.deepEqual(result, 'AL2140VT171')
  t.end()
})
