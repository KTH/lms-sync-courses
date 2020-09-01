require('dotenv').config()
const test = require('ava')
const createCoursesFile = require('../../server/createCoursesFile')
const fs = require('fs')

test('Generate courses.csv files for 2017-1-3', async t => {
  const term = 1
  const year = 2017

  const courseOfferings = await createCoursesFile.getCourseOfferings({
    term,
    year
  })

  const canvasCourses = createCoursesFile.prepareCoursesForCanvas(
    courseOfferings
  )

  const fileName = await createCoursesFile.createCoursesFile({
    term,
    year,
    canvasCourses
  })

  const content = fs.readFileSync(fileName, { encoding: 'utf-8' })
  t.snapshot(content)
})
