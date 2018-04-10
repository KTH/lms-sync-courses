const bunyan = require('bunyan')

module.exports = bunyan.createLogger({
  name: 'lms-sync-courses'
})
