const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const addRoundInfo = createCoursesFile.__get__('addRoundInfo')

test('should just return courses with periods and language and startWeek', t => {
  const xmlForCourseRound = `
  <courseRound xmlns="http://www.kth.se/student/kurser" startWeek="2017-44">
    <tutoringLanguage  xmlns="" xml:lang="en">English</tutoringLanguage>
    <periods xmlns="">
      <period term="20172" number="2">true</period>
      <period term="20172" number="1">true</period>
    </periods>
  </courseRound>
  `
  createCoursesFile.__set__('get', () => Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRounds = {
  }
  addRoundInfo(courseRounds).then(result => {
    t.deepEqual(result, {
      startWeek: '2017-44',
      tutoringLanguage: 'English',
      periods: [{term: '20172', number: '2'}, {term: '20172', number: '1'}]
    })
  })
})

test('should add shortName', t => {
  const xmlForCourseRound = `
  <courseRound>
    <shortName xmlns="">CDATE1 m.fl.</shortName>
  </courseRound>
  `
  createCoursesFile.__set__('get', () => Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRounds = {
  }
  addRoundInfo(courseRounds).then(result => {
    t.equal(result.shortName, 'CDATE1 m.fl.')
  })
})

test('should just return courses with empty array if periods are undefined', t => {
  const xmlForCourseRound = `
  <courseRound xmlns="http://www.kth.se/student/kurser">
  </courseRound>
  `
  createCoursesFile.__set__('get', () => Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRound = {
  }
  addRoundInfo(courseRound).then(result => {
    t.deepEqual(result, {
      periods: []
    })
  })
})
