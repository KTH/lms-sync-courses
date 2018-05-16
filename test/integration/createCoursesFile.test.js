var test = require('tape')
const fs = require('fs-extra')

const {syncCoursesSectionsAndEnrollments} = require('../../run-periodically')
test.skip('should create the file with correct name, headers, and a line including a sisCourseId', async t => {
  process.env.csvDir = '/tmp/testing/'
  fs.removeSync(process.env.csvDir)
  await syncCoursesSectionsAndEnrollments()
  t.end()
})
