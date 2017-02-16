const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const addPeriods = createCoursesFile.__get__('addPeriods')

test.only('should just return courses with periods', t => {
  const xmlForCourseRound = `
  <courseRound>
    <periods>
      <period term="20172" number="2">true</period>
      <period term="20172" number="1">true</period>
    </periods>
  </courseRound>
  `
  createCoursesFile.__set__('get', () => Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRounds = {
  }
  addPeriods(courseRounds).then(result => {
    t.deepEqual(result, {
      periods: [{term: '20172', number: '2'}, {term: '20172', number: '1'}]
    })
  })
})

test('should just return courses with empty array if periods are undefined', t => {
  const xmlForCourseRound = `
  <courseRound>
  </courseRound>
  `
  createCoursesFile.__set__('get', () => Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRound = {
  }
  addPeriods(courseRound).then(result => {
    t.deepEqual(result, {
      periods: []
    })
  })
})
