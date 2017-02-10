const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const groupRoundsByCourseCode = createCoursesFile.__get__('groupRoundsByCourseCode')

test('should return an array of arrays, with rounds for the same course in the same array', t => {
  const courseRounds = [
    {courseCode: 'AL0001'},
    {courseCode: 'AL0001', startTerm: '20171'},
    {courseCode: 'AL0002'}
  ]

  const result = groupRoundsByCourseCode(courseRounds)

  const expected = [
    [
      {courseCode: 'AL0001'},
      {courseCode: 'AL0001', startTerm: '20171'}
    ],
    [
      {courseCode: 'AL0002'}
    ]]

  t.deepEqual(result, expected)
  t.end()
})
