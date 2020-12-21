import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
      notification: state => state.globalCMP.notification,
    }),
  },
  watch: {
    notification: {
      handler: function() {
        let title = this.notification.title !== '' ? this.notification.title : '-- N/A --'
        let message = this.notification.message !== '' ? this.notification.message : '-- N/A --'
        let type = this.notification.type !== '' ? this.notification.type : 'warning'
        this.showToast(title, message, type)
      },
      deep: true,
    },
  },
  methods: {
    /**
     * Show notification
     * @param title
     * @param message
     * @param type
     */
    showToast(title, message, type = 'info') {
      // Using Element UI Notification with default duration 9sec
      const icon = {
        positive: 'thumb_up',
        negative: 'warning',
        info: 'info',
        warning: 'priority_high',
      }
      this.$q.notify({
        message: title,
        caption: message,
        html: true,
        timeout: this.appSettings.notifications.timeout,
        type: type,
        icon: icon[type],
        position: 'top-right',
        progress: true,
        actions: [
          {
            label: 'Dismiss',
            color: 'white',
            handler: () => {
              /* ... */
            },
          },
        ],
      })
    },
  },
}
