const express = require('express')
const router = express.Router()

const CanvasApi = require('@kth/canvas-api')
const got = require('got')
const canvasApi = CanvasApi(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_KEY
)

const version = require('../config/version')
const packageFile = require('../package.json')
const log = require('./logger')

async function checkCanvasKey () {
  try {
    await canvasApi.get('accounts/1')
    return true
  } catch (e) {
    log.info('An error ocurred: ', e)
    return false
  }
}

async function checkCanvasStatus () {
  try {
    const canvasStatus = await got(
      'http://nlxv32btr6v7.statuspage.io/api/v2/status.json',
      {
        json: true
      }
    )
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
  const status = await checkCanvasKey()
  const statusStr = [
    `APPLICATION_STATUS: ${status ? 'OK' : 'ERROR'}`,
    '',
    `CANVAS_KEY: ${
      status ? 'OK' : 'ERROR. Token for Canvas is not properly set'
    }`
  ].join('\n')

  log.info('Showing _monitor page:', statusStr)
  res.setHeader('Content-Type', 'text/plain')
  res.send(statusStr)
}

async function _monitorAll (req, res) {
  const canvasStatus = await checkCanvasStatus()
  const canvasKeyStatus = await checkCanvasKey()

  const statusStr = [
    `APPLICATION_STATUS: ${canvasStatus && canvasKeyStatus ? 'OK' : 'ERROR'}`,
    `CANVAS_KEY: ${
      canvasKeyStatus ? 'OK' : 'ERROR. Token for Canvas is not properly set'
    }`,
    `CANVAS: ${canvasStatus ? 'OK' : 'ERROR. CANVAS is down'}`
  ].join('\n')

  log.info('Showing _monitor_all page:', statusStr)

  res.setHeader('Content-Type', 'text/plain')
  res.send(statusStr)
}

router.get('/_monitor', _monitor)
router.get('/_monitor_all', _monitorAll)
router.get('/_monitor_core', function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send('APPLICATION_STATUS: OK\n')
})
router.get('/_about', _about)

module.exports = router
