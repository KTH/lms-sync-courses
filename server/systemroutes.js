const express = require('express')
const router = express.Router()

const CanvasApi = require('kth-canvas-api')
const canvasApi = new CanvasApi(process.env.canvasApiUrl, process.env.canvasApiKey)
const stripIndent = require('common-tags/lib/stripIndent')

const version = require('../config/version')
const packageFile = require('../package.json')
const log = require('./logger')

async function checkCanvasKey () {
  try {
    await canvasApi.getRootAccount()
    return true
  } catch (e) {
    log.info('An error ocurred: ', e)
    return false
  }
}

async function checkCanvasStatus () {
  try {
    const canvasStatus = await rp({
      url: 'http://nlxv32btr6v7.statuspage.io/api/v2/status.json',
      json: true
    })
    return canvasStatus.status.indicator === 'none'
  } catch (e) {
    log.info('An error occured:', e)
    return false
  }
}


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
  const statusStr = stripIndent`
    APPLICATION_STATUS: OK
  `
  log.info('Showing _monitor page:', statusStr)
  res.send(statusStr)
}

async function _monitorAll (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  const statusStr = stripIndent`
    APPLICATION_STATUS: OK
  `
  log.info('Showing _monitor_all page:', statusStr)
  res.send(statusStr)
}

router.get('/_monitor', _monitor)
router.get('/_monitor_all', _monitorAll)

router.get('/_monitor_core', function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send(stripIndent`
    APPLICATION_STATUS: OK
  `)
})
router.get('/_about', _about)

module.exports = router
