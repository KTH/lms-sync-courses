const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const createLongName = createCoursesFile.__get__('createLongName')

test('should use the swedish title', t => {
  t.plan(1)
  const courseRound =
    {
      courseCode: 'AL2140',
      startTerm: '20171',
      roundId: 'roundId',
      lang: 'Swedish',
      title: {
        sv: 'Renare produktion',
        en: 'Cleaner Production'
      }
    }

  const result = createLongName(courseRound)
  t.equal(result, 'AL2140 VT17-roundId Renare produktion')
})

test('should include the short name', t => {
  t.plan(1)
  const courseRound = {
    courseCode: 'AL2140',
    startTerm: '20171',
    shortName: 'shortName',
    roundId: 'roundId',
    lang: 'Swedish',
    title: {
      sv: 'Renare produktion',
      en: 'Cleaner Production'
    }
  }

  const result = createLongName(courseRound)
  t.equal(result, 'AL2140 shortName VT17-roundId Renare produktion')
})
