const {uniqWith, isEqual} = require('lodash');
const filterYellowCourses = require('./filterYellowCourses')
const filterOneToOne = require('./filterOneToOne')

function filterByLogic (groupedCourses) {
  const oneToOneCourses = filterOneToOne(groupedCourses)
  const yellowCourses = filterYellowCourses(groupedCourses)
  const allCourses = [...oneToOneCourses, ...yellowCourses]
  return uniqWith(allCourses, isEqual);
}

module.exports = filterByLogic
