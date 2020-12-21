import axios from 'axios'
import { DEV_API_PROXY, DEV_API_PROXY_OPTIONS } from 'src/store/localStorageKeys'
import { SHOW_NOTIFICATION, VALIDATION_FAILED } from 'src/store/types'
import helpers from 'src/helpers'
import { url } from 'src/config/urls'
import acl from 'src/services/aclService'
import { getAccessToken, getLang, getRefreshToken, isAuthenticated, isTokenExpired } from 'src/services/authService'
import querystring from 'querystring'
import _ from 'lodash'
import config from 'src/config'
const queryString = require('query-string')

export const service = axios.create({
  baseURL: url.apiUrl,
  timeout: 300 * 1000, // API request timeout set to 300s
})

export function setApiLanguage(langCode) {
  service.defaults.headers.post['Accept-Language'] = langCode
  service.defaults.headers.get['Accept-Language'] = langCode
}

export function setApiDefaults() {
  // Fallback of setAuth set default token if user refresh the page
  service.defaults.headers.common['Authorization'] = `Bearer ${getAccessToken()}`
  service.defaults.headers.post['Content-Type'] = 'application/json'
  service.defaults.headers.post['Accept'] = 'application/json'
  service.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
}

export default ({ store, Vue }) => {
  let refreshSubscribers = []
  let isRefreshing = false

  const pending = {}

  let retryCount = 5
  let retryDelay = 1000 * 5
  let skipRetry = false

  /** state endpoint url to rule from checking based on allowed type **/
  let endpointsRulesList = config.plugins.axios.endpointRules

  /**
   * Developers Api config
   */
  function setDevApiProxy() {
    if (process.env.DEV) {
      let localStorageApiProxy = localStorage.getItem(DEV_API_PROXY)
      let options = []
      const requireComponent = require.context('../../', true, /dev.conf.js$/)
      requireComponent.keys().forEach(fileName => {
        options = [...requireComponent(fileName).proxys]
      })
      localStorage.setItem(DEV_API_PROXY_OPTIONS, JSON.stringify(options))
      if (localStorageApiProxy === null && options.length > 0) {
        let apiProxy = options.find(url => url.env === process.env.PROXY_ENV_DEFAULT)
        localStorage.setItem(DEV_API_PROXY, apiProxy.value)
      }
    }
  }

  /**
   * Refresh token callback temp holder
   * @param cb request callback
   */
  function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb)
  }

  /**
   * Refresh token and remap token
   * @param token
   */
  function onRefreshed(token) {
    refreshSubscribers.map(cb => cb(token))
  }

  /** queue up requests **/
  const removePending = async (config, rule = false, request = false) => {
    if (config !== undefined) {
      let cancelToken = false
      let url = config.url.replace(config.baseURL, '')
      // Post data from request|object and response|string not equal do conversion
      // stringify whole RESTful request with URL params
      // remove all undefined variables from request & response before store in pending
      let configData = config.data

      let params = null

      if (config.method === 'get') {
        // Remove queryString if get method
        let urlBreakup = url.split('?', 2)
        url = urlBreakup[0]
        configData = queryString.parse(urlBreakup[1])
      }

      // if config return data as string instead of object we parse back to object
      if (typeof config.data === 'string') {
        configData = JSON.parse(config.data)
      }

      if (helpers.getValue(rule, 'cancelRequestWithParams')) {
        params = querystring.stringify(_.pickBy(configData, _.identity))
      }
      let flagUrl = url + '&' + config.method + '&' + params

      if (!rule || (rule && !rule.skipCancelRequest)) {
        cancelToken = await store.dispatch('generateCancelToken', flagUrl)
        config.cancelToken = cancelToken.token
        config.cancelTokenCancel = cancelToken.cancel
      }

      /** Skip Global loading conditionally by passing skipLoading through POST or GET params */
      let conditionalSkipLoading = Vue.prototype.$helpers.getValue(configData, 'skipLoading')

      if (flagUrl in pending) {
        if (!request) {
          delete pending[flagUrl]
          store.dispatch('wait/end', flagUrl, { root: true })
        }
      } else {
        if (request) {
          pending[flagUrl] = cancelToken.cancel
          if ((!rule || (rule && !rule.skipLoading)) && !conditionalSkipLoading) {
            store.dispatch('wait/start', flagUrl, { root: true })
          }
        }
      }
    }
  }

  /** axios interceptors **/
  service.interceptors.request.use(
    async config => {
      let rule = false
      let continueNext = true
      /** you can apply cancel token to all or specific requests **/
      /** e.g. except config.method == 'options' **/
      endpointsRulesList.filter(item => {
        if (config.url.includes(item.url)) {
          rule = item
        }
      })

      let version = helpers.getValue(rule, 'version')

      if (version) {
        config.baseURL = config.baseURL.replace('v1', version || 'v1')
      }

      await removePending(config, rule, true)

      if (!helpers.getValue(rule, 'skipAcl')) {
        continueNext = await acl.aclPermissionProcessor(false, true)
      }

      if (!continueNext) {
        if (typeof config.cancelTokenCancel === 'function') {
          config.cancelTokenCancel('Forbidden')
        }
      }
      return Promise.resolve(config)
    },
    error => {
      return Promise.reject(error)
    }
  )

  /** axios interceptors **/
  service.interceptors.response.use(
    async response => {
      let rule = false
      endpointsRulesList.filter(item => {
        if (response.config.url.includes(item.url)) {
          rule = item
        }
      })
      await removePending(response.config, rule)
      return response
    },
    async error => {
      if (error.config !== undefined) {
        let rule = false
        endpointsRulesList.filter(item => {
          if (error.config.url.includes(item.url)) {
            rule = item
          }
        })
        await removePending(error.config, rule)
      }
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      } else {
        /** Handle axios timeout error **/
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
          store.dispatch('wait/start', 'retryRequest', { root: true })
          let config = error.config
          /** If config does not exist or the retry option is not set, reject **/
          if (!config) return Promise.reject(error)

          /** Set the variable for keeping track of the retry count **/
          config.headers = { retryCount: config.headers.retryCount || 0 }

          /** Check if we've maxed out the total number of retries **/
          if (config.headers.retryCount >= retryCount || skipRetry) {
            /** Reject with the error **/
            store.dispatch('wait/end', 'retryRequest', { root: true })
            store.commit(SHOW_NOTIFICATION, {
              title: window.il8n.t('operation.failed'),
              message: window.il8n.t('Common.Notification.SomethingWentWrongRetryFailed.Message'),
              type: 'negative',
              html: true,
            })
            return Promise.reject(error)
          }

          /** Increase the retry count **/
          config.headers.retryCount += 1

          /** Create new promise to handle exponential back office **/
          let retry = new Promise(function(resolve) {
            setTimeout(function() {
              resolve()
            }, retryDelay || 1)
          })

          /** Return the promise in which recalls axios to retry the request **/
          return retry.then(function() {
            store.dispatch('wait/end', 'retryRequest', { root: true })
            return service(config)
          })
        } else {
          const {
            config,
            response: { status = 0, data },
          } = error
          const originalRequest = config
          if (
            isAuthenticated &&
            status === 401 &&
            typeof data.error !== 'undefined' &&
            ((typeof data.error.message !== 'undefined' && data.error.message === 'Unauthenticated.') ||
              data.error === 'Unauthenticated.')
          ) {
            if (!isRefreshing) {
              if (getRefreshToken() !== null) {
                isRefreshing = true
                const refreshToken = `${getRefreshToken()}`
                let query = {
                  refresh_token: refreshToken,
                }
                store
                  .dispatch('refreshTokenAction', query)
                  .then(newToken => {
                    isRefreshing = false
                    onRefreshed(newToken)
                  })
                  .catch(() => {
                    store.dispatch('logoutAction', {
                      skipServerLogout: true,
                      expired: isTokenExpired(),
                      onLogoutRefresh: true,
                    })
                  })
              } else {
                store.dispatch('logoutAction', { skipServerLogout: true })
              }
            }
            return new Promise(resolve => {
              subscribeTokenRefresh(token => {
                // replace the expired token and retry
                // Pass new access token
                originalRequest.headers['Authorization'] = `Bearer ${token.access_token}`
                resolve(service(originalRequest))
              })
            })
          } else {
            let config = false
            endpointsRulesList.filter(item => {
              if (error.config.url.includes(item.url)) {
                config = item
              }
            })
            if (status === 401) {
              store.commit(SHOW_NOTIFICATION, {
                title: window.il8n.t('operation.failed'),
                message: helpers.getValue(
                  error,
                  'response.data.error.message',
                  window.il8n.t('Common.Notification.Default.Credentials.Error.Message')
                ),
                type: 'negative',
              })
            }

            if (status === 403) {
              store.commit(SHOW_NOTIFICATION, {
                title: window.il8n.t('operation.failed'),
                message: helpers.getValue(
                  error,
                  'response.data.error.message',
                  window.il8n.t('Common.Notification.Default.AccessDenied.Error.Message')
                ),
                type: 'negative',
              })
            }

            if (status === 422) {
              if (!helpers.getValue(config, 'skipServerValidation')) {
                let message = helpers.getValue(error, 'response.data.error')
                if (typeof message === 'object') {
                  message = helpers.getValue(error, 'response.data.error.message')
                }
                store.commit(SHOW_NOTIFICATION, {
                  title: window.il8n.t('operation.failed'),
                  message: message || window.il8n.t('Common.Notification.Default.Validation.Error.Message'),
                  type: 'negative',
                })
              }
              store.commit(VALIDATION_FAILED, { errors: error.response.data })
            }

            return Promise.reject(error)
          }
        }
      }
    }
  )

  /** Clear pending request on route change **/
  service.clear = () => {
    Object.keys(pending).map(e => {
      store.dispatch('wait/end', e, { root: true })
      if (pending[e]) {
        pending[e](e)
        delete pending[e]
      }
    })
  }

  /** Initial triggers **/
  setDevApiProxy()
  setApiLanguage(getLang())
  setApiDefaults()

  /** Assign custom $http prototype for custom axios instance **/
  Vue.prototype.$http = service
}
