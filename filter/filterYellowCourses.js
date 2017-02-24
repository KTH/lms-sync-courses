const {countBy} = require('lodash')
const {uniqWith, isEqual} = require('lodash')

function filterByStartWeek (courseRounds) {
  const roundsPerWeek = countBy(courseRounds, 'startWeek')
  let allRoundsHaveDifferentStartWeek = true
  for (let key in roundsPerWeek) {
    if (roundsPerWeek[key] > 1) {
      allRoundsHaveDifferentStartWeek = false
    }
    if (key === 'undefined') {
      isDiffLang = false
    }
  }
  return allRoundsHaveDifferentStartWeek ? courseRounds : []
}

function filterByTutoringLanguage (courseRounds) {
  const roundsByLang = countBy(courseRounds, 'tutoringLanguage')
  let isDiffLang = true
  for (let key in roundsByLang) {
    if (roundsByLang[key] > 1) {
      isDiffLang = false
    }
    if (key === 'undefined') {
      isDiffLang = false
    }
  }
  return isDiffLang ? courseRounds : []
}

module.exports = function (groupedCourses) {
  const courseRoundsByWeek = groupedCourses.map(filterByStartWeek)
  const courseRoundsByTutLang = groupedCourses.map(filterByTutoringLanguage)
  const mergedCourseRounds = [...courseRoundsByWeek, ...courseRoundsByTutLang]
  const withoutEmptyArr = mergedCourseRounds.filter(roundArray => roundArray.length > 1)
  return uniqWith(withoutEmptyArr, isEqual)
}
