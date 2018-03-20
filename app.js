'use strict'

const app = require('kth-node-server')
const config = require('./config/serverSettings')
const logger = require('./server/logger')

app.use('/api/lms-sync-courses/', require('./server/systemroutes'))

app.start({
  port: config.port,
  logger
})

console.log(`


  ::::::::::::

  App is started. You can verify that it works by browsing to
  http://localhost:${config.port}/api/lms-sync-courses/_about

  ::::::::::


  `)
