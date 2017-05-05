const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterNotCancelledCourses = createCoursesFile.__get__('filterNotCancelledCourses')

test.only('should remove courserounds that has stateCode: CANCELLED', t => {
  const courseRounds = [
    [
      {stateCode: 'CANCELLED'},
      {stateCode: 'FULL'},
      {}
    ]
  ]

  const expected = [
    [
      {stateCode: 'FULL'},
      {}
    ]
  ]

  t.deepEqual(filterNotCancelledCourses(courseRounds), expected)
  t.end()
})
