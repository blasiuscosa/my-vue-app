import { register } from 'register-service-worker'
import config from 'src/config'

let isDevelopmentEnv = process.env.NODE_ENV === 'development'
let updateCheckInterval = config.pwa.updateIntervalCheck

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(registration) {
    if (isDevelopmentEnv) {
      console.log('Service worker is active.')
    }
  },

  registered(registration) {
    if (isDevelopmentEnv) {
      console.log('Service worker has been registered.')
    }
    window.setInterval(() => {
      registration.update()
    }, updateCheckInterval)
  },

  cached(/* registration */) {
    if (isDevelopmentEnv) {
      console.log('Content has been cached for offline use.')
    }
  },

  updatefound(/* registration */) {
    if (isDevelopmentEnv) {
      console.log('New content is downloading.')
    }
  },

  updated(registration) {
    if (isDevelopmentEnv) {
      console.log('New content is available; please refresh.')
    }
    /** Apply 10s delay to allow appUpdateMixin Load to listen custom event */
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }))
    }, 10000)
  },

  offline() {
    if (isDevelopmentEnv) {
      console.log('No internet connection found. App is running in offline mode.')
    }
  },

  error(err) {
    if (isDevelopmentEnv) {
      console.error('Error during service worker registration:', err)
    }
  },
})
