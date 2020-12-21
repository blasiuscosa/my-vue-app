import { mapGetters } from 'vuex'
import { calculateUnpaidBalance } from 'src/utils/payments/calculation'

export default {
  computed: {
    ...mapGetters(['getArea', 'getUserType']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    saleOrderTotalAmount() {
      return parseFloat(this.$helpers.getValue(this.areaData, 'order_fees.total_gmp', 0.0))
    },
    saleOrderBalanceAmount() {
      return calculateUnpaidBalance(
        this.$helpers.getValue(this.areaData, 'selected.payments', {
          unpaid: [],
          paid: [],
        }),
        this.saleOrderTotalAmount
      )
    },
    isUpgradableSale() {
      return this.$helpers.getValue(this.areaData, 'mega_upgrade.status')
    },
    isPreScreeningStatusPending() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_pre_screen_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_PRE_SCREENING_STATUS,
            this.$const.masterData.RENTAL_PRE_SCREENING_PENDING
          )
      )
    },
    isPreScreeningStatusInReview() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_pre_screen_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_PRE_SCREENING_STATUS,
            this.$const.masterData.RENTAL_PRE_SCREENING_IN_REVIEW
          )
      )
    },
    isPreScreeningStatusApproved() {
      let id = this.$helpers.getValue(this.areaData, 'rental_pre_screen_status.id', null)
      return (
        id ===
        this.getMasterDataIdByKeyAndTitle(
          this.$const.masterKey.RENTAL_PRE_SCREENING_STATUS,
          this.$const.masterData.RENTAL_PRE_SCREENING_APPROVED
        )
      )
    },
    isPreScreeningStatusRejected() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_pre_screen_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_PRE_SCREENING_STATUS,
            this.$const.masterData.RENTAL_PRE_SCREENING_REJECTED
          )
      )
    },
    isCredibilityCheckStatusPending() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_credibility_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_CREDIBILITY_STATUS,
            this.$const.masterData.RENTAL_CREDIBILITY_PENDING
          )
      )
    },
    isCredibilityCheckStatusApproved() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_credibility_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_CREDIBILITY_STATUS,
            this.$const.masterData.RENTAL_CREDIBILITY_APPROVED
          )
      )
    },
    isCredibilityCheckStatusRejected() {
      return (
        this.areaData !== undefined &&
        this.areaData.rental_credibility_status_id ===
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.RENTAL_CREDIBILITY_STATUS,
            this.$const.masterData.RENTAL_CREDIBILITY_APPROVED
          )
      )
    },
    isRentalSaleConvertible() {
      return (
        this.isCredibilityCheckStatusApproved &&
        !this.isDirty &&
        (this.isSaleOrderStatusPending || this.isSaleOrderStatusPreOrder || !this.isSaleOrderStatusComplete)
      )
    },
    isHasPendingPayment() {
      return (
        this.saleID &&
        (this.isSaleOrderStatusPendingOnline || this.isSaleOrderStatusPending || this.saleOrderBalanceAmount > 0.0)
      )
    },
    isDisableSubmitButtons() {
      return this.isRentalSaleConvertible ? this.isHasPendingPayment : !this.isDirty
    },
    isLocationsEditable() {
      return this.isValidPayLater && this.saleOrderBalanceAmount === this.saleOrderTotalAmount
    },
    isRentalSaleOrder() {
      return this.$helpers.getValue(this.areaData, 'is_rental_sale_order')
    },
    isCartHasItems() {
      let products = this.$helpers.getValue(this.areaData, 'products', [])
      // TODO: Kitting naming convention diversion
      let kitting =
        this.$helpers.getValue(this.areaData, 'kittings') || this.$helpers.getValue(this.areaData, 'kitting')
      if (!kitting) {
        kitting = []
      }
      return !this.saleID && (products.length > 0 || kitting.length > 0)
    },
  },
  methods: {
    async updateRMSSalesNumber() {
      this.$v.rental_ek_smart_no.$touch()
      if (!this.$v.rental_ek_smart_no.$error) {
        // meant for few countries only since they do not have interface for RMS
        await this.processFormBefore(this.$t('rental.preScreenCredibility.rmsSalesNumber.text'))
        if (this.proceedStatusUpdate) {
          let query = {
            sale_id: this.areaData.sale_id,
            rental_ek_smart_no: this.rental_ek_smart_no,
          }
          this.putRMSSalesNumberAction(query).then(() => {
            this.manipulateSaveData()
          })
        }
      }
    },
    checkCountrySpecificRuleByType(rule) {
      if (rule === 'updateRMS') {
        let countries = ['singapore', 'cambodia']
        if (this.countriesOptions.length > 0) {
          let exist = this.countriesOptions.find(
            country =>
              countries.includes(country.label.toLowerCase()) &&
              country.value === this.$helpers.getValue(this.areaData, 'country_id')
          )
          if (
            exist &&
            (this.getUserType === 'root' || this.getUserType === 'BackOffice') &&
            this.isPreScreeningStatusApproved &&
            !this.isSaleOrderStatusVoid
          ) {
            return true
          }
        }
      }
      return false
    },
  },
}
