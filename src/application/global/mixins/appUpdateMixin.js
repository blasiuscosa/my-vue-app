import { APP_UPDATED_TIMESTAMP } from 'src/store/localStorageKeys'
import config from 'src/config'
import { Loading } from 'quasar'
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      refreshing: false,
      registration: null,
      updateExists: false,
      timerCount: 0,
      interval: '',
    }
  },
  watch: {
    updateExists(to) {
      this.setIsUpdateAvailableAction(to)
    },
    timerCount(to) {
      localStorage.setItem(APP_UPDATED_TIMESTAMP, to)
    },
  },
  computed: {
    getTimerMinuets() {
      if (this.timerCount < 1) {
        this.refreshApp()
      }
      return this.$helpers.makeSecondsToMinuets(this.timerCount)
    },
    ...mapGetters(['getIsUpdateAvailable']),
  },
  created() {
    // Listen for our custom event from the SW registration
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    // Prevent multiple refreshes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.refreshing) return
      this.refreshing = true
      // Here the actual reload of the page occurs
      window.location.reload()
    })
  },
  methods: {
    ...mapActions(['setIsUpdateAvailableAction']),
    activateTimer() {
      if (this.timerCount > 0) {
        this.timerCount--
      }
    },
    // Store the SW registration so we can send it a message
    // We use `updateExists` to control whatever alert, toast, dialog, etc we want to use
    // To alert the user there is an update they need to refresh for
    updateAvailable(event) {
      this.registration = event.detail
      this.updateExists = true
      this.timerCount = localStorage.getItem(APP_UPDATED_TIMESTAMP) || config.pwa.autoUpdateTimer
      this.interval = setInterval(() => this.activateTimer(), 1000)
    },
    // Called when the user accepts the update
    refreshApp() {
      Loading.show({
        message: this.$t('Common.UpdateProcessOnGoing.Text'),
        messageColor: 'primary text-h6',
        spinnerSize: 80, // in pixels
        spinnerColor: 'primary-darkened',
        backgroundColor: 'white',
      })
      this.updateExists = false
      clearInterval(this.interval)
      localStorage.removeItem(APP_UPDATED_TIMESTAMP)
      // Make sure we only send a 'skip waiting' message if the SW is waiting
      if (!this.registration || !this.registration.waiting) return
      // send message to SW to skip the waiting and activate the new SW
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    },
  },
}
