const logger = require('./server/logger')

async function syncCourses(){
  logger.info('hejj')
}

module.exports = {
  start () {
    syncCourses()
    setInterval(syncCourses, 1000)
  }
}
