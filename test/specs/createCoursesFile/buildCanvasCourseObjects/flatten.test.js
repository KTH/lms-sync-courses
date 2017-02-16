const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../../createCoursesFile.js')
const flatten = createCoursesFile.__get__('flatten')

test.only('should take a 2d array as input, and return a 1d array', t => {
  const input = [[{1:2}], [{3:4}]]
  const result = flatten(input)

  t.deepEqual(result, [{1:2},{3:4}])
  t.end()
})
