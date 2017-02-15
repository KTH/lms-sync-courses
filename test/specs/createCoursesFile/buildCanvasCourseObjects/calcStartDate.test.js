const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const calcStartDate = createCoursesFile.__get__('calcStartDate')

test('should create a date for the monday of the given start week', t => {
  const startDate = calcStartDate({
    startWeek: '2017-03'
  })
  t.equal(startDate, '2017-01-16T07:00:00.000Z')
  t.end()
})
