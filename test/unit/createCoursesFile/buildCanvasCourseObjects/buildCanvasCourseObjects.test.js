const test = require('tape')
const rewire = require('rewire')
const utils = rewire('../../../../server/utils')

test('should create course object containing attributes needed for creating the course in canvas ', t => {
  t.plan(1)
  const aDate = '2001-01-01'

  utils.__set__('createSisCourseId', () => 'abc123')
  utils.__set__('createLongName', () => 'Långt namn')
  utils.__set__('calcStartDate', () => aDate)

  const courseRound = {
      schoolCode: 'ABE',
    courseCode: 'courseCode',
    shortName: 'shortName'
  }

  const result = utils.buildCanvasCourseObjectV2(courseRound)

  const expected = {
    sisCourseId: 'abc123',
    courseCode: 'courseCode',
    shortName: 'shortName',
    longName: 'Långt namn',
    startDate: aDate,
    sisAccountId: 'ABE - Imported course rounds',
    status: 'active'
  }

  t.deepEqual(result, expected)
})
