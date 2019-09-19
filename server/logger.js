const bunyan = require('bunyan')

module.exports = bunyan.createLogger({
  app: 'lms-sync-courses',
  name: 'lms-sync-courses'
})
