/** import something here **/
import constants from 'src/config/const'
import jquery from 'jquery'
import VueOffline from 'vue-offline'
import VueClipboard from 'vue-clipboard2'
import VueAffix from 'vue-affix'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import { version } from '../../package.json'
import VueProgressiveImage from 'vue-progressive-image'
import helpers from 'src/helpers'
import { ACCESS_TOKEN, LOGGED_IN_USER_ID, LOGGED_IN_USER_NAME } from 'src/store/localStorageKeys'
import VueEcho from 'vue-echo'
import VueWait from 'vue-wait'
import VueWorker from 'vue-worker'
import globalComponents from 'src/config/global-components'
import { i18n } from './i18n'
import listItemFormGenerator from 'ibs-vue-list-items-form-generator'
import { get, post } from 'src/helpers/api'
import { mapActions, mapMutations, mapState } from 'vuex'

let path = require('path')

/** leave the export, even if you don't use it **/
export default ({ app, store, Vue }) => {
  Vue.config.productionTip = false
  /** Constant **/
  constants.install = function() {
    Object.defineProperty(Vue.prototype, '$const', {
      get() {
        return constants
      },
    })
  }
  Vue.use(constants)
  window.$ = jquery
  window.Vue = Vue

  // Make global
  window.il8n = i18n

  /** Filters **/
  Vue.filter('formatPriceDouble', function(value) {
    if (value) {
      let priceWithDecimal = parseFloat(value).toFixed(2)
      // split number to before and after decimal point
      let x = priceWithDecimal.split('.')
      let x1 = x[0]
      let x2 = x.length > 1 ? '.' + x[1] : ''
      const rgx = /(\d+)(\d{3})/
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2')
      }
      // add the complete number back again
      return x1 + x2
    }
    return parseFloat(0.0)
  })
  Vue.filter('uppercase', function(value) {
    if (!value) return ''
    return value.toUpperCase()
  })
  Vue.prototype.$first = function(item, list) {
    return item === list[0]
  }
  Vue.prototype.$last = function(item, list) {
    return item === list[list.length - 1]
  }

  Vue.use(require('vue-shortkey'))
  Vue.use(VueOffline)
  Vue.use(VueClipboard)
  Vue.use(VueAffix)
  Vue.use(VueProgressiveImage, {
    placeholder: require('assets/' + 'no-image.png'),
  })
  Vue.use(VueWait)
  app.wait = new VueWait({
    useVuex: true,
  })
  Vue.use(VueWorker)
  Vue.use({
    install: function() {
      Object.defineProperty(Vue.prototype, '$customStore', {
        get() {
          return store
        },
      })
    },
  })
  if (process.env.LOG_SENTRY === 'true') {
    Raven.config(process.env.SENTRY_DSN, {
      release: version,
      dataCallback: function(data) {
        const stacktrace = data.exception && data.exception.values[0].stacktrace

        if (stacktrace && stacktrace.frames) {
          stacktrace.frames.forEach(function(frame) {
            if (frame.filename.startsWith('/') || frame.filename.startsWith('src')) {
              frame.filename = 'app:///' + path.basename(frame.filename)
            }
          })
        }

        return data
      },
    })
      .addPlugin(RavenVue, Vue)
      .install()
    Raven.setUserContext({
      name: helpers.decrypt(localStorage.getItem(LOGGED_IN_USER_NAME)),
      id: helpers.decrypt(localStorage.getItem(LOGGED_IN_USER_ID)),
    })
  }
  if (process.env.WEBSOCKET === 'true') {
    window.io = require('socket.io-client')
    if (process.env.ECHO_URL && process.env.ECHO_URL !== '') {
      Vue.use(VueEcho, {
        broadcaster: 'socket.io',
        host: process.env.ECHO_URL,
        auth: {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem(ACCESS_TOKEN),
          },
        },
      })
    } else {
      console.error('_ENV_ECHO_URL_NOT_SPECIFIED')
    }
  }

  if (process.env.INIT_FRESH_WIDGET === 'true') {
    window.dispatchEvent(new Event('init.freshwidget'))
  }

  // Register global components
  globalComponents.forEach(component => {
    Vue.component(component.name, component)
  })

  // List items form generator
  Vue.use(listItemFormGenerator.plugin, store, {
    provider: 'quasar',
    axios: {
      methods: {
        get: get,
        post: post,
      },
    },
  })

  // Global Mixin
  Vue.mixin({
    computed: {
      ...mapState({
        simplePagination: state => state.globalCMP.simplePagination,
        appSettings: state => state.globalCMP.appSettings,
        selectedFilters: state => state.globalCMP.selectedFilters,
      }),
    },
    methods: {
      ...mapActions(['setArea']),
      ...mapMutations({
        openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
        setFilterData: 'SET_FILTER_DATA',
        unSetFilterData: 'UNSET_FILTER_DATA',
        setNotification: 'SHOW_NOTIFICATION',
      }),
    },
  })
}
