const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')
const moment = require('moment')

test('should skip empty arrays', t => {
  t.plan(1)
  const courseRounds = [[]]

  const result = buildCanvasCourseObjects(courseRounds)

  const expected = []

  t.deepEqual(result, expected)
})

test.only('should create a flat array of course object containing attributes needed for creating the course in canvas ', t => {
  t.plan(1)
  const aDate = '2001-01-01'

  createCoursesFile.__set__('createSisCourseId', () => 'abc123')
  createCoursesFile.__set__('createLongName', () => 'Långt namn')
  createCoursesFile.__set__('getSisAccountId', () => 'sis account id')
  createCoursesFile.__set__('calcStartDate', () => aDate)

  const courseRounds = [
    [
      {
        shortName: 'shortName'
      }
    ]]

  const result = buildCanvasCourseObjects(courseRounds)

  const expected = [
    {
      course_id: 'abc123',
      short_name: 'shortName',
      long_name: 'Långt namn',
      start_date: aDate,
      account_id: 'sis account id',
      status: 'active'
    }
  ]

  t.deepEqual(result, expected)
})
