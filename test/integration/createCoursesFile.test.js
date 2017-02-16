var test = require('tape')
fs = require('fs-extra')

const createCoursesFile = require('../../createCoursesFile.js')
test('should create the file with correct name, headers, and a line including a sisCourseId', t => {
  t.plan(3)
  fs.removeSync('csv')
  const fileName = 'csv/courses-2017:1-3.csv'

  // Choose autumn, but a period on the spring to get a smaller amount of courses
  createCoursesFile({term: '1', year: '2017', period: '3'})
  .then(() => {
    t.ok(fs.existsSync(fileName))

    const fileContent = fs.readFileSync(fileName, 'utf-8')
    const [headers,line2] = fileContent.split('\n')
    t.equal(headers, 'course_id,short_name,long_name,start_date,account_id,status')

    const [,courseCode] = line2.split(',')
    t.ok(courseCode !== 'undefined' && courseCode.length === 6)
  })
})
