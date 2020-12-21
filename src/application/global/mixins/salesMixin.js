import _ from 'lodash'
import { MasterDataTransformarMixin } from 'src/application/global/mixins/index'
import masterData from 'src/utils/mappings/masterData'
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

export default {
  mixins: [MasterDataTransformarMixin],
  data: () => ({
    locationsEditState: false,
    lockTransactionLocation: false,
    resetCountDecrementBy: 3,
    lockSalesOrder: false,
    isAddressTabInvalid: false,
  }),
  watch: {
    locationsEditState() {
      this.changeLocations()
    },
    config: {
      async handler() {
        await this.setBackendConfig(this.$helpers.makeQueryString(this.config.allowedShippingMethod.params))
      },
    },
    'salesData.selected.shipping': {
      async handler() {
        if (!this.isReadOnly) {
          await this.validate()
        }
      },
      deep: true,
    },
  },
  computed: {
    ...masterData({
      getMasterMapping: {
        mappings: {
          'masterKey.SALE_DELIVERY_METHOD': {
            shippingDeliveryID: 'masterData.DELIVERY',
            shippingMethodsOptions: 'options',
          },
        },
      },
    }),
    ...mapState({
      cartPromotionalRowCurrentStatus: state => state.salesCMP.cartPromotionalRowCurrentStatus,
    }),
    ...mapGetters(['getArea', 'getUserType', 'getBackendConfig', 'locationsOptionsByCountry']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    areaName() {
      return this.$helpers.getValue(this.getArea, 'name', null)
    },
    isSaleOrderStatusPendingOnline: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status &&
        this.areaData.order_status === this.$const.masterData.PENDING_ONLINE
      )
    },
    isSaleOrderStatusPending: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.PENDING)
      )
    },
    isSaleOrderStatusCancelled: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.CANCELED)
      )
    },
    isSaleOrderStatusPreOrder: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.PRE_ORDER)
      )
    },
    isSaleOrderStatusVoid: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.VOID)
      )
    },
    isSaleOrderStatusRejected: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.REJECTED)
      )
    },
    isSaleOrderStatusComplete: function() {
      return (
        this.areaData !== undefined &&
        this.areaData.order_status_id &&
        this.areaData.order_status_id ===
          this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_ORDER_STATUS, this.$const.masterData.COMPLETED)
      )
    },
    isLocationsEmpty() {
      return (
        this.$helpers.isNull(this.areaData, 'location_id') || this.$helpers.isNull(this.areaData, 'stock_location_id')
      )
    },
    isPayLater() {
      return (
        this.$helpers.getValue(this.areaData, 'is_paylater', 0) === 1 ||
        this.$helpers.getValue(this.areaData, 'is_cash_on_delivery', 0) === 1
      )
    },
    isValidPayLater() {
      return (
        this.getUserType !== this.$const.common.STOCKIST &&
        this.isPayLater &&
        (this.isSaleOrderStatusPendingOnline || this.isSaleOrderStatusPending || this.isSaleOrderStatusPreOrder)
      )
    },
    isLocationsEditable() {
      return this.isValidPayLater && !this.isSaleOrderStatusPreOrder
    },
    isRequiresUpdate() {
      return this.$helpers.getValue(this.areaData, 'skip_downline') === 1
    },
    isHasPendingPayment() {
      return (
        this.saleID &&
        (this.isSaleOrderStatusPendingOnline || this.isSaleOrderStatusPending || this.isSaleOrderStatusPreOrder)
      )
    },
    isDisableSubmitButtons() {
      return this.isValidPayLater
        ? !this.isDirty
        : this.isHasPendingPayment || (this.isSaleOrderStatusComplete && !this.isDirty)
    },
    isRentalSaleOrder() {
      return this.$helpers.getValue(this.areaData, 'is_rental_sale_order')
    },
    availableShippingOptions() {
      let availableOptions = []
      let allowedShippingMethods = this.getBackendConfig(this.config.allowedShippingMethod.params.lookup)
      if (allowedShippingMethods.length > 0) {
        let shippingOptions = this.shippingMethodsOptions
        availableOptions = shippingOptions.filter(x => allowedShippingMethods.includes(x.value))
      }
      return availableOptions
    },
    isSkipDownline() {
      return this.$helpers.isSet(this.areaData, 'downline_member_id') &&
        this.$helpers.isSet(this.areaData, 'sponsor_member_id')
        ? this.$helpers.getValue(this.areaData, 'downline_member_id') ===
            this.$helpers.getValue(this.areaData, 'sponsor_member_id') ||
            this.$helpers.getValue(this.areaData, 'skip_downline') === 1
        : false
    },
    isCorporateSales() {
      return this.$helpers.getValue(this.areaData, 'is_corporate_sales')
    },
    isReadOnly() {
      return this.lockSalesOrder && !this.isSkipDownline
    },
    getMembersAddress() {
      let addresses = this.$helpers.getValue(this.memberDetails, 'address.address_data')
      if (addresses) {
        if (typeof addresses === 'string') {
          return JSON.parse(addresses)
        } else {
          return addresses
        }
      }
      return []
    },
    getCurrentOrderStatus() {
      return this.$helpers.getValue(this.areaData, 'order_status', this.$t('Common.New.Text'))
    },
    getStockLocation() {
      let location = 'N/A'
      if (this.$helpers.getValue(this.areaData, 'stock_location')) {
        location =
          this.$helpers.getValue(this.areaData, 'stock_location.code') +
          ' - ' +
          this.$helpers.getValue(this.areaData, 'stock_location.name')
      }
      return location
    },
    getTransactionLocation() {
      let location = 'N/A'
      if (this.$helpers.getValue(this.areaData, 'location')) {
        location =
          this.$helpers.getValue(this.areaData, 'location.code') +
          ' - ' +
          this.$helpers.getValue(this.areaData, 'location.name')
      }
      return location
    },
    getSaleUserID() {
      let exist = this.$helpers.isSet(this.areaData, 'downline_member_id', ['notNull', 'notEmpty'])
      return exist
        ? this.$helpers.getValue(this.areaData, 'downline_member_id')
        : this.$helpers.getValue(this.areaData, 'sponsor_member_id')
    },
    getAutoFillData() {
      let data = this.$helpers.getValue(this.areaData, 'downline_member', {})
      if (!data) {
        data = this.$helpers.getValue(this.areaData, 'sponsor_member', {})
      }
      return data
    },
    getSaleDownloadableInfo() {
      return [
        {
          label: this.$t('Sales.DocumentNumber.Text'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'sale_id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'document_number', '-N/A-'),
            type: 'preOrderNote',
          },
          show: this.$helpers.isSet(this.areaData, 'document_number', ['notNull', 'notEmpty']),
          permission: 'invoice|download',
          color: 'red',
        },
        {
          label: this.$t('Sales.TaxInvoice.Text'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'invoice_id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'invoice.invoice_number', '-N/A-'),
            type: 'invoice',
          },
          show: this.$helpers.getValue(this.areaData, 'invoice'),
          permission: 'invoice|download',
          color: 'green',
        },
        {
          label: this.$t('Sales.Amp.Text'),
          data: {
            id: this.$helpers.getValue(this.areaData, 'invoice_id', '-N/A-'),
            value: this.$helpers.getValue(this.areaData, 'invoice.invoice_number', '-N/A-'),
            type: 'ampInvoice',
          },
          show:
            this.$helpers.isSet(this.areaData, 'has_virtual_invoice') &&
            this.$helpers.isSet(this.areaData, 'invoice', ['notNull']),
          permission: 'invoice|download',
          color: 'green',
        },
        {
          label: this.$t('Sales.AuthoshipNo.Text'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'autoship_subscription_order_number', '-N/A-'),
            type: null,
          },
          show:
            this.$helpers.getValue(this.areaData, 'is_autoship_subscription_sale') === 1 &&
            !this.$helpers.isNull(this.areaData, 'autoship_subscription_order_number'),
          permission: 'public',
          color: 'yellow',
        },
        {
          label: this.$t('Sales.AuthoshipCode.Text'),
          data: {
            id: null,
            value: this.$helpers.getValue(this.areaData, 'autoship_subscription_code', '-N/A-'),
            type: null,
          },
          show:
            this.$helpers.getValue(this.areaData, 'is_autoship_subscription_sale') === 1 &&
            !this.$helpers.isNull(this.areaData, 'autoship_subscription_order_number'),
          permission: 'public',
          color: 'pink',
        },
      ].filter(x => x.show)
    },
    getSelectedAddress() {
      return this.$helpers.getValue(this.areaData, 'selected.shipping')
    },
    forceIncludeShippingMethods() {
      // TODO Not in use remove after config API stable
      // return this.shippingMethodsOptions.filter((x) => [this.shippingDeliveryID].includes(x.value))
    },
    getTransactionLocationTypeId() {
      let id = this.$helpers.getValue(this.areaData, 'location_id')
      let data = this.locationsOptionsByCountry.find(x => x.value === id)
      if (data) {
        return data.type_id
      }
      return null
    },
    config() {
      return {
        allowedShippingMethod: {
          params: {
            country: this.$helpers.getValue(this.areaData, 'country_id'),
            location: this.$helpers.getValue(this.areaData, 'location_id'),
            location_type: this.getTransactionLocationTypeId,
            feature: this.areaName,
            lookup: 'shipping_method',
          },
        },
      }
    },
  },
  async mounted() {
    await this.getMasterMapping()
  },
  methods: {
    ...mapActions(['resetErrorsAction', 'setBackendConfig']),
    ...mapMutations({
      setIsProcessingForm: 'IS_PROCESSING_FORM',
      setNotification: 'SHOW_NOTIFICATION',
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
      unsetCartPwpValidationIds: 'UNSET_CART_PWP_VALIDATION_IDS',
      unsetCartPwpItemTempList: 'UNSET_CART_PWP_ITEM_TEMP_LIST',
      unSetOrderData: 'UNSET_ORDER_DATA',
      unsetMemberData: 'UNSET_MEMBER_DATA',
      unsetSalesAddressData: 'UNSET_SALES_ADDRESSES_DATA',
      unsetPromotionalRowCurrentStatus: 'UNSET_PROMOTIONAL_ROW_CURRENT_STATUS',
      setCartAdditionalAttributesIncompleteIds: 'SET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
      unsetCartAdditionalAttributesIncompleteIds: 'UNSET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
      unsetAdditionalAttributesIncompleteIds: 'UNSET_ADDITIONAL_REQUIREMENTS_QUANTITY',
      unsetAdditionalRequirementsQuantity: 'UNSET_ADDITIONAL_REQUIREMENTS_QUANTITY',
    }),
    changeLocationsEditState(x, resetCountDecrementBy) {
      this.locationsEditState = !x
      this.resetCountDecrementBy = resetCountDecrementBy
    },
    changeLocations() {
      if (this.locationsEditState) {
        this.areaData.location_id = null
        if (!this.isRentalSaleOrder) {
          this.areaData.stock_location_id = null
        }
        if (this.isValidPayLater && this.isLocationsEditable) {
          if (this.locationsOptionsByCountry.length > 0) {
            this.areaData.location_id = this.locationsOptionsByCountry[0].value
            if (typeof this.setStockLocation === 'function') {
              this.setStockLocation(this.areaData.location_id)
            }
          }
        }
        if (this.currentTab === 'payments') {
          this.currentTab = 'items'
        }
      } else {
        let wait = new Promise(resolve => {
          this.areaData.location_id = this.areaData.location.id
          if (!this.isRentalSaleOrder) {
            this.areaData.stock_location_id = this.areaData.stock_location.id
          }
          resolve(true)
        })
        wait.then(() => {
          this.resetDirtyChecker(this.resetCountDecrementBy)
        })
      }
    },
    mimicValidationError(tabName = 'address', status) {
      this.hasError.tabs[tabName] = status
    },
    refresh() {
      let freeItems = this.$helpers.getValue(this.areaData, 'free_items', [])
      let promotions = this.$helpers.getValue(this.areaData, 'promotion', [])
      let selectedPromotions = this.$helpers.getValue(this.areaData, 'selected.promotions', [])
      let pwpTempList = this.cartPwpItemsTempList
      // Lock transaction type if item selected
      if (this.areaData.products.length > 0 || this.areaData.kittings.length > 0) {
        this.lockTransactionLocation = !this.isNormalMemberEnrolment
        if (this.isCartAsDefaultItems()) {
          this.lockTransactionLocation = false
        }
      } else if (this.areaData.products.length <= 0 || this.areaData.kittings.length <= 0) {
        // Todo need to investigate logic not clear
        // if (freeItems && freeItems.length > 0) {
        //   this.lockTransactionLocation = false
        // }
        this.lockTransactionLocation = false
      } else {
        this.lockTransactionLocation = false
        this.areaData.is_rental_ha_sales = false
      }
      this.cartPromotionalRowCurrentStatus.forEach(row => {
        let promotionsIndex = promotions.findIndex(promo => promo.promo_id === row.promoID)
        if (promotionsIndex === -1) {
          this.unsetPromotionalRowCurrentStatus(row)
        }
      })
      if (promotions && promotions.length > 0) {
        let deletablePromoIDs = []
        selectedPromotions.forEach(item => {
          if (promotions.find(x => x.promo_id === item.promo_id) === undefined) {
            if (!deletablePromoIDs.includes(item.promo_id)) {
              deletablePromoIDs.push(item.promo_id)
            }
            if (this.cartPwpValidationIds.includes(item.promo_id)) {
              let validationIndex = this.cartPwpValidationIds.findIndex(x => x === item.promo_id)
              this.unsetCartPwpValidationIds(validationIndex)
            }
          }
        })
        // Special case where iterating and mutating same array
        selectedPromotions.reduceRight(function(acc, item, index, object) {
          if (deletablePromoIDs.includes(item.promo_id)) {
            object.splice(index, 1)
          }
        }, [])
      } else {
        selectedPromotions.forEach(item => {
          let validationIndex = this.cartPwpValidationIds.findIndex(x => x === item.promo_id)
          this.unsetCartPwpValidationIds(validationIndex)
        })
        this.areaData.selected.promotions = []
        this.unsetCartPwpItemTempList()
      }
      if (pwpTempList.length > 0) {
        let deletablePwpPromoIDS = []
        pwpTempList.forEach(item => {
          if (typeof promotions.find(x => x.promo_id === item.promo_id) === 'undefined') {
            if (!deletablePwpPromoIDS.includes(item.promo_id)) {
              deletablePwpPromoIDS.push(item.promo_id)
            }
          } else {
            let promotionsIndex = promotions.findIndex(
              x => x.option_id === item.option_id && x.promo_id === item.promo_id && x.product_id === item.product_id
            )
            promotions.splice(promotionsIndex, 1)
          }
        })
        // Special case where iterating and mutating same array
        pwpTempList.reduceRight((acc, item, index) => {
          if (deletablePwpPromoIDS.includes(item.promo_id)) {
            this.unsetCartPwpItemTempList(index)
          }
        }, [])
      }
    },
    isCartAsDefaultItems() {
      // Todo backend update add new variable is_enrolment_item instead editable = false
      let products = _.filter(this.areaData.products, ['editable', false])
      let kitting = _.filter(this.areaData.kittings, ['editable', false])
      return products.length > 0 || kitting.length > 0
    },
    async validate() {
      if (this.$refs.shippingMethods) {
        this.isAddressTabInvalid = await this.$refs.shippingMethods.validate()
      } else {
        // Mimic validation failed for new order
        if (!this.lockSalesOrder) {
          this.isAddressTabInvalid = true
        }
      }
    },
  },
  destroyed: function() {
    // Clear all data before exit sales area
    this.unSetOrderData({ uplineUserID: '', downlineUserID: '', downlineOrder: false, orderID: '', newOrder: false })
    this.unsetMemberData()
    this.unsetPromotionalRowCurrentStatus()
    this.unsetCartPwpItemTempList()
    this.unsetCartPwpValidationIds()
    // Evoucher & sizes selection reset
    this.unsetCartAdditionalAttributesIncompleteIds()
    this.unsetSalesAddressData()
    this.unsetAdditionalAttributesIncompleteIds()
    this.unsetAdditionalRequirementsQuantity()
    // Reset sales area validations
    if (this.$v !== null && this.$v !== undefined && this.$v.$reset() !== null && this.$v.$reset() !== undefined) {
      this.$v.$reset()
    }
    this.resetErrorsAction()
  },
}
