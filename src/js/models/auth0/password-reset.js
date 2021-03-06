import { storageKeys } from './webAuth'
import { parameter } from '../../get-url-parameter'
import adminUrls from '../../admin-urls'
import browser from '../../browser'
import localStorage from '../../localStorage'

module.exports = function () {
  Object.keys(storageKeys)
    .forEach(k => localStorage.remove(storageKeys[k]))

  const action = parameter('success') === 'true'
    ? () => browser.redirect(adminUrls.login)
    : () => browser.redirect(adminUrls.fiveHundred)

  action()
}
