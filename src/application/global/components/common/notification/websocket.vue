<template>
  <div />
</template>
<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      websocket: state => state.globalCMP.websocket,
    }),
  },
  watch: {
    websocket: {
      handler: function() {
        if (
          this.websocket.channels !== null &&
          this.websocket.channels !== undefined &&
          this.websocket.channels !== ''
        ) {
          if (this.websocket.channels.length > 0) {
            this.websocket.channels.forEach(item => {
              this.showToast('Websocket', item.response.data, 'positive')
            })
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    showToast(title, message, type) {
      // todo make duration option dynamic
      // Using Element UI Notification with default duration 9sec
      // @title String
      // @message String
      // @type String success/warning/info/error
      // @duration Number
      const icon = {
        positive: 'thumb_up',
        negative: 'warning',
        info: 'info',
        warning: 'priority_high',
      }
      const alert = this.$q.notify({
        duration: 1500,
        enter: 'bounceInRight',
        leave: 'bounceOutRight',
        inline: true,
        color: type,
        icon: icon[type],
        message: `<h6>` + title + `</h6>` + `<p>` + message + `</p>`,
        position: 'top-right',
      })

      setTimeout(() => {
        alert.dismiss()
      }, 5000)
    },
  },
}
</script>
