require('dotenv').config()

module.exports = {
  port: 3000,
  koppsBaseUrl: process.env.koppsBaseUrl,
  ugUrl: process.env.ugUrl,
  ugUsername: process.env.ugUsername,
  ugPwd: process.env.ugPwd,
  csvDir: process.env.csvDir || '/tmp/'
}
