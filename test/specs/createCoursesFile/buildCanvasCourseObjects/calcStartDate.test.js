const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const buildCanvasCourseObjects = createCoursesFile.__get__('buildCanvasCourseObjects')
const moment = require('moment')

test('should do something', t => {
  t.plan(1)
  t.equal(1, 0)
})
