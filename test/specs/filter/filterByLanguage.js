const test = require('tape')
const rewire = require('rewire')
const filterYellowCourses = rewire('../../../filter/filterYellowCourses')
const filterByLanguage = filterYellowCourses.__get__('filterByTutoringLanguage')

test('should exclude courses with multiple rounds where more than 1 course round have the same tutoringLanguage', t => {
  const courseRounds = [
    {
      'tutoringLanguage': 'Swedish'
    },
    {
      'tutoringLanguage': 'Swedish'
    }
  ]

  const result = filterByLanguage(courseRounds)

  const expected = []

  t.deepEqual(result, expected)
  t.end()
})

test('should exclude courses where at least one round has no tutoringLanguage', t => {
  const courseRounds = [
    {
      'tutoringLanguage': 'Swedish'
    },
    {
    }
  ]

  const result = filterByLanguage(courseRounds)

  const expected = []

  t.deepEqual(result, expected)
  t.end()
})
