const test = require('tape')
const rewire = require('rewire')
const createCoursesFile = rewire('../../../createCoursesFile.js')
const createCourseOfferingObj = createCoursesFile.__get__('createCourseOfferingObj')

test('should just return courses with right start semester with correct start_week', t => {
  const courseOfferings = {
    offered_semesters: [
      {
        semester: '20172',
        start_week: '44',
        end_week: '03'
      },
      {
        semester: '20181',
        start_week: '03',
        end_week: '23'
      }
    ],
    course_code: 'A11IYA',
    course_name: 'Introduktion till Arkitektyrket',
    course_name_en: 'Introduction to Architectural Practices',
    first_yearsemester: '20172',
    offering_id: '1',
    language: 'Svenska',
    short_name: 'THSSM/HSSB'
  }

  t.plan(1)

  const result = createCourseOfferingObj(courseOfferings)
  t.deepEqual(result, {
    courseCode: 'A11IYA',
    startTerm: '20172',
    roundId: '1',
    startSemester: {
      semester: '20172',
      start_week: '44',
      end_week: '03'
    },
    shortName: 'THSSM/HSSB', // todo
    tutoringLanguage: 'Svenska',
    title: {
      sv: 'Introduktion till Arkitektyrket',
      en: 'Introduction to Architectural Practices'
    }
  })
})

// test('should add shortName', t => {
//   const xmlForCourseRound = `
//   <courseRound>
//     <shortName xmlns="">CDATE1 m.fl.</shortName>
//   </courseRound>
//   `
//   createCoursesFile.__set__('get', () => courseOfferings)
//   t.plan(1)
//   const courseRounds = {
//   }
//   addRoundInfo(courseRounds).then(result => {
//     t.equal(result.shortName, 'CDATE1 m.fl.')
//   })
// })
