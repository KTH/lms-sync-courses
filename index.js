var inquirer = require('inquirer')
const moment = require('moment')
const Promise = require('bluebird')
require('colors')
const currentYear = moment().year()
const years = []
const {createCoursesFile} = require('./createCoursesFile.js')
const createEnrollmentsFile = require('./createEnrollmentsFile.js')
const {VT, HT} = require('kth-canvas-utilities/terms')
const fs = require('fs')
const path = require('path')
const Zip = require('node-zip')

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

const periods = {
  [HT]:['0','1','2'],
  [VT]:['3', '4', '5']}

let year, term
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
  }
])
.then(answers=>{
  year = answers.year
  term = answers.term
  console.log('term:', term)

  return inquirer.prompt([
    {
      message: 'Välj period',
      name: 'period',
      choices: periods[term],
      type: 'list'
    }])
})
.then(({period}) => {
  console.log('ok, börjar med att skapa csvfil med kurserna...'.green)
  let coursesFileName, sectionsFileName
  return createCoursesFile({year, term, period})
    .then(([_coursesFileName, _sectionsFileName]) => {
      coursesFileName = _coursesFileName
      sectionsFileName = _sectionsFileName

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
    .then(enrollmentsFileName => {
      console.log('Now: zip them up: ', coursesFileName, enrollmentsFileName, sectionsFileName)
      const zipFileName = `csv/${year}:${term}-${period}.zip`
      const zip = new Zip()
      zip.file('courses.csv', fs.readFileSync(path.join(__dirname, coursesFileName)))
      zip.file('enrollments.csv', fs.readFileSync(path.join(__dirname, enrollmentsFileName)))
      zip.file('sections.csv', fs.readFileSync(path.join(__dirname, sectionsFileName)))

      const data = zip.generate({ base64: false, compression: 'DEFLATE' })
      fs.writeFileSync(zipFileName, data, 'binary')
      console.log(`The zip file ${zipFileName} is now created. Go to canvas and upload it in SIS Imports.`)
    })
})
.then(() => console.log('😀 Done!'.green))
.catch(e => console.error(e))
