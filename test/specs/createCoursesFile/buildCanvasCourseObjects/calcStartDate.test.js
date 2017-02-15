const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const calcStartDate = createCoursesFile.__get__('calcStartDate')
const moment = require('moment')

test.only('should do something', t => {
  // moment().year(year).isoWeek(weekNumber).isoWeekday(1).toISOString()
  const startDate = calcStartDate({
    startWeek: '2017-03'
  })
  t.equal('2017-01-16T00:00:00.000Z', startDate)
  t.end()
})
