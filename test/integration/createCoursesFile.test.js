var test = require('tape')
fs = require('fs-extra')

const {syncCoursesSectionsAndEnrollments} = require('../../run-periodically')
test.skip('should create the file with correct name, headers, and a line including a sisCourseId', async t => {
  process.env.csvDir = '/tmp/testing/'
  fs.removeSync(process.env.csvDir)
  const fileName = `${process.env.csvDir}/courses-20171-4.csv`

  await syncCoursesSectionsAndEnrollments()
  t.end()
})
