const filterYellowCourses = require('./filterYellowCourses')

function filterByLogic (groupedCourses) {
  const oneToOneCourses = groupedCourses.map(courseRounds => courseRounds.length === 1 ? courseRounds : [])
  const yellowCourses = filterYellowCourses(groupedCourses)
  return [...oneToOneCourses, ...yellowCourses]
}

module.exports = filterByLogic
