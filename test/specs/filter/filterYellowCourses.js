const test = require('tape')
const rewire = require('rewire')
const filterYellowCourses = rewire('../../../filter/filterYellowCourses')

test('should include all rounds if all the rounds has different startWeek', t => {
  const courseRounds = [[
    {
      startWeek: '2017-04'
    },
    {
      startWeek: '2017-03'
    }
  ]]

  const result = filterYellowCourses(courseRounds)
  t.deepEqual(courseRounds, result)
  t.end()
})

test('should skip all rounds if any two rounds has the same startWeek', t => {
  const courseRounds = [[
    {
      startWeek: '2017-03'
    },
    {
      startWeek: '2017-03'
    },
    {
      startWeek: '2017-04'
    }
  ]]

  const result = filterYellowCourses(courseRounds)
  t.deepEqual(result, [[]])
  t.end()
})
