const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterNotCancelledCourses = createCoursesFile.__get__('filterNotCancelledCourses')

test('should remove courserounds that has stateCode: CANCELLED', t => {
  const courseRounds = [
    [
      {stateCode: 'CANCELLED'},
      {stateCode: 'FULL'}
    ]
  ]

  const expected = [
    [
      {stateCode: 'FULL'}
    ]
  ]

  t.deepEqual(filterNotCancelledCourses(courseRounds), expected)
  t.end()
})


test('should not remove courserounds that has no stateCode', t => {
  const courseRounds = [
    [
      {stateCode: 'CANCELLED'},
      {}
    ]
  ]

  const expected = [
    [
      {}
    ]
  ]

  t.deepEqual(filterNotCancelledCourses(courseRounds), expected)
  t.end()
})
