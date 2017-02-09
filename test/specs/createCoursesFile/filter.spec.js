const test = require('tape')
const rewire = require('rewire');
const createCoursesFile = rewire('../../../createCoursesFile.js')
const filter = createCoursesFile.__get__('filter')

test('should include course rounds if the course only have one round', t => {
  const courseRounds = {
    'EK2360': [
      {
        'courseCode': 'EK2360',
        'startTerm': '20172',
        'roundId': '1',
        'xmlns': '',
        'startWeek': '2017-44',
        'lang': 'English'
      }
    ]
  }



  const result = filter(courseRounds)

  t.deepEqual(result, courseRounds)
  t.end()
})
