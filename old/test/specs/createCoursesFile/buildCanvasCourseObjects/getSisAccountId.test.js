const test = require('tape')
const {getSisAccountId} = require('../../../../utils')

test('should build a hardcoded sis account id', t => {
  const result = getSisAccountId({courseCode:'A12345'})

  t.equal(result, 'ABE - Imported course rounds')
  t.end()
})
