const csvFile = require('./csvFile')

module.exports = function (groupedCourses, fileName) {
  console.log('csvFile.writeLine', csvFile.writeLine)
  return csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName)
  .then(()=>groupedCourses)
}
