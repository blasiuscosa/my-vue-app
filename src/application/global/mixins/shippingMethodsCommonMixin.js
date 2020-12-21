import _ from 'lodash'
import { debounce } from 'quasar'
import masterData from 'src/utils/mappings/masterData'
import { mapGetters } from 'vuex'

export default {
  props: {
    value: {
      type: Object,
    },
    memberAddresses: {
      type: Array,
      default: () => [],
    },
    countryId: {
      type: Number,
    },
    transactionLocationId: {
      type: Number,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    enableCrossCountry: {
      type: Boolean,
      default: false,
    },
    enableRecipientCrossCountry: {
      type: Boolean,
      default: true,
    },
    enableAllCallCodeOption: {
      type: Boolean,
      default: false,
    },
    recipientNameLabel: {
      type: String,
      default: 'Recipient Name',
    },
    recipientEmailLabel: {
      type: String,
      default: 'Recipient Email',
    },
    recipientPhoneNumberLabel: {
      type: String,
      default: 'Recipient Phone Number',
    },
    availableShippingOptions: {
      type: Array,
      default: () => [],
    },
    removeSelfPickup: {
      type: Boolean,
      default: false,
    },
    removeDelivery: {
      type: Boolean,
      default: false,
    },
    removeWithoutShipping: {
      type: Boolean,
      default: false,
    },
    triggerValidation: {
      type: Boolean,
      default: false,
    },
    disableCollectionPointSelection: {
      type: Boolean,
      default: false,
    },
    debounceMs: {
      type: Number,
      default: 300,
    },
    isAddressOnly: {
      type: Boolean,
      default: false,
    },
    readOnlyAddressTitle: {
      type: String,
    },
    showNameField: {
      type: Boolean,
      default: true,
    },
    showPhoneField: {
      type: Boolean,
      default: true,
    },
    showEmailField: {
      type: Boolean,
      default: false,
    },
    skipValidation: {
      type: Boolean,
      default: false,
    },
    autoFillData: {
      type: Object,
    },
  },
  data: () => ({
    localAddressData: {},
    commonInit: false,
    cacheData: {},
  }),
  watch: {
    localAddressData: {
      async handler(to) {
        await this.update(to)
      },
      deep: true,
    },
    autoFillData: {
      handler(to) {
        if (Object.keys(to).length > 0) {
          this.localAddressData = { ...this.localAddressData, ...to }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async created() {
    this.update = debounce(this.update, this.debounceMs)
    this.callback = debounce(this.callback, this.debounceMs)
    if (!this.isAddressOnly) {
      await this.getMasterMapping()
    }
    this.localAddressData = { ...this.value, ...this.localAddressData }
    this.commonInit = true
  },
  computed: {
    ...mapGetters(['callCodeOptionsByCountryName']),
    ...masterData({
      getMasterMapping: {
        mappings: {
          'masterKey.SALE_DELIVERY_METHOD': {
            shippingDeliveryID: 'masterData.DELIVERY',
            shippingSelfPickupID: 'masterData.SELF_PICK_UP',
            shippingWithoutShippingID: 'masterData.WITHOUT_SHIPPING',
            shippingDeliverOptions: 'options',
          },
          'masterKey.SHIPPING_METHOD_INFO': {
            shippingMethodInfoOptions: 'options',
          },
        },
      },
    }),
    getCallCode() {
      let code = this.callCodeOptionsByCountryName.find(
        x => x.value === this.localAddressData.recipient_mobile_country_code_id
      )
      if (code) {
        return '(+' + code.code + ')'
      }
      return ''
    },
    getMobilePhoneNumber() {
      return this.localAddressData.recipient_mobile_phone_number
    },
    getRecipientName() {
      return this.localAddressData.recipient_name
    },
    getRecipientEmail() {
      return this.localAddressData.recipient_email
    },
    getDeliveryMethodString() {
      let shippingMethod = this.shippingDeliverOptions.find(x => x.value === this.localAddressData.sale_delivery_method)
      if (shippingMethod) {
        return shippingMethod.label
      }
      return '-N/A-'
    },
  },
  methods: {
    async update(shippingData) {
      let resetData =
        this.shippingDeliveryID === shippingData.sale_delivery_method ||
        shippingData.sale_delivery_method === null ||
        shippingData.sale_delivery_method === '' ||
        this.isAddressOnly
          ? {
              recipient_addresses: [],
              recipient_mobile_country_code_id: null,
              recipient_mobile_phone_number: null,
              recipient_name: '',
              recipient_email: '',
              recipient_selected_shipping_index: 0,
              sale_delivery_method: null,
            }
          : this.shippingSelfPickupID === shippingData.sale_delivery_method
          ? {
              self_collection_point_id: null,
              self_collection_city_id: null,
              sale_delivery_method: '',
            }
          : { sale_delivery_method: '' }
      let data = _.pick(shippingData, _.keys(resetData))

      let compareData = _.pick(data, ['sale_delivery_method', 'recipient_addresses'])
      let that = this
      if (!_.isEqual(compareData, that.cacheData)) {
        await that.callback()
      }

      this.$emit('input', data)
    },
    async callback() {
      /** Cache ['sale_delivery_method', 'recipient_addresses'] to compare and execute callback if selected keys has nay changes */
      this.cacheData = _.pick(this.localAddressData, ['sale_delivery_method', 'recipient_addresses'])
      await this.$emit('reCalculateCart', 'delivery_fees')
    },
    reset() {
      this.localAddressData = {}
    },
  },
}
