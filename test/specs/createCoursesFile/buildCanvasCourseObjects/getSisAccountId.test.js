const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const getSisAccountId = createCoursesFile.__get__('getSisAccountId')

test('should build a hardcoded sis account id', t => {
  const result = getSisAccountId('A12345')

  t.equal(result, 'ABE - Imported course rounds')
  t.end()
})
