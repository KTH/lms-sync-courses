const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const logger = require('../server/logger')

function escapeCsvData (str) {
  str = '' + str

  if (str.includes(',')) {
    str = `"${str}"`
  }

  return str
}

function writeLine (strArr, fileName) {
  const line = createLine(strArr)
  logger.info(`writing line: ${line} to file ${fileName}`)
  return fs.appendFileAsync(fileName, line)
}

function createLine (strArr) {
  return strArr.map(escapeCsvData).join(',') + '\n'
}

module.exports = {
  escapeCsvData, writeLine, createLine
}
