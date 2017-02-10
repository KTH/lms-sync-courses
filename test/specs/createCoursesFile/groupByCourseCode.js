const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const groupRoundsByCourseCode = createCoursesFile.__get__('groupRoundsByCourseCode')

test.only('should return an array of arrays, with rounds for the same course in the same array', t => {
  const courseRounds = [
    {round: {courseCode: 'EK0001'}},
    {round: {courseCode: 'EK0001'}, periods: []},
    {round: {courseCode: 'EF0002'}, periods: [{}]}
  ]
  const result = groupRoundsByCourseCode(courseRounds)
  const expected = [
    [
      {round: {courseCode: 'EK0001'}},
      {round: {courseCode: 'EK0001'}, periods: []}
    ],
    [
      {round: {courseCode: 'EF0002'}, periods: [{}]}
    ]]

  t.deepEqual(result, expected)
  t.end()
})
