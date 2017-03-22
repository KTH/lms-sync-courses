const csvFile = require('./csvFile')
const Promise = require('bluebird')
const {buildCanvasCourseObjects, flatten, deleteFile} =  require('./utils');

const columns = ['section_id', 'course_id', 'name', 'status']

module.exports = function (groupedCourses, fileName) {
  return deleteFile(fileName)
  .then(()=>csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName))
  .then(()=>buildCanvasCourseObjects(groupedCourses))
  .then(flatten)
  .then(arrayOfCourseRounds => Promise.map(
    arrayOfCourseRounds,
    round => csvFile.writeLine([`${round.sisCourseId}_DEFAULT_SECTION`, round.sisCourseId, `Default section for the course ${round.longName}`, 'active'], fileName)))
  .then(()=>groupedCourses)
  .catch(e => console.error('An error occured',e))
}
