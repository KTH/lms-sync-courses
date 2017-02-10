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
  function addInfoForCourseRound ([round]) {
    return get(`http://www.kth.se/api/kopps/v1/course/${round.courseCode}/round/${termin}/${round.roundId}`)
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
  const courseRoundsGrouped = groupBy(courseRounds, ({round}) => round.courseCode)
  console.log('Filter:', JSON.stringify(courseRoundsGrouped, null, 4))

  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
}

function extractRelevantData (courseRounds) {
  return courseRounds.courseRoundList.courseRound.map(round => round.$)
}

function buildCanvasCourseObjects (courseRounds) {
  return Promise.map(courseRounds, ({round}) => {
    // Add a ':' between year and term
    const position = 4
    const startTerm = [round.startTerm.slice(0, position), ':', round.startTerm.slice(position)].join('')
    return getCourseAndCourseRoundFromKopps({courseCode: round.courseCode, startTerm, round: round.roundId})
  })
  .then(coursesAndCourseRounds => Promise.map(coursesAndCourseRounds, createSimpleCanvasCourseObject))
}

function writeCsvFile (canvasCourseObjects) {
  /* {"course":{
   * "course":{
   * "name":"VT17-1 Practical Energy Related Project",
   * "course_code":"MJ1432",
   * "sis_course_id":"MJ1432VT171",
   * "start_at":"2017-01-16T12:57:02.897Z"}},
   * "sisAccountId":"ITM - Imported course rounds",
   * "courseRound":{"courseCode":"MJ1432","startTerm":"20171","roundId":"1","startWeek":"2017-03","endWeek":"2017-23",
   * "xmlns":"http://www.kth.se/student/kurser"}}
   * */

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

  return fs.mkdirAsync('csv')
  .catch(e => console.log('couldnt create csv folder. This is probably fine, just continue'))
  .then(() => csvFile.writeLine(columns, fileName))
  .then(() => Promise.map(canvasCourseObjects, _writeLine))
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
      .then(({courseRound: {$: info, tutoringLanguage}}) => {
        round.startWeek = info.startWeek
        const [{_: lang}] = tutoringLanguage
        round.lang = lang
        return round
      })
    })
  }

  return get(`http://www.kth.se/api/kopps/v1/courseRounds/${termin}`)
  .then(parseString)
  .then(extractRelevantData)
  .then(addTutoringLanguageAndStartDate)
}

/*
returns:
[
  [{"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":""}],
  [{"courseCode":"EH2720","startTerm":"20172","roundId":"1","xmlns":""}],
  [{"courseCode":"EF2215","startTerm":"20172","roundId":"1","xmlns":""}], ...
]
*/
function filterCoursesDuringPeriod (coursesWithPeriods, period) {
  return coursesWithPeriods.filter(({periods}) => periods && periods.find(({number}) => number === period))
}

function filter (courseRounds) {
  return filterCourses(courseRounds, courses => courses.length === 1)
}

module.exports = function ({term, year, period}) {
  const termin = `${year}:${term}`
  fileName = `csv/courses-${termin}-${period}.csv`

  return deleteFile()
    .then(() => getCourseRounds(termin))
    .then(courseRounds => {
      console.log('courseRounds', JSON.stringify(courseRounds))
      return courseRounds
    })
    .then(groupRoundsByCourseCode)
      /*
      [
      [{"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":""}],
      [{"courseCode":"EH2720","startTerm":"20172","roundId":"1","xmlns":""}],
      [{"courseCode":"EF2215","startTerm":"20172","roundId":"1","xmlns":""}], ...
    ]
      */
      // console.log('courseRounds filtered', JSON.stringify( courseRounds ))
    .then(courseRounds => addPeriods(courseRounds, termin))
      /*
       [
      {
        "round":{"courseCode":"EK2360","startTerm":"20172","roundId":"1","xmlns":""},
        "periods":[{"term":"20172","number":"2"}]
      },{
        "round":{"courseCode":"EH2720","startTerm":"20172","roundId":"1","xmlns":""},
        "periods":[{"term":"20172","number":"1"}]
      },{
        "round":{"courseCode":"EF2215","startTerm":"20172","roundId":"1","xmlns":""},
        "periods":[{"term":"20172","number":"1"}]
      },...
    ]
      */
      // console.log('courseRounds with added periods', JSON.stringify( courseRounds ))
    .then(coursesWithPeriods => filterCoursesDuringPeriod(coursesWithPeriods, period))
      /*
      [
      {
        "round":{"courseCode":"DM2678","startTerm":"20172","roundId":"1","xmlns":""},
        "periods":[
            {"term":"20172","number":"1"},
            {"term":"20172","number":"2"},
            {"term":"20181","number":"3"},
            {"term":"20181","number":"4"},
      },...
    ]
      */
    .then(buildCanvasCourseObjects)
    /*
    [
    { "course":{
      "course":{
        "name":"HT17-1 Program Integrating Course in Interactive Media Technology",
        "course_code":"DM2678",
        "sis_course_id":"DM2678HT171",
        "start_at":"2017-08-28T10:33:46.832Z"}
      },
      "sisAccountId":"CSC - Imported course rounds",
      "courseRound":{
        "courseCode":"DM2678",
        "startTerm":"20172",
        "roundId":"1",
        "startWeek":"2017-35",
        "endWeek":"2019-23",
        "xmlns":"http://www.kth.se/student/kurser"
      }
    },
    {"course":{"course": ...
    */
    .then(writeCsvFile)
    .catch(e => console.error(e))
}
