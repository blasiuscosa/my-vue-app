import { mapGetters } from 'vuex'
import { calculateUnpaidBalance } from 'src/utils/payments/calculation'
import { Dialog } from 'quasar'

export default {
  computed: {
    ...mapGetters(['getArea']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    getSaleDownloadableInfo() {
      return [
        {
          label: this.$t('Sales.CreditNote.Text'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'sale_cancellation.sale_id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'sale_cancellation.credit_note.credit_note_number', '-N/A-'),
            type: 'creditNote',
          },
          show: this.$helpers.isSet(this.areaData, 'sale_cancellation.credit_note', ['notNull', 'notEmpty']),
          permission: 'public',
        },
      ].filter(x => x.show)
    },
  },
  methods: {
    async handleTriggerActions(workflowField, action) {
      switch (workflowField.trigger) {
        case 'updateRejectionReason':
          this.rejectReason = workflowField.value
          break
        case 'sendDecline':
          this.$v.cancellationData.workflow.current_step.$touch()
          if (!this.$v.cancellationData.workflow.current_step.$error) {
            if (!workflowField.require_confirmation) {
              workflowField.rejection_reason = this.rejectReason
              this.submitApprovalStep(workflowField)
            } else {
              await new Promise(resolve => {
                Dialog.create({
                  title: this.$t('sale.cancellation.detail.dialog.confirmSave.title'),
                  message: workflowField.conformation_message,
                  noEscDismiss: true,
                  noBackdropDismiss: true,
                  position: 'top',
                  ok: this.$t('sale.cancellation.detail.dialog.confirmSave.ok'),
                  cancel: this.$t('sale.cancellation.detail.dialog.confirmSave.cancel'),
                }).onOk(() => {
                  workflowField.rejection_reason = this.rejectReason
                  this.submitApprovalStep(workflowField)
                  resolve(true)
                })
              })
            }
          }
          break
        case 'sendApproval':
        case 'generateCN':
        case 'processRefund':
          if (!workflowField.require_confirmation) {
            this.submitApprovalStep(workflowField)
          } else {
            await new Promise(resolve => {
              Dialog.create({
                title: this.$t('sale.cancellation.detail.dialog.confirmSave.title'),
                message: workflowField.conformation_message,
                noEscDismiss: true,
                noBackdropDismiss: true,
                position: 'top',
                ok: this.$t('sale.cancellation.detail.dialog.confirmSave.ok'),
                cancel: this.$t('sale.cancellation.detail.dialog.confirmSave.cancel'),
              }).onOk(() => {
                this.submitApprovalStep(workflowField)
                resolve(true)
              })
            })
          }
          break
        case 'toggleChildVisibility':
          this.toggleChildVisibility(action)
          break
        case null:
        case undefined:
        default:
      }
    },
  },
}
