const test = require('tape')
const filterOneToOne = require('../../../filter/filterOneToOne')

test('should include a course if it only has one course round', t => {
  const courseRounds = [
    [
      {
        'courseCode': 'SF1624',
        'startTerm': '20171',
        'roundId': '1',
        'xmlns': '',
        'periods': [
          {
            'term': '20171',
            'number': '3'
          }
        ],
        'startWeek': '2017-03',
        'tutoringLanguage': 'Svenska',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      }
    ]
  ]

  const result = filterOneToOne(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})
