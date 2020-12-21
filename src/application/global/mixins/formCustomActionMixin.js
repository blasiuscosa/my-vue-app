import { SHOW_NOTIFICATION } from 'src/store/types'

/**
 *
 * Accepts below  attributes
 * {
        vuexAction: 'doGeneralReceiptCancellationAction',
        dataCallback: performReceiptCancellation,
        label: receiptData.receipt_number,
        operation: 'cancel',
        show: !isNewReceipt,
      }
 * */

export default {
  methods: {
    async customAction(actions) {
      let {
        vuexAction,
        id = null,
        label,
        operation,
        isCancel = operation === 'cancel',
        data = {},
        dataCallback,
      } = actions
      if (typeof dataCallback === 'function') {
        data = await dataCallback()
      }
      await new Promise((resolve, reject) => {
        this.$q
          .dialog({
            title: this.$t('common.words.warning'),
            message: isCancel
              ? this.$t('common.message.alert.youAreAboutToCancel', { label: label })
              : this.$t('common.message.alert.youAreAboutToDelete', { label: label }),
            noEscDismiss: true,
            noBackdropDismiss: true,
            html: true,
            position: 'top',
            ok: {
              label: this.$t('common.button.yes'),
              rounded: true,
              unelevated: true,
              color: 'action-button-success',
            },
            cancel: {
              label: this.$t('common.button.no'),
              rounded: true,
              unelevated: true,
              outline: true,
              color: 'action-button-dark',
            },
          })
          .onOk(() => {
            this.$store.dispatch(vuexAction, data ? data : id)
            resolve()
          })
          .onCancel(() => {
            this.$store.commit(SHOW_NOTIFICATION, {
              title: isCancel
                ? this.$t('common.message.info.cancelOperationAborted')
                : this.$t('common.message.info.deleteOperationAborted'),
              type: 'warning',
              actions: [
                {
                  label: this.$t('common.button.dismiss'),
                  handler: () => {},
                },
              ],
            })
            reject()
          })
      })
    },
  },
}
