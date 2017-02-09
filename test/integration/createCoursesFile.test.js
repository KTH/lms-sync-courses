var test = require('tape')
fs = require('fs-extra')

const createCoursesFile = require('../../createCoursesFile.js')
test('should be able to create the file', t => {
  t.plan(1)
  fs.removeSync('csv')

  createCoursesFile({term: '2', year: '2017', period: '4'})
  .then(fileContent => {
    t.ok(fs.existsSync('csv/courses-2017:2-4.csv'))
  })
})
