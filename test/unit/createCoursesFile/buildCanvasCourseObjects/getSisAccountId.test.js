const test = require('tape')
const {getSisAccountId} = require('../../../../server/utils')

test('should build a hardcoded sis account id', t => {
  const result = getSisAccountId({courseCode: 'A12345', departmentCode: 'AL'})

  t.equal(result, 'ABE - Imported course rounds')
  t.end()
})

test('school from new org should be known', t => {
  // Actual VT19 course offering for DD2352 Algorithms and Complexity belongs to EECS, not CSC.
  const result = getSisAccountId({courseCode: 'DD2352', departmentCode: 'JH'})

  t.equal(result, 'EECS - Imported course rounds')
  t.end()
})
