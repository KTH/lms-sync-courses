const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterCourseOfferings = createCoursesFile.__get__('filterCourseOfferings')

test('should include a course round if it has a first_period with number == the period argument', t => {
  const courseOfferings = [
    {
      state: "Godkänt",
      first_period: "20172P2"
    },

    {
      state: "Godkänt",
      first_period: "20181P3",
      }
  ]

  const result = filterCourseOfferings(courseOfferings, '2018', '1', '3')

  const expected = [{
    state: "Godkänt",
    first_period: "20181P3",
    }]

  t.deepEqual(result, expected)
  t.end()
})
