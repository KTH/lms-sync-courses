const test = require('tape')
const rewire = require('rewire')
const filterYellowCourses = rewire('../../../filter/filterYellowCourses')
const sinon = require('sinon')

test('should merge result from filterByLanguage and filterByStartWeek, remove duplicates, and remove courses with less than 2 course rounds', t => {
  const roundsForFirstCourse = [
    {courseCode: 'SF1624', round: '1'},
    {courseCode: 'SF1624', round: '2'}
  ]

  const roundsForSecondCourse = [
    {courseCode: 'SF1625', round: '1'}
  ]

  const groupedCourses = [
    roundsForFirstCourse,
    roundsForSecondCourse]

  const filterByLanguage = sinon.stub()
  filterByLanguage.withArgs(roundsForFirstCourse).returns([])
  filterByLanguage.withArgs(roundsForSecondCourse).returns([{courseCode: 'SF1625', round: '1'}])
  filterYellowCourses.__set__('filterByTutoringLanguage', filterByLanguage)
  const filterByStartWeek = sinon.stub()
  filterByStartWeek.withArgs(roundsForFirstCourse).returns([{courseCode: 'SF1624', round: '1'}, {courseCode: 'SF1624', round: '2'}])
  filterByStartWeek.withArgs(roundsForSecondCourse).returns([{courseCode: 'SF1625', round: '1'}])
  filterYellowCourses.__set__('filterByStartWeek', filterByStartWeek)

  const result = filterYellowCourses(groupedCourses)
  const expected = [[{courseCode: 'SF1624', round: '1'}, {courseCode: 'SF1624', round: '2'}]]
  t.deepEqual(result, expected)
  t.end()
})
