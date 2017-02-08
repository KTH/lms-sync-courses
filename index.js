var inquirer = require('inquirer')
const moment = require('moment')
const currentYear = moment().year()
const years = []

for (var i = 0; i < 5; i++) {
  years.push(`${currentYear + i}`)
}
console.log(years)
inquirer.prompt([
  {
    message: 'Välj år',
    name: 'namnet',
    choices: years,
    type: 'list'
  }])
.then(answers => {
  console.log(answers)
}).catch(e => console.error(e))
