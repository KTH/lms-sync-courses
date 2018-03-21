'use strict'

const app = require('kth-node-server')
const config = require('./config/serverSettings')
const logger = require('./server/logger')
const runPeriodically = require('./run-periodically');
app.use('/api/lms-sync-courses/', require('./server/systemroutes'))

app.start({
  port: config.port,
  logger
})

runPeriodically.start()
