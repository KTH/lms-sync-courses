require('dotenv').config()
const rp = require('request-promise')
const Promise = require('bluebird') // use bluebird to get a little more promise functions then the standard Promise AP
const parseString = Promise.promisify(require('xml2js').parseString)
const {groupBy} = require('lodash')
// const config = require('../server/init/configuration')
const canvasUtilities = require('kth-canvas-utilities')
canvasUtilities.init()
const {getCourseAndCourseRoundFromKopps, createSimpleCanvasCourseObject} = canvasUtilities

const departmentCodeMapping = require('kth-canvas-utilities/departmentCodeMapping')

const csvFile = require('./csvFile')
const fs = Promise.promisifyAll(require('fs'))

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

function getSisAccountId (courseCode) {
  const firstChar = courseCode[0]
  return `${departmentCodeMapping[firstChar]} - Imported course rounds`
}

/** *
* return example:
* {"round":{"courseCode":"MJ2244","startTerm":"20171","roundId":"1","xmlns":""},"periods":[{"term":"20171","number":"3"}]}
*/
function addPeriods (courseRounds, termin) {
  console.log('courseRounds', JSON.stringify(courseRounds, null, 4))
  function addInfoForCourseRound (round) {
    console.log('about to get...')
    return get(`http://www.kth.se/api/kopps/v1/course/${round.courseCode}/round/${termin}/${round.roundId}`)
    // return get(`http://www.kth.se/api/kopps/v1/course/${round.courseCode}/round/${termin}/${round.roundId}`)
    .then(parseString)
    .then(roundInfo => {
      const periods = roundInfo.courseRound.periods && roundInfo.courseRound.periods[0].period.map(period => period.$)

      return {round, periods}
    })
  }

  return Promise.map(courseRounds, addInfoForCourseRound)
}

function groupRoundsByCourseCode (courseRounds) {
  console.log(JSON.stringify(courseRounds, null, 4))
  const courseRoundsGrouped = groupBy(courseRounds, (round) => round.courseCode)
  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
}

function buildCanvasCourseObjects (courseRounds) {
  console.log('buildCanvasCourseObjects:',JSON.stringify(courseRounds, null, 4))
  const result = courseRounds.map(courseRound => {
    return {
      course_id: createSisCourseId(courseRound),
      short_name: courseRound.round.courseCode,
      long_name: createLongName(courseRound),
      start_date: calcStartDate(courseRound),
      account_id: getSisAccountId(courseRound),
      status: 'active'
    }
  })
  return Promise.resolve(result)

  // return Promise.map(courseRounds, round => {
  //   // Add a ':' between year and term
  //   const position = 4
  //   const startTerm = [round.startTerm.slice(0, position), ':', round.startTerm.slice(position)].join('')
  //   return getCourseAndCourseRoundFromKopps({courseCode: round.courseCode, startTerm, round: round.roundId})
  // })
  // .then(coursesAndCourseRounds => Promise.map(coursesAndCourseRounds, createSimpleCanvasCourseObject))
  // .then(result => {
  //   throw new Error('TODO: lang försvinner! startWeek då? De ska ju komma med till nästa funktion!')
  //   console.log('result', JSON.stringify(result))
  //   return result
  // })
}

function writeCsvFile (canvasCourseObjects, fileName) {
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'status']

  function _writeLine ({course, sisAccountId, courseRound, shortName}) {
    const lineArr = [
      course.course.sis_course_id,
      course.course.course_code,
      `${course.course.course_code} ${shortName || ''} ${course.course.name}`,
      course.course.start_at,
      sisAccountId,
      'active']

    return csvFile.writeLine(lineArr, fileName)
    .then(() => {
      return {course, sisAccountId, courseRound, shortName}
    })
  }

  function writeLinesForRounds (roundsForACourse) {
    return Promise.map(roundsForACourse, _writeLine)
  }

  return fs.mkdirAsync('csv')
  .catch(e => console.log('couldnt create csv folder. This is probably fine, just continue'))
  .then(() => csvFile.writeLine(columns, fileName))
  .then(() => Promise.map(canvasCourseObjects, writeLinesForRounds))
}

function deleteFile (fileName) {
  return fs.unlinkAsync(fileName)
      .catch(e => console.log("couldn't delete file. It probably doesn't exist. This is fine, let's continue"))
}
/**
@arg {string} termin example: '2017:1'
* returns:
    [
      {"courseCode":"ML1000","startTerm":"20172","roundId":"1","xmlns":""},
      {"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":""}, ...
    ]
*/
function getCourseRounds (termin) {
  function extractRelevantData (courseRounds) {
    return courseRounds.courseRoundList.courseRound.map(round => round.$)
  }

  /*
  *  @param {array} arrayOfCourseRounds example: [{"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":""}]
  * @return {array} arrayOfCourseRounds example: [{"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":"", tutoringLanguage: "Swedish"}]
  */
  function addTutoringLanguageAndStartDate (courseRounds) {
    return Promise.map(courseRounds, round => {
      return get(`http://www.kth.se/api/kopps/v1/course/${round.courseCode}/round/${termin}/${round.roundId}/en`)
      .then(parseString)
      .then(({courseRound: {$: info, tutoringLanguage, periods}}) => {
        round.periods = periods[0].period.map(period => period.$)
        round.startWeek = info.startWeek
        const [{_: lang}] = tutoringLanguage
        console.log('setting lang to ', lang)
        round.lang = lang
        return round
      })
    })
  }
  console.log('TODO: remove the subsetting!')
  return get(`http://www.kth.se/api/kopps/v1/courseRounds/${termin}`)
  .then(parseString)
  .then(extractRelevantData)
  .then(d => d.splice(0, 2))
  .then(addTutoringLanguageAndStartDate)
}

function getCourseRoundsPerCourseCode(termin){
  return getCourseRounds(termin)
  .then(groupRoundsByCourseCode)
}

function filterCoursesDuringPeriod (coursesWithPeriods, period) {
  return coursesWithPeriods.filter(({periods}) => periods && periods.find(({number}) => number === period))
}

function filterByLogic (groupedCourses) {
  console.log('groupedCourses', JSON.stringify(groupedCourses, null, 4))
  return groupedCourses
}

module.exports = function ({term, year, period}) {
  const termin = `${year}:${term}`
  const fileName = `csv/courses-${termin}-${period}.csv`

  return deleteFile(fileName)
    .then(() => getCourseRoundsPerCourseCode(termin))
    // .then(courseRounds => {
    //   console.log('courseRounds', JSON.stringify( courseRounds, null,2 ))
    //   return courseRounds
    // })
    .then(courseRounds => filterCoursesDuringPeriod(courseRounds, period))
    .then(filterByLogic)
    // TODO: writeCsvFile should call buildCanvasCourseObjects
    .then(courseRounds => writeCsvFile(courseRounds, fileName))
    .catch(e => console.error(e))
}
