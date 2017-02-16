const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')
const moment = require('moment')

test('should not fail on empty arrays', t => {
  t.plan(1)
  const courseRounds = [[]]

  const result = buildCanvasCourseObjects(courseRounds)

  const expected = [[]]

  t.deepEqual(result, expected)
})

test('should create course objects containing attributes needed for creating the course in canvas ', t => {
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

  const expected = [[
    {
      sisCourseId: 'abc123',
      shortName: 'shortName',
      longName: 'Långt namn',
      startDate: aDate,
      sisAccountId: 'sis account id',
      status: 'active'
    }
  ]]

  t.deepEqual(result, expected)
})
