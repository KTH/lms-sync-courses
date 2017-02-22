const test = require('tape')
const proxyquire = require('proxyquire')

test('should not include duplicate course rounds', t => {
  const filterByLogic = proxyquire('../../../filter/filterByLogic', {
    './filterOneToOne': () => [[{courseCode: 'SF1624', roundId: '1'}]],
    './filterYellowCourses': () => [[{courseCode: 'SF1624', roundId: '1'}]]
  })

  // any grouped courses is fine since we mock the filter results
  const result = filterByLogic([])

  const expected = [[{courseCode: 'SF1624', roundId: '1'}]]

  t.deepEqual(result, expected)
  t.end()
})

test('should include both yellow and oneToOneCourses', t => {
  const filterByLogic = proxyquire('../../../filter/filterByLogic', {
    './filterOneToOne': () => [[{courseCode: 'SF1624', roundId: '1'}]],
    './filterYellowCourses': () => [[{courseCode: 'SF1624', roundId: '2'}]]
  })
  // any grouped courses is fine since we mock the filter results
  const result = filterByLogic([])

  const expected = [[{courseCode: 'SF1624', roundId: '1'}], [{courseCode: 'SF1624', roundId: '2'}]]

  t.deepEqual(result, expected)
  t.end()
})
