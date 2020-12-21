<template>
  <div />
</template>
<script>
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
        if (this.notification.message !== '' && this.notification.title !== '') {
          this.showToast(this.notification.title, this.notification.message, this.notification.type)
        }
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
    showToast(title, message, type) {
      // Using Element UI Notification with default duration 9sec
      const icon = {
        positive: 'thumb_up',
        negative: 'warning',
        info: 'info',
        warning: 'priority_high',
      }
      this.$q.notify({
        message: message,
        timeout: this.appSettings.notifications.timeout,
        type: type,
        icon: icon[type],
        position: 'bottom-right',
        actions: [
          {
            label: 'X',
            handler: () => {},
          },
        ],
      })
    },
  },
}
</script>
