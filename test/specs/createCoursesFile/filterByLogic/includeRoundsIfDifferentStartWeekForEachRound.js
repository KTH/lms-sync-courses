const test = require('tape')
const rewire = require('rewire')
const filterByLogic = rewire('../../../../filterByLogic.js')
const includeRoundsIfDifferentStartWeekForEachRound = filterByLogic.__get__('includeRoundsIfDifferentStartWeekForEachRound')

test('should include all rounds if all the rounds has different startWeek', t => {
  const courseRounds = [
    {
      startWeek: '2017-04'
    },
    {
      startWeek: '2017-03'
    }
  ]

  const result = includeRoundsIfDifferentStartWeekForEachRound(courseRounds)
  t.deepEqual(courseRounds, result)
  t.end()
})

test.only('should skip all rounds if any two rounds has the same startWeek', t => {
  const courseRounds = [
    {
      startWeek: '2017-03'
    },
    {
      startWeek: '2017-03'
    },
    {
      startWeek: '2017-04'
    }
  ]

  const result = includeRoundsIfDifferentStartWeekForEachRound(courseRounds)
  t.deepEqual(result, [])
  t.end()
})
