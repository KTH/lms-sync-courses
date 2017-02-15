const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const createLongName = createCoursesFile.__get__('createLongName')

/*
function _courseTerm (courseRoundObj) {
  const startTerm = courseRoundObj.courseRound.$.startTerm
  const startTermCanonical = startTerm[4] === '1' ? 'VT' : 'HT'
  return `${startTermCanonical}${startTerm.substring(2, 4)}`
}

function _createTitle (courseObj, courseRoundObj, xmlLang) {
  const courseTitle = courseObj.course.title.find(title => title.$['xml:lang'] === xmlLang)._
  const term = _courseTerm(courseRoundObj)
  return `${term}-${courseRoundObj.courseRound.$.roundId} ${courseTitle}`
}

ID1003VT172,ID1003,ID1003 TCOMK VT17-2 Project IT,2017-03-20T12:36:29.612Z,ICT - Imported course rounds,active
*/
test.only('should use the swedish title', t => {
  t.plan(1)
  const courseRounds = [[
    {
      'courseCode': 'AL2140',
      'startTerm': '20171',
      'roundId': 'roundId',
      'lang': 'Swedish',
      'title': {
        'sv': 'Renare produktion',
        'en': 'Cleaner Production'
      }
    }
  ]
  ]
  const result = createLongName(courseRounds)
  t.equal(result, 'AL2140 VT17-roundId Renare produktion')
})
