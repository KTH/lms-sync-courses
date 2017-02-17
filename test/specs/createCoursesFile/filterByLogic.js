const test = require('tape')
const rewire = require('rewire')
const filterByLogic = rewire('../../../filterByLogic.js')

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
        'tutoringLanguage': 'Swedish',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})

test('should include a course if it has multiple rounds, each with different start weeks', t => {
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
        'startWeek': '2017-04',
        'tutoringLanguage': 'Swedish',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      },
      {
        'courseCode': 'SF1624',
        'startTerm': '20171',
        'roundId': '2',
        'xmlns': '',
        'periods': [
          {
            'term': '20171',
            'number': '3'
          }
        ],
        'startWeek': '2017-03',
        'tutoringLanguage': 'Swedish',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})

test('should include a course if it has multiple rounds, each with different tutoringLanguage', t => {
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
        'tutoringLanguage': 'Swedish',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      },
      {
        'courseCode': 'SF1624',
        'startTerm': '20171',
        'roundId': '2',
        'xmlns': '',
        'periods': [
          {
            'term': '20171',
            'number': '3'
          }
        ],
        'startWeek': '2017-03',
        'tutoringLanguage': 'English',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, expected)
  t.end()
})

test('should include a course if it has multiple rounds, each with the same tutoringLanguage and the same startWeek', t => {
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
        'tutoringLanguage': 'Swedish',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      },
      {
        'courseCode': 'SF1624',
        'startTerm': '20171',
        'roundId': '2',
        'xmlns': '',
        'periods': [
          {
            'term': '20171',
            'number': '3'
          }
        ],
        'startWeek': '2017-03',
        'tutoringLanguage': 'English',
        'title': {
          'sv': 'Algebra och geometri',
          'en': 'Algebra and Geometry'
        }
      }
    ]
  ]

  const result = filterByLogic(courseRounds)

  const expected = courseRounds

  t.deepEqual(result, [[]])
  t.end()
})
