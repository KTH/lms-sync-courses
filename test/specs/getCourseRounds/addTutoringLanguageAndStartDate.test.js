const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const addTutoringLanguageAndStartDate = createCoursesFile.__get__('addTutoringLanguageAndStartDate')

test('should just return courses without any periods', t => {
  const xmlForCourseRound = `
  <courseRound>
    <periods></periods>
  </courseRound>
  `
  createCoursesFile.__set__('get', ()=>Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRounds = [
    {
      courseCode: 'ML1000',
      startTerm: '20172',
      roundId: '1'
    }]
    addTutoringLanguageAndStartDate(courseRounds, '2017:1').then(result =>{
        t.deepEqual(result, courseRounds)
    })
})

test.only('should just return courses where periods is undefined', t => {
  const xmlForCourseRound = `
  <courseRound>
  </courseRound>
  `
  createCoursesFile.__set__('get', ()=>Promise.resolve(xmlForCourseRound))
  t.plan(1)
  const courseRounds = [
    {
      courseCode: 'ML1000',
      startTerm: '20172',
      roundId: '1'
    }]
    addTutoringLanguageAndStartDate(courseRounds, '2017:1').then(result =>{
        t.deepEqual(result, courseRounds)
    })
})
