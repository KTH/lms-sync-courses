const filterYellowCourses = require('./filterYellowCourses')
const filterOneToOne = require('filterOneToOne')

function filterByLogic (groupedCourses) {
  const oneToOneCourses = filterOneToOne(groupedCourses)
  const yellowCourses = filterYellowCourses(groupedCourses)
  return [...oneToOneCourses, ...yellowCourses]
}

module.exports = filterByLogic
