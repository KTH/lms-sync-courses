module.exports = function (groupedCourses) {
  return groupedCourses.map(courseRounds => courseRounds.length === 1 ? courseRounds : [])
}
