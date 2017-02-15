const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filterCoursesDuringPeriod = createCoursesFile.__get__('filterCoursesDuringPeriod')

test.only('should include course rounds if the has a period with number == the period argument', t => {
  const courseRounds = [
    [
      {
        courseCode: 'AL2140',
        roundId: '1',
        periods: [
          {
            term: '20171',
            number: '1'
          }
        ]
      },{
        courseCode: 'AL2141',
        roundId: '1',
        periods: [
          {
            term: '20171',
            number: '2'
          }
        ]
      }
    ]
  ]

  const result = filterCoursesDuringPeriod(courseRounds, '1')

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
