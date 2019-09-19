require('dotenv').config()
const app = require('kth-node-server')
const logger = require('./server/logger')
const runPeriodically = require('./run-periodically')
const packageFile = require('./package.json')

// catches uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  logger.error('APPLICATION EXIT - uncaught exception in ', packageFile.name)
  logger.error(`Uncaught Exception, origin (${origin})`, { err })
  process.exit(1)
})

app.use('/api/lms-sync-courses/', require('./server/systemroutes'))
app.start({
  port: 3000,
  logger
})

runPeriodically.start()
