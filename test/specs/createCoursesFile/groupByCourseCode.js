const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const groupByCourseCode = createCoursesFile.__get__('groupByCourseCode')

test.only('should do something', t => {
  const courseRounds = [
    {
      'round': {'courseCode': 'EK2360'},
      'periods': [{'term': '20172', 'number': '2'}]
    }, {
      'round': {'courseCode': 'EK2360'},
      'periods': [{'term': '20172', 'number': '1'}]
    }, {
      'round': {'courseCode': 'EF2215'},
      'periods': [{'term': '20172', 'number': '1'}]
    }
  ]
  t.plan(1)
  t.equal(1, 0)
})
