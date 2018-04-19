'use strict'
require('dotenv').config()
const app = require('kth-node-server')
const logger = require('./server/logger')
const runPeriodically = require('./run-periodically')
app.use('/api/lms-sync-courses/', require('./server/systemroutes'))

app.start({
  port: 3000,
  logger
})

runPeriodically.start()
