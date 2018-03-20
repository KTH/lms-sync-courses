const express = require('express')
const router = express.Router()
const config = require('../config/serverSettings')

const version = require('../config/version')
const packageFile = require('../package.json')
const log = require('./logger')

function _about (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`
    packageFile.name:${packageFile.name}
    packageFile.version:${packageFile.version}
    packageFile.description:${packageFile.description}
    version.gitBranch:${version.gitBranch}
    version.gitCommit:${version.gitCommit}
    version.jenkinsBuild:${version.jenkinsBuild}
    version.dockerName:${version.dockerName}
    version.dockerVersion:${version.dockerVersion}
    version.jenkinsBuildDate:${version.jenkinsBuildDate}`)
}

async function _monitor (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  const statusStr = `
APPLICATION_STATUS: OK
    `
  log.info('Showing _monitor page:', statusStr)
  res.send(statusStr)
}

async function _monitorAll (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  const statusStr = `
APPLICATION_STATUS: OK
    `
  log.info('Showing _monitor_all page:', statusStr)
  res.send(statusStr)
}

router.get('/_monitor', _monitor)
router.get('/_monitor_all', _monitorAll)

router.get('/_monitor_core', function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`
APPLICATION_STATUS: OK
    `)
}
)
router.get('/_about', _about)

module.exports = router
