var inquirer = require('inquirer')
const moment = require('moment')
const Promise = require('bluebird')

const currentYear = moment().year()
const years = []
const createCoursesFile = require('./createCoursesFile.js')
for (var i = 0; i < 5; i++) {
  years.push(`${currentYear + i}`)
}

const terms = ['1', '2', '3', '4', '5', '6']

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
    message: 'Vad vill du skapa?',
    name: 'files',
    choices: files,
    type: 'checkbox'
  }
])
.then(({year, term, files}) => {
  const tasks = []
  if (files.includes('courses')) {
    tasks.push(createCoursesFile)
  }
  return Promise.each(tasks)
}).catch(e => console.error(e))
