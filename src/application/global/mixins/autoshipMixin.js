import _ from 'lodash'
import { MasterDataTransformarMixin, DatesMixin } from 'src/application/global/mixins'
import { extend } from 'quasar'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  mixins: [MasterDataTransformarMixin, DatesMixin],
  props: ['subscriptionID', 'operation'],
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
    ...mapGetters(['getArea', 'getProductData', 'getKittingData', 'getAutoshipSubscriptionDetails']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    isNewOrder() {
      return !this.subscriptionID
    },
    isDisableEditing() {
      return (
        this.$helpers.getValue(this.areaData, 'status') === 0 || this.$helpers.getValue(this.areaData, 'status') === 2
      )
    },
    isAutoshipStatusActive() {
      return this.$helpers.getValue(this.areaData, 'status') === 1
    },
    getAutoshipId() {
      return this.$helpers.getValue(this.areaData, 'code')
    },
    getNextBillDate() {
      return this.formatDate(
        this.$helpers.getValue(this.areaData, 'nextBillDate', '--N/A'),
        this.appSettings.defaulted.date_format
      )
    },
    getStartBillDate() {
      return this.formatDate(
        this.$helpers.getValue(this.areaData, 'startDate', '--N/A--'),
        this.appSettings.defaulted.date_format
      )
    },
    getStatusType() {
      let status = this.$helpers.getValue(this.areaData, 'status', null)
      let medium = {
        label: this.$t('Common.New.Text'),
        color: '',
      }
      if (status === 0) {
        medium = {
          label: this.$t('Common.Terminate.Text'),
          color: 'red',
        }
      }
      if (status === 1) {
        medium = {
          label: this.$t('Common.Active.Text'),
          color: 'green',
        }
      }
      if (status === 2) {
        medium = {
          label: this.$t('Common.Completed.Text'),
          color: 'orange',
        }
      }
      return medium
    },
    getBillCycle() {
      return this.$helpers.getValue(this.areaData, 'recurringFrequency') === 1 ? 'Monthly' : '--N/A--'
    },
    getDefaultedSaleType() {
      // Forcing all item to repurchase sale_type
      // Todo waiting for backend
      return this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_TYPES, this.$const.masterData.REPURCHASE)
    },
    getSaleDownloadableInfo() {
      return [
        {
          label: this.$t('AutoShip.AutoshipNo.Text'),
          data: {
            id: null,
            value: this.getAutoshipId,
            type: null,
          },
          show: this.getAutoshipId,
          permission: 'invoice|download',
          downloadable: false,
        },
        {
          label: this.$t('AutoShip.AutoshipCode.Text'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'autoship_subscription_code', '--N/A--'),
            type: null,
          },
          show: this.$helpers.isSet(this.areaData, 'autoship_subscription_order_number', ['notNull', 'notEmpty']),
          permission: 'public',
          downloadable: false,
        },
      ].filter(x => x.show)
    },
    isReadOnly() {
      return this.isDisableEditing
    },
  },
  methods: {
    ...mapActions(['getProductByIdAction', 'getKittingProductByIdAction']),
    async getAutoshipData(data = false) {
      // Transform AutoShip data to sale data
      if (!data) {
        data = _.cloneDeep(this.getAutoshipSubscriptionDetails)
        let saleData = {
          subscription_id: parseInt(data.subscription_id),
          country_code: data.country_code,
          currency_code: data.currency_code,
          country_id: this.$helpers.getValue(data, 'country_id', null),
          status: data.status,
          downline_member_id: data.user_id,
          location_id: this.$helpers.getValue(data, 'additional_details.location_id', 1),
          location: this.$helpers.getValue(data, 'additional_details.transaction_location', null),
          stock_location_id: this.$helpers.getValue(data, 'additional_details.stock_location_id', 1),
          stock_location: this.$helpers.getValue(data, 'additional_details.stock_location', null),
          remarks: '',
          cvs: [],
          order_fees: [],
          products: [],
          kittings: [],
          promotion: [],
          startDate: data.next_bill_date,
          nextBillDate: data.next_bill_date,
          recurringFrequency: data.recurring_frequency,
          code: data.code,
          selected: {
            isBillingSameAsShipping: _.isEqual(data.shipping_address, data.billing_address),
            promotions: this.$helpers.getValue(data, 'additional_details.promotions', []),
            shipping: _.isArray(data.shipping_address) ? {} : data.shipping_address,
            billing: _.isArray(data.billing_address) ? {} : data.billing_address,
            card: data.card ? data.card : { card_id: null },
            additional_requirements: this.$helpers.getValue(data, 'additional_details.additional_requirements', {
              sizes: [],
              addresses: [],
              evoucher: [],
            }),
          },
        }
        if (data.subscription_items !== null) {
          for (const item of data.subscription_items) {
            if (item.item_mapping_model === 'product') {
              let query = {
                country_id: this.$helpers.getValue(data, 'country_id'), // todo
                product_id: item.item_mapping_id,
              }
              await this.getProductByIdAction(query)
              let product = _.cloneDeep(this.getProductData)
              product.data['quantity'] = item.quantity
              product.data['transaction_type'] = this.getDefaultedSaleType
              // Override item sale type for autoship
              let availableSaleTypes = product.data['general']['sale_types']
              product.data['is_invalid_transaction_type'] = !availableSaleTypes.includes(this.getDefaultedSaleType)
              product.data['general']['sale_types'] = [this.getDefaultedSaleType]
              saleData.products.push(product.data)
            }
            if (item.item_mapping_model === 'kitting') {
              let query = {
                country_id: this.$helpers.getValue(data, 'country_id'), // todo
                kitting_id: item.item_mapping_id,
              }
              await this.getKittingProductByIdAction(query)
              let kitting = _.cloneDeep(this.getKittingData)
              kitting.data['quantity'] = item.quantity
              kitting.data['transaction_type'] = this.getDefaultedSaleType
              // Override item sale type for autoship
              let availableSaleTypes = kitting.data['general']['sale_types']
              kitting.data['is_invalid_transaction_type'] = !availableSaleTypes.includes(this.getDefaultedSaleType)
              kitting.data['general']['sale_types'] = [this.getDefaultedSaleType]
              saleData.kittings.push(kitting.data)
            }
          }
        }
        return saleData
      } else {
        // Transform Sale data to AutoShip data
        let autoshipData = {
          subscription_id: parseInt(data.subscription_id),
          user_id: data.downline_member_id,
          country_id: data.country_id,
          country_code: data.country_id,
          currency_code: data.currency_code,
          amount: data.order_fees.total_gmp,
          card_id: data.selected.card.card_id,
          recurring_frequency: 1,
          subscription_length: -1,
          next_bill_date: this.formatDate(data.startDate, 'YYYY-MM-DD'),
          shipping_address: data.selected.shipping,
          billing_address: data.selected.billing,
          subscription_items: [],
          additional_details: {
            promotions: data.selected.promotions,
            additional_requirements: data.selected.additional_requirements,
            location_id: data.location_id,
            stock_location_id: data.stock_location_id,
          },
        }
        if (data.products && data.products.length > 0) {
          data.products.map(item => {
            let product = {
              item_mapping_model: 'product',
            }
            _.mapKeys(item, (value, key) => {
              if (key === 'product_id') {
                key = 'item_mapping_id'
                product[key] = value
              }
              if (key === 'quantity') {
                product[key] = value
              }
            })
            autoshipData.subscription_items.push(product)
          })
        }

        if (data.kittings && data.kittings.length > 0) {
          let kitting = {
            item_mapping_model: 'kitting',
          }
          data.kittings.map(item => {
            _.mapKeys(item, (value, key) => {
              if (key === 'kitting_id') {
                key = 'item_mapping_id'
                kitting[key] = value
              }
              if (key === 'quantity') {
                kitting[key] = value
              }
            })
            autoshipData.subscription_items.push(kitting)
          })
        }

        return autoshipData
      }
    },
  },
}
