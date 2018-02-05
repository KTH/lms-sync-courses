require('dotenv').config()
let koppsBaseUrl
const rp = require('request-promise')
const Promise = require('bluebird') // use bluebird to get a little more promise functions then the standard Promise AP
const parseString = Promise.promisify(require('xml2js').parseString)
const {
  buildCanvasCourseObjects,
  calcStartDate,
  flatten,
  createLongName,
  createSisCourseId,
  deleteFile
} = require('./utils')

const {groupBy} = require('lodash')
const canvasUtilities = require('kth-canvas-utilities')
canvasUtilities.init()
const {getCourseAndCourseRoundFromKopps, createSimpleCanvasCourseObject} = canvasUtilities
const createSectionsFile = require('./createSectionsFile')

const csvFile = require('./csvFile')
const {mkdir} = require('fs')
let mkdirAsync = Promise.promisify(mkdir)

function get (url, json=false) {
  console.log(url)
  const headers = {}
  if(json){
    headers['content-type']='application/json'
  }
  return rp({
    url,
    method: 'GET',
    json,
    headers
  })
}

function groupRoundsByCourseCode (courseRounds) {
  const courseRoundsGrouped = groupBy(courseRounds, (round) => round.courseCode)
  return Object.getOwnPropertyNames(courseRoundsGrouped)
  .map(name => courseRoundsGrouped[name])
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

function addRoundInfo (round, termin) {
  return get(`${koppsBaseUrl}v1/course/${round.courseCode}/round/${termin}/${round.roundId}/en`)
  .then(parseString)
  .then(({courseRound}) => {
    if (courseRound.periods) {
      round.periods = courseRound.periods[0].period.map(period => period.$)
      round.startWeek = courseRound.$.startWeek
      round.tutoringLanguage = courseRound.tutoringLanguage[0]._
    } else {
      round.periods = []
    }
    if (courseRound.stateCode) {
      round.stateCode = courseRound.stateCode[0]._
    }

    if(courseRound.shortName){
      round.shortName = courseRound.shortName[0]._
    }

    return round
  })
}

async function getCourseRounds (termin) {
  function extractRelevantData (courseRounds) {
    return courseRounds.courseRoundList.courseRound && courseRounds.courseRoundList.courseRound.map(round => round.$)
  }

  function addTitles (courseRounds) {
    return courseRounds && Promise.mapSeries(courseRounds, round => get(`${koppsBaseUrl}v2/course/${round.courseCode}`, true)
      .then(course => {
        round.title = course.title
        return round
      })
    )
  }

  return get(`${koppsBaseUrl}v1/courseRounds/${termin}`)
  .then(parseString)
  .then(extractRelevantData)
  // .then(courseRounds => courseRounds.filter(round => round.courseCode === 'SF1625'))
  // .then(d => d.splice(0, 2))
  .then(courseRounds => courseRounds && Promise.mapSeries(courseRounds, courseRound => addRoundInfo(courseRound, termin)))
  .then(addTitles)
}

function getCourseRoundsPerCourseCode (termin) {
  return getCourseRounds(termin)
  .then(groupRoundsByCourseCode)
}

function filterCoursesDuringPeriod (arrayOfCourseRoundArrays, period) {
  return arrayOfCourseRoundArrays.map(arrayOfCourseRounds => arrayOfCourseRounds.filter(({periods}) => periods && periods.find(({number}) => number === period)))
}

function filterNotCancelledCourses (arrayOfCourseRoundArrays) {
  return arrayOfCourseRoundArrays.map(arrayOfCourseRounds =>
    arrayOfCourseRounds.filter(round => {
      const cancelled = round.stateCode === 'CANCELLED'
      if(cancelled) console.log('Course is cancelled: ', JSON.stringify(round, null, 4))
      return !cancelled
    })
    )
}

module.exports = {
  set koppsBaseUrl(url){
    koppsBaseUrl = url
  },
  async createCoursesFile ({term, year, period}) {
    const termin = `${year}${term}`
    const fileName = `csv/courses-${termin}-${period}.csv`
    const enrollmentsFileName = `csv/sections-${termin}-${period}.csv`
    console.log('Using file name:', fileName)
    await deleteFile(fileName)
    const res = await rp({
      url: `${koppsBaseUrl}v2/courses/offerings?from=${termin}`,
      method: 'GET',
      json: true,
      headers: {'content-type':'application/json'}
    })

    const courseOfferings = res
    .filter(courseOffering => courseOffering.state === 'Godkänt' || courseOffering.state === 'Fullsatt')
    .filter(courseOffering => courseOffering.first_period === `${year}${term}P${period}`)

    for (const courseOffering of courseOfferings) {
      //{"courseCode":"AL2140","startTerm":"20171","roundId":"1","xmlns":"",
      //"periods":[{"term":"20171","number":"4"}],
      //"startWeek":"2017-12","tutoringLanguage":"English","title":{"sv":"Cleaner Production","en":"Cleaner Production"}}
      //"periods":[{"period":"P3","modules":["A1","B2","D1","F1","G2","H2","I2"]}]}]
      const courseRound = {
        courseCode: courseOffering.course_code,
        startTerm: courseOffering.first_yearsemester,
        roundId: courseOffering.offering_id,
        periods: courseOffering.periods,
        startSemester: courseOffering.offered_semesters.filter(s => s.semester === courseOffering.first_yearsemester)[0], //take start_Week for whole course
        shortName: "", //TODO: To see what is shortname in kopps v2 api
        tutoringLanguage: "English", // TODO: redo when kopps api will be updated with this parameter
        title: {
          sv: courseOffering.course_name,
          en: courseOffering.course_name_en
        }   
      }

      //console.log("PRINTA!!!! =>", courseRound)
      
      const course = {
        sisCourseId: createSisCourseId(courseRound),
        courseCode: courseRound.courseCode,
        // shortName: courseRound.shortName,
        // longName: createLongName(courseRound),
        startDate: calcStartDate(courseRound),
        // sisAccountId: getSisAccountId(courseRound),
        // status: 'active'
      }

      // await csvFile.writeLine([
      //   course.sisCourseId,
      //   course.courseCode,
      //   course.longName,
      //   course.startDate,
      //   course.sisAccountId,
      //   'active'], fileName)
      // //await writeCsvFile()
    }    
    //console.log(courseOfferings)
    return ['foo', 'bar']
    // console.log("KURSER: ", courseOfferings)
    //.then(() => getCourseRoundsPerCourseCode(termin))
    //.then(filterNotCancelledCourses)
    //.then(courseRounds => filterCoursesDuringPeriod(courseRounds, period))
   // .then(courseRounds => createSectionsFile(courseRounds, enrollmentsFileName))
    //.then(courseRounds => writeCsvFile(courseRounds, fileName))
    //.then(() => [fileName, enrollmentsFileName])
    //.catch(e => console.error(e))
  }}
