const {countBy} = require('lodash')

function includeRoundsIfDifferentStartWeekForEachRound (courseRounds) {
  const roundsPerWeek = countBy(courseRounds, 'startWeek')
  let allRoundsHaveDifferentStartWeek = true
  for (let key in roundsPerWeek) {
    if (roundsPerWeek[key] > 1) {
      allRoundsHaveDifferentStartWeek = false
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
  return groupedCourses.map(includeRoundsIfDifferentStartWeekForEachRound)
}
