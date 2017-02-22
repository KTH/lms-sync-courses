const {countBy} = require('lodash')

function includeRoundsIfDifferentStartWeekForEachRound (courseRounds) {
  const roundsPerWeek = countBy(courseRounds, 'startWeek')
  let allRoundsHaveDifferentStartWeek = true
  console.log('roundsPerWeek', roundsPerWeek)
  for (let key in roundsPerWeek) {
    if (roundsPerWeek[key] > 1) {
      allRoundsHaveDifferentStartWeek = false
    }
  }
  console.log('allRoundsHaveDifferentStartWeek', allRoundsHaveDifferentStartWeek)
  return allRoundsHaveDifferentStartWeek ? courseRounds : []
}

module.exports = function (groupedCourses) {
  return groupedCourses.map(includeRoundsIfDifferentStartWeekForEachRound)
}
