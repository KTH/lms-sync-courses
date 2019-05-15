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
    shortName: 'shortName',
    startTerm: 'startTerm',
    integrationId: 'd1ff3r3n-71nt-3gr4-710n-1dt3571ng123',
    startSemester: {
      start_date: aDate
    }
  }

  const result = utils.buildCanvasCourseObjectV2(courseRound)

  const expected = {
    startTerm: 'startTerm',
    sisCourseId: 'abc123',
    courseCode: 'courseCode',
    shortName: 'shortName',
    longName: 'Långt namn',
    startDate: `${aDate}T06:00:00Z`,
    sisAccountId: 'ABE - Imported course rounds',
    integrationId: 'd1ff3r3n-71nt-3gr4-710n-1dt3571ng123',
    status: 'active'
  }

  t.deepEqual(result, expected)
})
