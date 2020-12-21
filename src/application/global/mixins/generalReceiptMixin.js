import { mapActions, mapGetters } from 'vuex'
import { openURL } from 'quasar'

export default {
  computed: {
    ...mapGetters(['getArea']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    getDownloadableInfo() {
      return [
        {
          label: this.$t('modules.receipt.common.receiptNumber'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'receipt_number', '-N/A-'),
            type: 'receipt_id',
          },
          show: this.$helpers.isSet(this.areaData, 'receipt_number', ['notNull', 'notEmpty']),
          permission: 'public',
        },
        {
          label: this.$t('modules.receipt.common.receiptCancellationNumber'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'receipt_cancellation.id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'receipt_cancellation.receipt_cancellation_number', '-N/A-'),
            type: 'receipt_cancellation_id',
          },
          show: this.$helpers.isSet(this.areaData, 'receipt_cancellation', ['notNull', 'notEmpty']),
          permission: 'public',
        },
      ].filter(x => x.show)
    },
  },
  methods: {
    ...mapActions(['downloadGeneralReceiptAction']),
    getDocuments(id, type) {
      let query = {
        [type]: id,
      }
      this.downloadGeneralReceiptAction(query).then(res => {
        if (this.$helpers.isSet(res, 'links', ['notNull', 'notEmpty'])) {
          res.links.forEach(x => {
            openURL(x.download_link)
          })
        }
      })
    },
  },
}
