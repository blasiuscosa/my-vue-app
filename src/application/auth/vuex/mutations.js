import { logout, setAuth } from 'src/services/authService'
import { setApiDefaults } from 'src/boot/axios'
import { LOGOUT, SET_LOGIN_INFO, SET_TOKEN, UNSET_TOKEN } from '../../../store/types'
import { LOGGED_IN_STOCKIST_ID, LOGGED_IN_USER_ID, LOGGED_IN_USER_NAME } from 'src/store/localStorageKeys'
import Raven from 'raven-js'
import helpers from 'src/helpers'

export default {
  [SET_TOKEN](state, data) {
    let accessToken = data.access_token
    let expiresIn = data.expires_in
    let refreshToken = data.refresh_token
    state.auth = {
      accessToken: accessToken,
      expiresIn: expiresIn,
      refreshToken: refreshToken,
    }
    setAuth(state.auth)
    setApiDefaults()
  },
  [UNSET_TOKEN](state) {
    state.auth = {}
  },
  [SET_LOGIN_INFO](state, data) {
    return new Promise(resolve => {
      state.isLoggedIn = true
      state.loggedInUser = data
      localStorage.setItem(LOGGED_IN_USER_NAME, helpers.encrypt(data.name + '|' + data.email))
      localStorage.setItem(LOGGED_IN_USER_ID, helpers.encrypt(data.id))
      localStorage.setItem(LOGGED_IN_STOCKIST_ID, helpers.encrypt(helpers.getValue(data, 'stockist.id', null)))
      if (process.env.LOG_SENTRY === 'true') {
        Raven.setUserContext({
          name: data.name,
          id: data.old_member_id,
        })
      }
      resolve(data)
    })
  },
  [LOGOUT](state) {
    state.isLoggedIn = false
    logout()
  },
}
