const {countBy} = require('lodash')

function filterByLogic (groupedCourses) {
  const oneToOneCourses = groupedCourses.map(courseRounds => courseRounds.length === 1 ? courseRounds : [])
  const yellowCoursesWeek = groupedCourses.map(courseRounds => countBy(courseRounds, round => { round.startWeek }))
  // console.log('oneToOneCourses', JSON.stringify(oneToOneCourses, null, 4))
  return [...oneToOneCourses]
}

module.exports = filterByLogic
