const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')

// TODO: rebuild this test and impl! It shouldnt have to fetch data again from kopps!
test('should create a course object containing attributes needed for creating the course in canvas ', t => {
  t.plan(1)
  const courseRounds = [
    {
      'round': {
        'courseCode': 'MJ2244',
        'startTerm': '20171',
        'roundId': '1',
        'xmlns': '',
        'startWeek': '2017-03',
        'lang': 'English'
      },
      'periods': [
        {
          'term': '20171',
          'number': '3'
        }
      ]
    }
  ]

  buildCanvasCourseObjects(courseRounds)
  .then(result => {
    const expected = [
      // TODO what do we want it to return? Check the data needed for the last function,
      // writeCsvFile.
      // It should also include lang and startWeek so the logic can filter on the return values
    ]

    t.deepEqual(result, expected)
  })
})
