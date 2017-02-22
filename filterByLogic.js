const {countBy, groupBy} = require('lodash')

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

function filterByLogic (groupedCourses) {
  const oneToOneCourses = groupedCourses.map(courseRounds => courseRounds.length === 1 ? courseRounds : [])
  const yellowCoursesWeek = groupedCourses.map(includeRoundsIfDifferentStartWeekForEachRound)
  return [...oneToOneCourses, ...yellowCoursesWeek]
}

module.exports = filterByLogic
