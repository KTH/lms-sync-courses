require('dotenv').config()
const rp = require('request-promise')
const Promise = require('bluebird') // use bluebird to get a little more promise functions then the standard Promise AP
const parseString = Promise.promisify(require('xml2js').parseString)
const {groupBy} = require('lodash')
// const config = require('../server/init/configuration')
const canvasUtilities = require('kth-canvas-utilities')
canvasUtilities.init()
const {getCourseAndCourseRoundFromKopps, createSimpleCanvasCourseObject} = canvasUtilities
const csvFile = require('./csvFile')
const fs = Promise.promisifyAll(require('fs'))
let fileName

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

/*
 returns:
 [
  [
    {"courseCode":"ML1000","startTerm":"20172","roundId":"1","xmlns":""},
    {"courseCode":"ML1000","startTerm":"20172","roundId":"2","xmlns":""}
  ],
  [
    {"courseCode":"HF0017","startTerm":"20172","roundId":"2","xmlns":""},
    {"courseCode":"HF0017","startTerm":"20172","roundId":"1","xmlns":""}
  ],[
  {"courseCode":"HE1026","startTerm":"20172","roundId":"2","xmlns":""},
  ...
*/
function filterCourses (courseRounds, filterFn) {
  const courseRoundsGrouped = groupBy(courseRounds, round => {
    console.log(JSON.stringify(round, null, 4))
    return round.courseCode
  })
  // console.log('Filter:', JSON.stringify(courseRoundsGrouped, null, 4))

  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
  .filter(filterFn)
}

function groupRoundsByCourseCode (courseRounds) {
  // console.log(JSON.stringify(courseRounds.splice(0, 5), null, 4))
  const courseRoundsGrouped = groupBy(courseRounds, (round) => round.courseCode)
  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
}

function extractRelevantData (courseRounds) {
  return courseRounds.courseRoundList.courseRound.map(round => round.$)
}

function buildCanvasCourseObjects (courseRounds) {
  console.log('courseRounds', JSON.stringify(courseRounds, null, 4))
  return Promise.map(courseRounds, round => {
    // Add a ':' between year and term
    const position = 4
    const startTerm = [round.startTerm.slice(0, position), ':', round.startTerm.slice(position)].join('')
    return getCourseAndCourseRoundFromKopps({courseCode: round.courseCode, startTerm, round: round.roundId})
  })
  .then(coursesAndCourseRounds => Promise.map(coursesAndCourseRounds, createSimpleCanvasCourseObject))
}

function writeCsvFile (canvasCourseObjects) {
  console.log('canvasCourseObjects', JSON.stringify(canvasCourseObjects, null, 4))
  const columns = [
    'course_id',
    'short_name',
    'long_name',
    'start_date',
    'account_id',
    'status']

  function _writeLine ({course, sisAccountId, courseRound, shortName}) {
    console.log('course', course)
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

function deleteFile () {
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

function filterCoursesDuringPeriod (coursesWithPeriods, period) {
  return coursesWithPeriods.filter(({periods}) => periods && periods.find(({number}) => number === period))
}

module.exports = function ({term, year, period}) {
  const termin = `${year}:${term}`
  fileName = `csv/courses-${termin}-${period}.csv`

  return deleteFile()
    .then(() => getCourseRounds(termin))
    // .then(courseRounds => console.log('courseRounds', JSON.stringify(courseRounds)))
    .then(coursesWithPeriods => filterCoursesDuringPeriod(coursesWithPeriods, period))
    .then(buildCanvasCourseObjects)
    .then(groupRoundsByCourseCode)
    .then(writeCsvFile)
    .catch(e => console.error(e))
}

/*
module.exports = function ({term, year, period}) {
  const termin = `${year}:${term}`
  fileName = `csv/courses-${termin}-${period}.csv`
  console.log('filename:' + fileName)
  return deleteFile()
    .then(() => get(`http://www.kth.se/api/kopps/v1/courseRounds/${termin}`))
    .then(parseString)
    .then(extractRelevantData)
    .then(courseRounds => filterCoursesByCount(courseRounds, courses => courses.length === 1))
    .then(courseRounds => addPeriods(courseRounds, termin))
    .then(coursesWithPeriods => coursesWithPeriods.filter(({periods}) => periods && periods.find(({number}) => number === period)))
    .then(buildCanvasCourseObjects)
    .then(writeCsvFile)
    .catch(e => console.error(e))
}
*/
