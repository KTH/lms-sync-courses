const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')

// TODO: rebuild this test and impl! It shouldnt have to fetch data again from kopps!
test.skip('should create a course object containing attributes needed for creating the course in canvas ', t => {
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
      {'course': {
        'course': {
          'name': 'VT17-1 Airbreathing Propulsion, Intermediate Course I',
          'course_code': 'MJ2244',
          'sis_course_id': 'MJ2244VT171'
        }
      },
        'sisAccountId': 'ITM - Imported course rounds',
        shortName: undefined,
        'courseRound': {
          'courseCode': 'MJ2244',
          'startTerm': '20171',
          'roundId': '1',
          'startWeek': '2017-03',
          'endWeek': '2017-11',
          'startWeek': '2017-03',
          'lang': 'English',
          'xmlns': 'http://www.kth.se/student/kurser'}}
    ]

    // Ignore start_at since it creates a new date
    delete result[0].course.course.start_at
    t.deepEqual(result, expected)
  })
})
