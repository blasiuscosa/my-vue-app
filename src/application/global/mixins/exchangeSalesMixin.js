import { mapGetters } from 'vuex'
import { calculateUnpaidBalance } from 'src/utils/payments/calculation'

export default {
  computed: {
    ...mapGetters(['getArea']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    getSaleDownloadableInfo() {
      return [
        {
          label: this.$t('sale.exchange.detail.label.originalTaxInvoice'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'sale.invoice.invoice_number', '-N/A-'),
            type: 'invoice',
          },
          show: this.$helpers.isSet(this.areaData, 'new_sale.invoice', ['notNull', 'notEmpty']),
          permission: 'public',
        },
        {
          label: this.$t('sale.exchange.detail.label.exchangeBill'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'exchange_bill.exchange_bill_number', '-N/A-'),
            type: 'exc_bill',
          },
          show: this.$helpers.isSet(this.areaData, 'exchange_bill', ['notNull', 'notEmpty']),
          permission: 'public',
        },
        {
          label: this.$t('Sales.CreditNote.Text'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'credit_note.credit_note_number', '-N/A-'),
            type: 'creditNote',
          },
          show: this.$helpers.isSet(this.areaData, 'credit_note', ['notNull', 'notEmpty']),
          permission: 'public',
        },
        {
          label: this.$t('sale.exchange.detail.label.newTaxInvoice'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'new_sale.invoice.invoice_number', '-N/A-'),
            type: 'creditNote',
          },
          show: this.$helpers.isSet(this.areaData, 'new_sale.invoice', ['notNull', 'notEmpty']),
          permission: 'public',
        },
      ].filter(x => x.show)
    },
  },
}
