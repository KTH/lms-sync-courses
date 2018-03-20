const ldap = require('ldapjs')
const fs = require('fs')
const Promise = require('bluebird')
const readFile = Promise.promisify(fs.readFile)
require('dotenv').config()

const csvFile = require('../csvFile')
const usersFileName = 'csv/allUsersFile.csv'
const filename = 'scripts/20171120-users-incorrect-names.csv'
const {ugUsername, ugUrl, ugPwd} = process.env
const attributes = ['ugKthid', 'ugUsername', 'Sn', 'givenName', 'mail']


function getUserFromLdap(type, userId, filen) {
    return new Promise((resolve, reject) => {
        let counter = 0

        const opts = {
          filter: `${type}=${userId}`,
          scope: 'sub',
          paged: true,
          sizeLimit: 1000,
          attributes
        }
    
        ldapClient.search('OU=UG,DC=ug,DC=kth,DC=se', opts, function (err, res) {
          if (err) {
            throw err
          }
          res.on('searchEntry', function (entry) {
            counter++
            //console.log(entry.object)
            // console.log('.')
            const o = entry.object
            const userName = `${o.ugUsername}@kth.se`
            csvFile.writeLine([o.ugKthid, userName, o.givenName, o.sn, o.mail, 'active'], filen)
          })
          res.on('error', function (err) {
            console.error('error: ', err.message)
          })
          res.on('end', function (result) {
              if (counter==0) {
                  console.log(type, " ", userId)
              }
            //console.log('Done with ', counter, 'user is ', userId)
            resolve()
          })
        })
      })
}

async function fetchUsers () {
    try {
        const usersFromCsvFile = await readFile(filename, 'utf8')
        const stringsArr = usersFromCsvFile.split('\r')

        if (!(ugUsername && ugUrl && ugPwd)) {
          console.log(`
              Kan inte skapa csvfil med alla användare i
              kurser (enrollments) eftersom alla hemligheter inte är angivna.
              Jag behöver ugUsername, ugUrl och ugPwd i filen .env.
              Hoppar över att skapa fil med enrollments.
              `)
        } else { 
            await deleteFile(usersFileName)
            await csvFile.writeLine(['user_id', 'login_id', 'first_name', 'last_name', 'email', 'status'], usersFileName)
            await bindLdapClient()

            for(let line of stringsArr){
                const kthId = line.split(';')[1]
                if (kthId) {
                    await getUserFromLdap('ugKthidSearch', kthId, usersFileName)
                }
                else {
                    userN = line.split(';')[4]
                    //console.log("User have no kthId, but email: ", userN.split('@')[0], "whole ", line)
                    await getUserFromLdap('ugUsername', userN.split('@')[0], usersFileName)
                }
                
            }
        }
    } catch(e) {
        console.log('error in fetch user: ', e)
    } finally {
        await ldapClient.unbindAsync()
    }
}


function deleteFile (filen) {
    return fs.unlinkAsync(filen)
        .catch(e => console.log("couldn't delete file. It probably doesn't exist. This is fine, let's continue"))
  }
function bindLdapClient () {
    return ldapClient.bindAsync(ugUsername, ugPwd)
}

const ldapClient = Promise.promisifyAll(ldap.createClient({
    url: "ldaps://ldap.ug.kth.se"
}))


fetchUsers()