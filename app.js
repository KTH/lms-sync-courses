require('dotenv').config()
require('@kth/reqvars').check()
const app = require('kth-node-server')
const logger = require('./server/logger')
const runPeriodically = require('./run-periodically')

process.on('uncaughtException', err => {
  // In case of unknown Error, just log and crash the app!
  // Reminder: if this code is ever called, it is a bug and should be fixed. This is only as a last resort
  logger.fatal(err, 'Uncaught Exception thrown')
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  // Pass "unhandledRejection" to the "uncaughtException" handler above
  throw reason
})

app.use('/api/lms-sync-courses/', require('./server/systemroutes'))
app.start({
  port: 3000,
  logger
})

runPeriodically.start()
