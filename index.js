var inquirer = require('inquirer')
const moment = require('moment')
const currentYear = moment().year()
const years = []

for (var i = 0; i < 5; i++) {
  years.push(`${currentYear + i}`)
}

const terms = ['1', '2', '3', '4', '5', '6']

const files = [
  {
    name: 'Csv-fil med kurser',
    checked: true
  },
  {
    name: 'Csv-fil med enrollments för alla kurser',
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
.then(answers => {
  console.log(answers)
}).catch(e => console.error(e))
