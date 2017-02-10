const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterByLogic = createCoursesFile.__get__('filterByLogic')

test('should include a course if it only has one course round', t => {
  const courseRounds = [
    [
      {
        'course': {
          'course': {}
        },
        'sisAccountId': 'ITM - Imported course rounds',
        'courseRound': {}
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})

test('should include a course if it has multiple rounds, each with different start weeks', t => {
  const courseRounds = [
    [
      {
        course: {course: {}},
        courseRound: {startWeek: '2017-03'}
      },
      {
        course: {course: {}},
        courseRound: {startWeek: '2017-04'}
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})
