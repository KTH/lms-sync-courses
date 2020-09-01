require('dotenv').config()
const test = require('ava')
const createCoursesFile = require('../../server/createCoursesFile')
const createEnrollmentsFile = require('../../server/createEnrollmentsFile')
const fs = require('fs')

function removeId (line) {
  return line.replace(/u\w{6}/i, 'uXXXXXX')
}

test('Generate enrollments.csv files for 2017-1-3', async t => {
  const term = 1
  const year = 2017

  const courseOfferings = await createCoursesFile.getCourseOfferings({
    term,
    year
  })

  const canvasCourses = createCoursesFile.prepareCoursesForCanvas(
    courseOfferings
  )

  const fileName = await createEnrollmentsFile({
    canvasCourses,
    term,
    year
  })

  const content = fs.readFileSync(fileName, { encoding: 'utf-8' })
  const safeContent = content
    .split('\n')
    .map(removeId)
    .join('\n')

  t.snapshot(safeContent)
})
