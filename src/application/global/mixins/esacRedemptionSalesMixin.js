import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getArea']),
    areaData() {
      return this.$helpers.getValue(this, this.getArea.data, {})
    },
    isDisableVoucherType() {
      return this.$helpers.getValue(this.areaData, 'esac_vouchers', []).length > 0
    },
  },
}
