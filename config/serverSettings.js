require('dotenv').config()

module.exports = {
  port: 3000,
  koppsBaseUrl: process.env.koppsBaseUrl,
  csvDir: process.env.csvDir || '/tmp/'
}
