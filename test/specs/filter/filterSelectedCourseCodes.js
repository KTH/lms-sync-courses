const test = require('tape')
const rewire = require('rewire')

test('should return empty array', t => {
  const filterSelectedCourses = rewire('../../../filter/filterSelectedCourses')
  filterSelectedCourses.__set__('removeTheseCourses',{courseList: ['HL100X']})
  let courseList = [[
      {
          "courseCode": "HL100X",
          "startTerm": "20171",
          "roundId": "1",
          "xmlns": "",
          "periods": [
              {
                  "term": "20171",
                  "number": "3"
              }
          ],
          "startWeek": "2017-03",
          "tutoringLanguage": "Swedish",
          "title": {
              "sv": "Examensarbete inom medicinsk teknik, grundnivå",
              "en": "Degree Project in Medical Technology, First Cycle"
          }
      },
      {
          "courseCode": "HL100X",
          "startTerm": "20171",
          "roundId": "2",
          "xmlns": "",
          "periods": [
              {
                  "term": "20171",
                  "number": "4"
              }
          ],
          "startWeek": "2017-12",
          "tutoringLanguage": "Swedish",
          "title": {
              "sv": "Examensarbete inom medicinsk teknik, grundnivå",
              "en": "Degree Project in Medical Technology, First Cycle"
          }
      }
  ]]


  let result = filterSelectedCourses(courseList)
  const expected = [[]]
  t.deepEqual(result, expected)
  t.end()
})


test('should return original course list', t => {
  const filterSelectedCourses = rewire('../../../filter/filterSelectedCourses')
  filterSelectedCourses.__set__('removeTheseCourses',{courseList: []})
  let courseList = [[
      {
          "courseCode": "HL100X",
          "startTerm": "20171",
          "roundId": "1",
          "xmlns": "",
          "periods": [
              {
                  "term": "20171",
                  "number": "3"
              }
          ],
          "startWeek": "2017-03",
          "tutoringLanguage": "Swedish",
          "title": {
              "sv": "Examensarbete inom medicinsk teknik, grundnivå",
              "en": "Degree Project in Medical Technology, First Cycle"
          }
      },
      {
          "courseCode": "HL100X",
          "startTerm": "20171",
          "roundId": "2",
          "xmlns": "",
          "periods": [
              {
                  "term": "20171",
                  "number": "4"
              }
          ],
          "startWeek": "2017-12",
          "tutoringLanguage": "Swedish",
          "title": {
              "sv": "Examensarbete inom medicinsk teknik, grundnivå",
              "en": "Degree Project in Medical Technology, First Cycle"
          }
      }
  ]]
  let result = filterSelectedCourses(courseList)
  const expected = courseList
  t.deepEqual(result, expected)
  t.end()
})

test('should return empty array', t => {
  const filterSelectedCourses = rewire('../../../filter/filterSelectedCourses')
  filterSelectedCourses.__set__('removeTheseCourses',{courseList: ['HL100X']})
  let courseList = [[]]
  let result = filterSelectedCourses(courseList)
  const expected = [[]]
  t.deepEqual(result, expected)
  t.end()
})


test('should return empty array', t => {
  const filterSelectedCourses = rewire('../../../filter/filterSelectedCourses')
  filterSelectedCourses.__set__('removeTheseCourses',{courseList: []})
  let courseList = [[]]
  let result = filterSelectedCourses(courseList)
  const expected = [[]]
  t.deepEqual(result, expected)
  t.end()
})
