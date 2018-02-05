const csvFile = require('./csvFile')
const Promise = require('bluebird')
const {deleteFile} =  require('./utils');

const columns = ['section_id', 'course_id', 'name', 'status']

module.exports = async function (groupedCourses, fileName) {
  await deleteFile(fileName)
  await csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName)

  for (const courseRound of groupedCourses) {
    csvFile.writeLine([
      courseRound.sisCourseId, 
      courseRound.sisCourseId, 
      `Section for the course ${courseRound.longName}`, 
      'active'], fileName)
  }

  return 
  // return deleteFile(fileName)
  // .then(()=>csvFile.writeLine(['section_id', 'course_id', 'name', 'status'], fileName))
  // .then(()=>buildCanvasCourseObjects(groupedCourses))
  // .then(flatten)
  // .then(arrayOfCourseRounds => Promise.map(
  //   arrayOfCourseRounds,
  //   round => csvFile.writeLine([round.sisCourseId, round.sisCourseId, `Section for the course ${round.longName}`, 'active'], fileName)))
  // .then(()=>groupedCourses)
  // .catch(e => console.error('An error occured',e))
}
