const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')
const moment = require('moment')

test.only('should skip empty arrays',t =>{

    t.plan(1)
    const courseRounds = [[]]

    const result = buildCanvasCourseObjects(courseRounds)

    const expected = [
      {
        course_id: 'abc123',
        short_name: 'MJ2244',
        long_name: 'Långt namn',
        start_date: now,
        account_id: 'sis account id',
        status: 'active'
      }
    ]

    t.deepEqual(result, expected)

})

test('should create a course object containing attributes needed for creating the course in canvas ', t => {
  t.plan(1)
  const now = '2001-01-01'

  createCoursesFile.__set__('createSisCourseId', () => 'abc123')
  createCoursesFile.__set__('createLongName', () => 'Långt namn')
  createCoursesFile.__set__('getSisAccountId', () => 'sis account id')
  createCoursesFile.__set__('calcStartDate', () => now)

  const courseRounds = [[
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
  ]]

  const result = buildCanvasCourseObjects(courseRounds)

  const expected = [
    {
      course_id: 'abc123',
      short_name: 'MJ2244',
      long_name: 'Långt namn',
      start_date: now,
      account_id: 'sis account id',
      status: 'active'
    }
  ]

  t.deepEqual(result, expected)
})
