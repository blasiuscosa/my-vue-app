import { get, post } from '../../../helpers/api'
import { api } from '../api'
import { LOGOUT, SET_TOKEN, SHOW_NOTIFICATION, UNSET_TOKEN } from '../../../store/types'
import helpers from 'src/helpers'
import Vue from 'vue'

export const loginAction = ({ commit }, data) => {
  return new Promise((resolve, reject) => {
    post(api.login, data)
      .then(response => {
        commit(SET_TOKEN, response.data)
        commit(SHOW_NOTIFICATION, {
          title: window.il8n.t('operations.loggedIn.welcome'),
          message: window.il8n.t('operations.loggedIn.success'),
          type: 'positive',
        })

        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const refreshTokenAction = ({ commit }, data) => {
  return new Promise((resolve, reject) => {
    post(api.refreshOauthToken, data)
      .then(response => {
        commit(SET_TOKEN, response.data)

        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const resetAction = ({ commit }, data) => {
  return new Promise((resolve, reject) => {
    post(api.reset, data)
      .then(response => {
        if (response.data.status) {
          commit(SHOW_NOTIFICATION, { title: 'Reset', message: response.data.status, type: 'positive' })
        }

        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const updateAction = ({ commit }, data) => {
  return new Promise((resolve, reject) => {
    post(api.resetPassword, data)
      .then(response => {
        if (response.data.success) {
          commit(SHOW_NOTIFICATION, { title: 'Reset', message: response.data.success, type: 'positive' })
        }

        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const resetPasswordAction = ({ commit }, query) => {
  return new Promise((resolve, reject) => {
    post(api.resetPassword, query)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const logoutAction = ({ commit }, data) => {
  return new Promise((resolve, reject) => {
    if (helpers.getValue(data, 'expired')) {
      commit(SHOW_NOTIFICATION, {
        title: window.il8n.t('operation.loggedOut.sessionExpiredTitle'),
        message: window.il8n.t('operation.loggedOut.sessionExpiredMessage'),
        type: 'warning',
      })
    }
    if (helpers.isSet(data, 'skipServerLogout') === false || helpers.getValue(data, 'skipServerLogout') === false) {
      get(api.logout)
        .then(response => {
          commit(SHOW_NOTIFICATION, { title: 'Authentication', message: response.data.status, type: 'positive' })
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    }
    if (helpers.isSet(data, 'onLogoutRefresh') === false || helpers.getValue(data, 'onLogoutRefresh')) {
      setTimeout(() => {
        window.location = '/'
      }, 1500)
    }
    commit(LOGOUT)
    commit(UNSET_TOKEN)
  })
}
