export default {
  methods: {
    async prompt(data, show) {
      if (show) {
        let {
          title,
          message,
          isHtmlContent = false,
          ok = {
            label: this.$t('Product.UpdateAnyway.Button'),
            color: 'action-button-success',
            rounded: false,
            unelevated: true,
          },
          cancel = {
            label: this.$t('Common.Cancel.Button'),
            color: 'action-button-negative',
            rounded: false,
            unelevated: true,
          },
          callback = () => {},
        } = data
        await new Promise((resolve, reject) => {
          this.$q
            .dialog({
              title: title,
              message: message,
              html: isHtmlContent,
              ok: ok,
              cancel: cancel,
            })
            .onOk(() => {
              callback()
              resolve(true)
            })
            .onCancel(() => {
              reject(false)
            })
            .onDismiss(() => {})
        })
      }
    },
  },
}
