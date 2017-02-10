var test = require('tape')
fs = require('fs-extra')

const createCoursesFile = require('../../createCoursesFile.js')
test('should create the file with correct name', t => {
  t.plan(1)
  fs.removeSync('csv')

  // Choose autumn, but a period on the spring to get a smaller amount of courses
  createCoursesFile({term: '1', year: '2017', period: '3'})
  .then(() => {
    t.ok(fs.existsSync('csv/courses-2017:1-3.csv'))
  })
})
