const terms = require('kth-canvas-utilities').terms
const util = require('util')
const { unlink } = require('fs')
const unlinkAsync = util.promisify(unlink)

function deleteFile (fileName) {
  return unlinkAsync(fileName).catch(e =>
    console.log(
      "couldn't delete file. It probably doesn't exist. This is fine, let's continue"
    )
  )
}

function createLongName (round) {
  const termNum = round.startTerm[4]
  const term = terms[termNum]
  const title = round.title[round.tutoringLanguage === 'Svenska' ? 'sv' : 'en']
  let result = round.courseCode
  if (round.shortName) {
    result += ` ${round.shortName}`
  }
  result += ` ${term}${round.startTerm.substring(2, 4)}-${
    round.roundId
  } ${title}`
  return result
}

function createSisCourseId ({ courseCode, startTerm, roundId }) {
  const termNum = startTerm[4]
  const shortYear = `${startTerm[2]}${startTerm[3]}`
  const term = terms[termNum]

  return `${courseCode}${term}${shortYear}${roundId}`
}

function flatten (arr) {
  return [].concat.apply([], arr)
}

module.exports = {
  deleteFile,
  flatten,

  buildCanvasCourseObjectV2 (courseRound) {
    // new for course from v2
    if (!courseRound) {
      return
    }
    return {
      startTerm: courseRound.startTerm,
      sisCourseId: createSisCourseId(courseRound),
      courseCode: courseRound.courseCode,
      shortName: courseRound.shortName,
      longName: createLongName(courseRound),
      startDate: `${courseRound.startSemester.start_date}T06:00:00Z`,
      sisAccountId: `${courseRound.schoolCode} - Imported course rounds`,
      integrationId: courseRound.integrationId,
      status: 'active'
    }
  }
}
