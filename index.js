var inquirer = require('inquirer')
const moment = require('moment')
const Promise = require('bluebird')
require('colors')
const currentYear = moment().year()
const years = []
const createCoursesFile = require('./createCoursesFile.js')
const createEnrollmentsFile = require('./createEnrollmentsFile.js')
const {VT, HT} = require('kth-canvas-utilities/terms')
console.log(`
  Detta är ett program för att ta
  fram alla kurser och lärare under en
  viss period ur KTHs system
  och spara dem i csv-filer, för import till Canvas LMS`.greenBG)

for (var i = -2; i < 4; i++) {
  years.push(`${currentYear + i}`)
}

const terms = [
  {
    name: 'Hösttermin',
    value: HT},
  {
    name: 'Vårtermin',
    value: VT
  }]
const periods = ['1', '2', '3', '4', '5', '6']

inquirer.prompt([
  {
    message: 'Välj år',
    name: 'year',
    choices: years,
    type: 'list',
    default: `${currentYear}`
  },
  {
    message: 'Välj termin',
    name: 'term',
    choices: terms,
    type: 'list'
  },
  {
    message: 'Välj period',
    name: 'period',
    choices: periods,
    type: 'list'
  }
])
.then(({year, term, period}) => {
  console.log('ok, börjar med att skapa csvfil med kurserna...'.green)
  return createCoursesFile({year, term, period})
    .then(() => {
      console.log('Och nu skapar vi fil med enrollments'.green)
      const {ugUsername, ugUrl, ugPwd} = process.env
      if (!(ugUsername && ugUrl && ugPwd)) {
        console.log(`
          Kan inte skapa csvfil med alla användare i
          kurser (enrollments) eftersom alla hemligheter inte är angivna.
          Jag behöver ugUsername, ugUrl och ugPwd i filen .env.
          Hoppar över att skapa denna fil.
          `.yellow)
        return Promise.resolve()
      } else {
        return createEnrollmentsFile({ugUsername, ugUrl, ugPwd, year, term, period})
      }
    })
})
.then(() => console.log('😀 Done!'.green))
.catch(e => console.error(e))
