const csvFile = require('./csvFile')
const Promise = require('bluebird')
const {buildCanvasCourseObjects, createLongName, flatten} =  require('./createCoursesFile');

const columns = ['section_id', 'course_id', 'name', 'status']

module.exports = function (groupedCourses, fileName) {
  return csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName)
  .then(()=>buildCanvasCourseObjects(groupedCourses))
  .then(flatten)
  .then(arrayOfCourseRounds => Promise.map(arrayOfCourseRounds, round => csvFile.writeLine([])))
  .then(()=>groupedCourses)
  .catch(e => console.error('An error occured',e))
}
