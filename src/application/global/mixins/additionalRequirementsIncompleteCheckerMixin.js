import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations({
      setCartAdditionalAttributesIncompleteIds: 'SET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
    }),
    setAdditionalAttributesIds(data, id, isEvoucherRedemption = false) {
      // Recalculate additional requirements condition
      data.kittings.forEach(kit => {
        if (kit.kitting_id === id && (kit.kitting_has_dummy || isEvoucherRedemption)) {
          this.setAdditionalAttributeId('kitting_ids', id)
        }
      })
      // Recalculate additional requirements condition
      data.products.forEach(product => {
        let checkID = isEvoucherRedemption ? product.master_product_id : product.product_id
        if (
          checkID === id &&
          ((product.is_dummy_code && !this.$helpers.isNull(product, 'dummy')) || isEvoucherRedemption)
        ) {
          this.setAdditionalAttributeId('product_ids', id)
        }
      })
    },
    setAdditionalAttributeId(key, id) {
      if (id !== undefined) {
        let incompleteData = {
          id: id,
          key: key,
        }
        this.setCartAdditionalAttributesIncompleteIds(incompleteData)
      }
    },
  },
}
