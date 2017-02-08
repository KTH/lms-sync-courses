var inquirer = require('inquirer')
const moment = require('moment')
const Promise = require('bluebird')

const currentYear = moment().year()
const years = []
const createCoursesFile = require('./createCoursesFile.js')
for (var i = 0; i < 5; i++) {
  years.push(`${currentYear + i}`)
}

const terms = ['1', '2']
const periods = ['1', '2', '3', '4', '5', '6']

const files = [
  {
    name: 'Csv-fil med kurser',
    value: 'courses',
    disabled: true,
    checked: true
  },
  {
    name: 'Csv-fil med enrollments för alla kurser',
    value: 'enrollments',
    checked: true
  }
]

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
  },
  {
    message: 'Vad vill du skapa?',
    name: 'filesToCreate',
    choices: files,
    type: 'checkbox'
  }
])
.then(({year, term, filesToCreate, period}) => {
  console.log('ok, börjar med att skapa csvfil med kurserna...')
  createCoursesFile({year, term, period})
    .then(() => {
      if (filesToCreate.includes('enrollments')) {
        console.log('Och nu skapar vi fil med enrollments')
        return Promise.reject('TODO: call enrollments!')
      } else {
        return Promise.resolve()
      }
    })
}).catch(e => console.error(e))
