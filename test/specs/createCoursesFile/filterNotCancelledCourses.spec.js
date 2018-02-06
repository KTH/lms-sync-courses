const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterCourseOfferings = createCoursesFile.__get__('filterCourseOfferings')

test('should remove courserounds that has no state: Fullsatt', t => {
  const courseOfferings = [
      {state: 'CANCELLED'},
      {state: 'Fullsatt'},
  ]

  const expected = [
      {state: 'Fullsatt'},
  ]

  t.deepEqual(filterCourseOfferings(courseOfferings), expected)
  t.end()
})


test('should not remove courserounds that has state: Godkänt', t => {
  const courseOfferings = [
      {state: 'CANCELLED'},
      {state: 'Godkänt'}
  ]

  const expected = [
      {state: 'Godkänt'}
  ]

  t.deepEqual(filterCourseOfferings(courseOfferings), expected)
  t.end()
})
