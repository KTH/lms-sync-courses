const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
// const filterByLogic = createCoursesFile.__get__('filterByLogic')

test('should include a course if it only has one course round', t => {
  const courseRounds = [
    {
      round: {courseCode: 'AL2140', roundId: '1'},
      periods: [
        {
          term: '20171',
          number: '1'
        }
      ]
    },
    {
      round: {courseCode: 'MJ2244', roundId: '1'},
      periods: [
        {
          term: '20171',
          number: '2'
        }
      ]
    }]

  const result = filterByLogic(courseRounds, '1')

  const expected = [
    {
      round: {courseCode: 'AL2140', roundId: '1'},
      periods: [
        {
          term: '20171',
          number: '1'
        }
      ]
    }]

  t.deepEqual(result, expected)
  t.end()
})
