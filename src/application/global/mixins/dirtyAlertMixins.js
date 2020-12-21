import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
  },
  data: () => ({
    isDirty: false,
    skipDirtyAlert: false,
    dirtyCount: 0,
  }),
  beforeRouteLeave(to, from, next) {
    if (this.isDirty && !this.skipDirtyAlert) {
      this.$q
        .dialog({
          title: 'Warning',
          message: 'Do you really want to leave? you have unsaved changes!',
          cancel: {
            outline: true,
            color: 'negative',
            label: 'No',
            rounded: true,
            uneleveted: true,
          },
          ok: {
            color: 'positive',
            label: 'Yes',
            rounded: true,
            uneleveted: true,
          },
        })
        .onOk(() => {
          next()
        })
        .onCancel(() => {
          next(false)
        })
    } else {
      next()
    }
  },
  methods: {
    dirtyCheckerSkipTimer(timeout = 1500) {
      let timer = setInterval(() => {
        if (!this.$wait.any) {
          setTimeout(() => {
            this.resetDirtyChecker()
          }, timeout)
          clearInterval(timer)
        }
      }, 100)
    },
    dirtyChecker() {
      if (this.skipDirtyAlert === false) {
        this.dirtyCount += 1
        this.isDirty = this.dirtyCount > 0
      }
    },
    skipDirtyChecker(inlineDisable = false) {
      if (!inlineDisable) {
        this.dirtyCount = 0
        this.skipDirtyAlert = true
        this.isDirty = false
      }
    },
    resumeDirtyChecker(inlineDisable = false) {
      if (!inlineDisable) {
        this.dirtyCount = 0
        this.skipDirtyAlert = false
        this.isDirty = false
      }
    },
    resetDirtyChecker(countDecrementBy = 0) {
      this.dirtyCount = countDecrementBy === 0 ? 0 : this.dirtyCount - countDecrementBy
      this.skipDirtyAlert = false
      this.isDirty = this.dirtyCount > 0
    },
  },
}
