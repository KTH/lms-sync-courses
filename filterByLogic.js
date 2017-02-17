const {count} = require('lodash')

function filterByLogic (groupedCourses) {
  const greenCourses = groupedCourses.map(courseRounds => courseRounds.length === 1 ? courseRounds : [])
  const yellowCoursesWeek = groupedCourses.map(courseRounds => count(courseRounds, round => { round.startWeek }))
  console.log('greenCourses', JSON.stringify(greenCourses, null, 4))
  return [...greenCourses]
}

module.exports = filterByLogic
