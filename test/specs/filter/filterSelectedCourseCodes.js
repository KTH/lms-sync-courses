const test = require('tape')
const proxyquire = require('proxyquire')

test('should return empty array', t => {
  const  filter = proxyquire ('../../../filter/filterSelectedCourses.js',{
    './coursesToExclude': () => ["HL100X"]})

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

  let result = filter(courseList)

  const expected = [[]]

  t.deepEqual(result, expected)
  t.end()
})

test('should return the orginal Array', t => {
  const  filter = proxyquire ('../../../filter/filterSelectedCourses.js',{
    './coursesToExclude': () => []})

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

  let result = filter(courseList)

  const expected = courseList

  t.deepEqual(result, expected)
  t.end()
})
