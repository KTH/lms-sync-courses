require('dotenv').config()
const rp = require('request-promise')
const Promise = require('bluebird') // use bluebird to get a little more promise functions then the standard Promise AP
const parseString = Promise.promisify(require('xml2js').parseString)
const moment = require('moment')
const terms = require('kth-canvas-utilities/terms')

const {groupBy} = require('lodash')
const canvasUtilities = require('kth-canvas-utilities')
canvasUtilities.init()
const {getCourseAndCourseRoundFromKopps, createSimpleCanvasCourseObject} = canvasUtilities
const filterByLogic = require('./filter/filterByLogic')
const departmentCodeMapping = require('kth-canvas-utilities/departmentCodeMapping')

const csvFile = require('./csvFile')
const {mkdir, unlink} = require('fs')
const coursesToExclude=require('./RemoveThisCourses')
let mkdirAsync = Promise.promisify(mkdir)
let unlinkAsync = Promise.promisify(unlink)



function get (url) {
  console.log(url)
  return rp({
    url,
    method: 'GET',
    json: true,
    headers: {
      'content-type': 'application/json'
    }
  })
}

function getSisAccountId ({courseCode}) {
  const firstChar = courseCode[0]
  return `${departmentCodeMapping[firstChar]} - Imported course rounds`
}

function groupRoundsByCourseCode (courseRounds) {
  const courseRoundsGrouped = groupBy(courseRounds, (round) => round.courseCode)
  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
}

function calcStartDate (courseRound) {
  const [year, weekNumber] = courseRound.startWeek.split('-')
  const d = moment().year(year).isoWeek(weekNumber).isoWeekday(1)
  d.set({hour: 8, minute: 0, second: 0, millisecond: 0})
  return d.toISOString()
}

function createLongName (round) {
  const termNum = round.startTerm[4]
  const term = terms[termNum]
  const title = round.title[ round.tutoringLanguage === 'Swedish' ? 'sv' : 'en' ]
  let result = round.courseCode
  if (round.shortName) {
    result += ` ${round.shortName}`
  }
  result += ` ${term}${round.startTerm.substring(2, 4)}-${round.roundId} ${title}`
  return result
}

function createSisCourseId ({courseCode, startTerm, roundId}) {
  const termNum = startTerm[4]
  const shortYear = `${startTerm[2]}${startTerm[3]}`
  const term = terms[termNum]

  return `${courseCode}${term}${shortYear}${roundId}`
}

function buildCanvasCourseObjects (twoDArrayOfCourseRounds) {
  const result = twoDArrayOfCourseRounds.map(courseRounds => courseRounds.map(courseRound => {
    if (!courseRound) {
      return
    }
    return {
      sisCourseId: createSisCourseId(courseRound),
      courseCode: courseRound.courseCode,
      shortName: courseRound.shortName,
      longName: createLongName(courseRound),
      startDate: calcStartDate(courseRound),
      sisAccountId: getSisAccountId(courseRound),
      status: 'active'
    }
  }))
  return result
}

function flatten (arr) {
  return [].concat.apply([], arr)
}

function writeCsvFile (courseRounds, fileName) {
  const twoDArrayOfCanvasCourses = buildCanvasCourseObjects(courseRounds)
  const arrayOfCanvasCourses = flatten(twoDArrayOfCanvasCourses)
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'status']

  function writeLineForCourse (course) {
    return csvFile.writeLine([
      course.sisCourseId,
      course.courseCode,
      course.longName,
      course.startDate,
      course.sisAccountId,
      'active'], fileName)
  }

  return mkdirAsync('csv')
  .catch(e => console.log('couldnt create csv folder. This is probably fine, just continue'))
  .then(() => csvFile.writeLine(columns, fileName))
  .then(() => Promise.map(arrayOfCanvasCourses, writeLineForCourse)
  )
}

function deleteFile (fileName) {
  return unlinkAsync(fileName)
      .catch(e => console.log("couldn't delete file. It probably doesn't exist. This is fine, let's continue"))
}

function addRoundInfo (round, termin) {
  return get(`http://www.kth.se/api/kopps/v1/course/${round.courseCode}/round/${termin}/${round.roundId}/en`)
  .then(parseString)
  .then(({courseRound}) => {
    if (courseRound.periods) {
      round.periods = courseRound.periods[0].period.map(period => period.$)
      round.startWeek = courseRound.$.startWeek
      round.tutoringLanguage = courseRound.tutoringLanguage[0]._
    } else {
      round.periods = []
    }
    return round
  })
}

function getCourseRounds (termin) {
  function extractRelevantData (courseRounds) {
    return courseRounds.courseRoundList.courseRound.map(round => round.$)
  }

  function addTitles (courseRounds) {
    return Promise.mapSeries(courseRounds, round => get(`http://www.kth.se/api/kopps/v2/course/${round.courseCode}`)
      .then(course => {
        round.title = course.title
        return round
      })
    )
  }

  console.log('TODO: remove the subsetting!')
  return get(`http://www.kth.se/api/kopps/v1/courseRounds/${termin}`)
  .then(parseString)
  .then(extractRelevantData)
  // .then(d => d.splice(330, 360))
  .then(courseRounds => courseRounds.map(courseRound => addRoundInfo(courseRound, termin)))
  .then(addTitles)
}

function getCourseRoundsPerCourseCode (termin) {
  return getCourseRounds(termin)
  .then(groupRoundsByCourseCode)
}

function filterCoursesDuringPeriod (arrayOfCourseRoundArrays, period) {
  return arrayOfCourseRoundArrays.map(arrayOfCourseRounds => arrayOfCourseRounds.filter(({periods}) => periods && periods.find(({number}) => number === period)))
}

//  "courseCode": "LT1018",
function removeSelectedCourses(arrayOfArryOfCourseRounds){
  if (coursesToExclude.filter.length === 0) {
    console.log("All courses will pass, course filter is empty....")
    return arrayOfArryOfCourseRounds
  }
  coursesToExclude.filter.map(filter=>
    console.log("Filtering for Course Code: " + filter)
  )

  let result =  arrayOfArryOfCourseRounds.map(courseArray=>{
      return courseArray.filter(courseObject=>{
        let trueOrFalse = coursesToExclude.filter.map(filter=>courseObject.courseCode === filter)
        .indexOf(true) < 0
        console.log(trueOrFalse)
        return trueOrFalse
      })
    })
  console.log("Result = ",result)
  return result
}

module.exports = function ({term, year, period}) {
  const termin = `${year}:${term}`
  const fileName = `csv/courses-${termin}-${period}.csv`
  console.log('Using file name:', fileName)
  return deleteFile(fileName)
    .then(() => getCourseRoundsPerCourseCode(termin))
    .then(courses => {
      console.log('courses', JSON.stringify(courses, null, 4))
      return courses
    })
    .then(courses=>removeSelectedCourses(courses))
    .then(courseRounds => filterCoursesDuringPeriod(courseRounds, period))
    .then(filterByLogic)
    .then(courseRounds => writeCsvFile(courseRounds, fileName))
    .catch(e => console.error(e))
}
