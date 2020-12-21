import Vue from 'vue'
import { mapMutations } from 'vuex'

export default {
  data: () => ({
    columns: [
      {
        name: 'channel_id',
        label: window.il8n.t('sales.DTableLabel.Channel'),
        field: 'channel',
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.name
          }
        },
        sortable: true,
      },
      {
        name: 'transaction_location_id',
        label: window.il8n.t('sales.DTableLabel.TLocation'),
        field: 'transaction_location',
        sortable: true,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.code
          }
        },
      },
      {
        name: 'transaction_date',
        label: window.il8n.t('sales.DTableLabel.TDate'),
        field: 'transaction_date',
        sortable: true,
      },
      {
        name: 'sale_medium',
        label: window.il8n.t('Common.DTableLabel.Type'),
        field: 'sale_medium',
        align: 'center',
        sortable: false,
      },
      {
        name: 'document_number',
        label: window.il8n.t('sales.DTableLabel.salesDocNo'),
        field: 'document_number',
        sortable: true,
        format(value) {
          if (value !== null) {
            return value
          } else {
            return '-'
          }
        },
      },
      {
        name: 'invoices',
        label: window.il8n.t('sales.DTableLabel.InvoiceDate'),
        field: 'invoices',
        sortable: false,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.created_at
          } else {
            return '-'
          }
        },
      },
      {
        name: 'tax_invoice_number',
        label: window.il8n.t('sales.DTableLabel.salesTaxInvoiceNo'),
        field: 'invoices',
        sortable: false,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.invoice_number
          } else {
            return '-'
          }
        },
      },
      {
        name: 'ibo_id',
        label: window.il8n.t('sales.DTableLabel.iboId'),
        field: row => (row.member !== null ? row.member : row.enrollment_sale),
        sortable: false,
        format(value, row) {
          if (value !== null && value.user !== null && typeof value.user !== 'undefined') {
            return value.user.old_member_id
          } else {
            return 'UNKNOWN'
          }
        },
      },
      {
        name: 'members.name',
        label: window.il8n.t('sales.DTableLabel.iboName'),
        field: row => (row.member !== null ? row.member : row.enrollment_sale),
        sortable: false,
      },
      {
        name: 'total_cv',
        label: window.il8n.t('sales.DTableLabel.totalCv'),
        field: 'total_cv',
        sortable: true,
      },
      {
        name: 'total_gmp',
        label: window.il8n.t('sales.DTableLabel.TAmount'),
        field: 'total_gmp',
        sortable: true,
      },
      {
        name: 'order_status_id',
        label: window.il8n.t('sales.DTableLabel.OStatus'),
        field: 'order_status',
        sortable: true,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.title
          }
        },
      },
      {
        name: 'delivery_status_id',
        label: window.il8n.t('sales.DTableLabel.DStatus'),
        field: 'delivery_status',
        sortable: true,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.title
          }
        },
      },
      {
        name: 'delivery_method_id',
        label: window.il8n.t('sales.DTableLabel.DMethod'),
        field: 'delivery_method',
        sortable: true,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.title
          }
        },
      },
      {
        name: 'created_by',
        label: window.il8n.t('Common.DTableLabel.CreatedBy'),
        field: 'created_by',
        sortable: true,
        format(value) {
          if (typeof value !== 'undefined' && value !== null) {
            return value.name
          }
        },
      },
    ],
  }),
  computed: {
    isRentalSale() {
      return this.$helpers.getValue(this.$route, 'meta.isRental')
    },
  },
  methods: {
    ...mapMutations({
      setOrderData: 'SET_ORDER_DATA',
      unSetOrderData: 'UNSET_ORDER_DATA',
    }),
    getSalesMedium(data) {
      let medium = {
        label: this.$t('Common.Sales.Text'),
        color: 'green',
      }
      if (data.is_esac_redemption === 1) {
        medium = {
          label: this.$t('Common.Esac.Text'),
          color: 'amber',
        }
      }
      if (data.is_rental_sale_order === 1) {
        medium = {
          label: this.$t('Common.Rental.Text'),
          color: 'red',
        }
      }
      if (data.is_product_exchange === 1) {
        medium = {
          label: this.$t('Common.Exchange.Text'),
          color: 'primary',
        }
      }
      if (data.is_enrollment_sale === 1 || data.is_enrollment_sale) {
        medium = {
          label: this.$t('Common.Enrol.Text'),
          color: 'deep-purple',
        }
      }
      if (data.is_autoship_subscription_sale === 1 || data.is_autoship_subscription_sale) {
        medium = {
          label: this.$t('Common.Autoship.Text'),
          color: 'pink',
        }
      }
      return medium
    },
    async routePage(data) {
      // TODO update this route logic
      this.unSetOrderData({ uplineUserID: '', downlineUserID: '', downlineOrder: false })
      let saleID = data.id
      let esacRedemption = data.is_esac_redemption
      let enrollmentSales = data.is_enrollment_sale
      let productExchangeID =
        data.is_product_exchange === 1 && data.sale_exchange !== null && data.sale_exchange !== undefined
          ? data.sale_exchange.id
          : -1
      let isLegacyProductExchange =
        data.is_product_exchange === 1 &&
        data.sale_exchange !== null &&
        data.sale_exchange !== undefined &&
        data.sale_exchange.legacy_invoice_id !== null &&
        data.sale_exchange.legacy_invoice_id !== undefined &&
        data.sale_exchange.legacy_invoice_id !== ''
      if (!data.newOrder) {
        data = {
          uplineUserID: data.sponsor_id !== 0 ? data.sponsor_id : '',
          downlineUserID: data.user_id,
          downlineOrder: false,
          skipDownline: data.skipDownline,
          corporateOrder: data.corporateOrder,
          saleID: saleID,
          isEnrollmentCompleted: enrollmentSales ? data.is_enrollment_complete : false,
        }
        this.setOrderData(data)
        if (productExchangeID !== -1) {
          if (isLegacyProductExchange) {
            if (await this.routePageInfo(this.$t('Common.modules.legacy_product_exchange'))) {
              await this.$router.push({
                name: 'Legacy Product Exchange Detail',
                params: { exchangeID: productExchangeID },
              })
            }
          } else {
            if (await this.routePageInfo(this.$t('Common.modules.product_exchange'))) {
              await this.$router.push({ name: 'Sales Exchange Detail', params: { exchangeID: productExchangeID } })
            }
          }
        } else if (esacRedemption === 1) {
          if (await this.routePageInfo(this.$t('Common.modules.esac'))) {
            await this.$router.push({ name: 'Update eSac Redemption', params: { saleID: saleID, referer: 0 } })
          }
        } else if (enrollmentSales) {
          if (this.isRentalSale) {
            if (await this.routePageInfo(this.$t('Common.modules.rentalEnrolment'))) {
              await this.$router.push({ name: 'Rental Enrolment Detail', params: { saleID: saleID } })
            }
          } else {
            if (await this.routePageInfo(this.$t('Common.modules.enrolment'))) {
              await this.$router.push({ name: 'Enrolment Detail', params: { saleID: saleID } })
            }
          }
        } else {
          if (this.isRentalSale) {
            await this.$router.push({ name: 'View Rental Sales Order', params: { saleID: saleID } })
          } else {
            await this.$router.push({ name: 'View Sales Order', params: { saleID: saleID } })
          }
        }
      } else {
        this.setOrderData(data)
        if (this.isRentalSale) {
          await this.$router.push({ name: 'New Rental Sales Order' })
        } else {
          await this.$router.push({ name: 'New Sales Order' })
        }
      }
    },
    async routePageInfo(medium) {
      let confirm = false
      await new Promise(resolve => {
        this.$q
          .dialog({
            title: this.$t('Common.ActionRequired.Title'),
            ok: this.$t('sale.cancellation.detail.dialog.confirmSave.ok'),
            cancel: this.$t('sale.cancellation.detail.dialog.confirmSave.cancel'),
            noBackdropDismiss: true,
            noEscDismiss: true,
            message: this.$t('Common.PageRedirect.Info', { medium: medium }),
          })
          .onOk(() => {
            confirm = true
            resolve(true)
          })
      })
      return confirm
    },
    getDisplayMemberName(row) {
      if (row.member === null && row.enrollment_sale !== null) {
        let enrolmentData = JSON.parse(row.enrollment_sale.temp_data)
        if (
          enrolmentData.member_data !== null &&
          enrolmentData.member_data !== undefined &&
          enrolmentData.member_data.details !== null &&
          enrolmentData.member_data.details !== undefined
        ) {
          return enrolmentData.member_data.details.name
        }
      } else if (row.member !== null) {
        return row.member.name
      }
      return 'UNKNOWN'
    },
  },
}
