const test = require('tape')
const proxyquire = require('proxyquire')

const filterByLogic = proxyquire('../../../filter/filterByLogic', {
  './filterOneToOne': () => [[{courseCode: 'SF1624', roundId: '1'}]],
  './filterYellowCourses': () => [[{courseCode: 'SF1624', roundId: '1'}]]
})

test('should not include duplicate course rounds', t => {
  // any grouped courses is fine since we mock the filter results
  const result = filterByLogic([])

  const expected = [[{courseCode: 'SF1624', roundId: '1'}]]

  t.deepEqual(result, expected)
  t.end()
})
