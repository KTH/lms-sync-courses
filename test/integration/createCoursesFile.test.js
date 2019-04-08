require('dotenv').config()
const test = require('tape')
const fs = require('fs-extra')
const rewire = require('rewire')

const runPeriodically = rewire('../../run-periodically')
const syncCoursesSectionsAndEnrollments = runPeriodically.__get__('syncCoursesSectionsAndEnrollments')
test('should create the file with correct name, headers, and a line including a sisCourseId', async t => {
  process.env.CSV_DIR = '/tmp/testing/'
  fs.removeSync(process.env.CSV_DIR)
  fs.mkdirSync(process.env.CSV_DIR)
  try {
    await syncCoursesSectionsAndEnrollments()
  } catch (error) {
    console.error('An error occured when running integration tests', error)
  }

  const files = fs.readdirSync(process.env.CSV_DIR)
  t.deepEqual(files.length, 12, '12 csv files should be created in total')
  t.deepEqual(files.filter(file => file.startsWith('courses-')).length, 4, '4 files with courses should be created')
  t.deepEqual(files.filter(file => file.startsWith('enrollments-')).length, 4, '4 files with enrollments should be created')
  t.deepEqual(files.filter(file => file.startsWith('sections-')).length, 4, '4 files with sections should be created')
  t.end()
})
