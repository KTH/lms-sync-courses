const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const getSisAccountId = createCoursesFile.__get__('getSisAccountId')

test.only('should build a hardcoded sis account id', t => {
const expected = {}
const result = getSisAccountId()

  t.deepEqual(result, expected)
  t.end()
})
