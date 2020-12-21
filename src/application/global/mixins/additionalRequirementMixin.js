import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    additionalRequirements: {
      type: Object,
      required: true,
    },
    itemsData: {
      type: [Array, Object],
      required: true,
    },
    tableTh: {
      type: Array,
      required: true,
    },
    kittingID: {
      type: Number,
      default: null,
    },
    productID: {
      type: Number,
      default: null,
    },
    itemQty: {
      type: Number,
      default: 0,
    },
    isEvoucherRedemption: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    terms: [],
    results: [],
    requirements: {},
    toggleAttributes: [],
    loading: true,
  }),
  mounted() {
    this.requirements = this.additionalRequirements
  },
  computed: {
    ...mapGetters(['getMasterDataIdByKeyAndTitle', 'getAdditionalRequirementQty']),
    selectedInstantQty() {
      return this.getAdditionalRequirementQty(this.productID, this.kittingID) !== null
        ? this.getAdditionalRequirementQty(this.productID, this.kittingID).selectedInstantQty
        : 0
    },
    selectedEvoucherQty() {
      return this.getAdditionalRequirementQty(this.productID, this.kittingID) !== null
        ? this.getAdditionalRequirementQty(this.productID, this.kittingID).selectedEvoucherQty
        : 0
    },
  },
  methods: {
    ...mapMutations({
      setCartAdditionalAttributesIncompleteIds: 'SET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
      unsetCartAdditionalAttributesIncompleteIds: 'UNSET_CART_ADDITIONAL_ATTRIBUTES_INCOMPLETE_IDS',
    }),
    async rebuild() {
      await this.resetAdditionalRequirementItems(this.productID, this.kittingID)
      await this.removeOrModifyEvoucherAttributes(this.productID, this.kittingID, this.selectedEvoucherQty)
      await this.recalculateCartAdditionalAttributesIncompleteIds()
      this.toggleAttributes = await []
    },
    resetAdditionalRequirementItems(productID, kittingID) {
      kittingID = this.normalizeID(kittingID)
      for (let [key] of Object.entries(this.requirements)) {
        if (key !== 'evoucher') {
          let items = []
          if (this.$helpers.isSet(this.requirements, key)) {
            items = this.requirements[key].filter(x => x.product_id === productID || x.kitting_id === kittingID)
            if (items !== undefined) {
              items.forEach(item => {
                let itemIndex = this.requirements[key].findIndex(
                  x => x.product_id === productID || x.kitting_id === kittingID
                )
                if (itemIndex !== -1) {
                  this.requirements[key].splice(itemIndex, this.requirements[key].length)
                }
              })
            }
          }
        }
      }
    },
    filterAndProcessAttributeOptions(options, index) {
      let term = this.terms[index]
      this.results[index] = options.filter(item => {
        if (
          item.sku.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
          item.name.toLowerCase().indexOf(term.toLowerCase()) > -1
        ) {
          return item
        }
      })
    },
    addNewAttribute(productID, kittingID, dummyID, type, qty = null) {
      if (this.$helpers.isSet(this.requirements, type)) {
        productID = this.normalizeID(productID)
        kittingID = this.normalizeID(kittingID)
        if (this.requirements[type].filter(x => x.product_id === productID && x.kitting_id === kittingID).length < 1) {
          let attributeTemp = {
            product_id: productID,
            kitting_id: kittingID,
            quantity: qty,
            dummy_id: dummyID || '',
            data: [],
          }
          this.requirements[type].push(attributeTemp)
        }
      }
    },
    removeOrModifyEvoucherAttributes(productID, kittingID, qty, type = 'evoucher') {
      if (this.$helpers.isSet(this.requirements, type)) {
        productID = this.normalizeID(productID)
        kittingID = this.normalizeID(kittingID)
        let index = this.requirements[type].findIndex(x => x.product_id === productID && x.kitting_id === kittingID)
        if (index !== -1) {
          if (qty !== 0) {
            this.requirements[type][index].quantity = qty
          } else {
            this.requirements[type].splice(index, 1)
          }
        } else {
          this.addNewAttribute(productID, kittingID, null, type, qty)
        }
      }
    },
    addAttributeQuantity(
      requiredQuantity,
      productID,
      kittingID,
      dummyID,
      type,
      attributeProductID,
      selectedInstantQty,
      isDummy,
      isFoc
    ) {
      if (this.$helpers.isSet(this.requirements, type)) {
        productID = this.normalizeID(productID)
        kittingID = this.normalizeID(kittingID)
        if (typeof selectedInstantQty !== 'undefined' && selectedInstantQty !== '' && kittingID) {
          requiredQuantity = requiredQuantity * selectedInstantQty
        } else {
          requiredQuantity = selectedInstantQty
        }
        if (isDummy) {
          type = 'evoucher'
        }
        this.addNewAttribute(productID, kittingID, dummyID, type)
        let selectedQuantity = 0
        let totalSelectedQuantitySizes = this.getTotalSelectedQuantitySizes(productID, kittingID, dummyID, isFoc)
        let totalSelectedQuantityEvoucher = this.getTotalSelectedQuantityEvoucher(productID, kittingID, dummyID, isFoc)
        let requirementIndex = this.requirements[type].findIndex(
          x => x.product_id === productID && x.kitting_id === kittingID
        )
        if (requirementIndex !== -1) {
          let quantity = {
            product_id: attributeProductID,
            quantity: isFoc ? 0 : 1,
            foc_qty: isFoc ? 1 : 0,
          }
          let dataIndex = this.requirements[type][requirementIndex].data.findIndex(
            x => x.product_id === attributeProductID
          )
          let selectedQuantityData = this.requirements[type][requirementIndex].data.find(
            x => x.product_id === attributeProductID
          )
          if (selectedQuantityData !== undefined && Object.keys(selectedQuantityData).length > 0) {
            selectedQuantity += isFoc ? selectedQuantityData.foc_qty : selectedQuantityData.quantity
          }
          if (
            selectedQuantity < requiredQuantity &&
            totalSelectedQuantitySizes + totalSelectedQuantityEvoucher < requiredQuantity
          ) {
            if (dataIndex !== -1) {
              if (isFoc) {
                this.requirements[type][requirementIndex].data[dataIndex].foc_qty += 1
              } else {
                this.requirements[type][requirementIndex].data[dataIndex].quantity += 1
              }
            } else {
              this.requirements[type][requirementIndex].data.push(quantity)
            }
          }
          if (this.requirements[type][requirementIndex].data.length < 1) {
            this.requirements[type].splice(requirementIndex, 1)
          }
        }
      }
      this.recalculateCartAdditionalAttributesIncompleteIds()
    },
    minusAttributeQuantity(requiredQuantity, productID, kittingID, dummyID, type, attributeProductID, isDummy, isFoc) {
      if (this.$helpers.isSet(this.requirements, type)) {
        productID = this.normalizeID(productID)
        kittingID = this.normalizeID(kittingID)
        if (isDummy) {
          type = 'evoucher'
        }
        let requirementIndex = this.requirements[type].findIndex(
          x => x.product_id === productID && x.kitting_id === kittingID
        )
        if (requirementIndex !== -1) {
          let dataIndex = this.requirements[type][requirementIndex].data.findIndex(
            x => x.product_id === attributeProductID
          )
          if (dataIndex !== -1) {
            if (
              isFoc
                ? this.requirements[type][requirementIndex].data[dataIndex].foc_qty
                : this.requirements[type][requirementIndex].data[dataIndex].quantity >= 1
            ) {
              if (isFoc) {
                this.requirements[type][requirementIndex].data[dataIndex].foc_qty -= 1
              } else {
                this.requirements[type][requirementIndex].data[dataIndex].quantity -= 1
              }
            }
            if (
              this.requirements[type][requirementIndex].data[dataIndex].foc_qty === 0 &&
              this.requirements[type][requirementIndex].data[dataIndex].quantity === 0
            ) {
              this.requirements[type][requirementIndex].data.splice(dataIndex, 1)
            }
          }
          if (this.requirements[type][requirementIndex].data.length < 1) {
            this.requirements[type].splice(requirementIndex, 1)
          }
        }
      }
      this.recalculateCartAdditionalAttributesIncompleteIds()
    },
    getAttributeQuantityCount(type, productID, kittingID, dummyID, rowItemID, rowItemIsDummy, isFoc) {
      productID = this.normalizeID(productID)
      kittingID = this.normalizeID(kittingID)
      let count = 0
      if (this.$helpers.isSet(this.requirements, type)) {
        if (rowItemIsDummy) {
          type = 'evoucher'
        }
        let selections = this.requirements[type].find(
          x => x.product_id === productID && x.kitting_id === kittingID && x.dummy_id === dummyID
        )
        if (selections !== undefined) {
          if (selections.data.length > 0) {
            selections.data.forEach(item => {
              if (item.product_id === rowItemID) {
                count = isFoc ? item.foc_qty : item.quantity
              }
            })
          }
        }
      }
      return count
    },
    getAttributeTotalSelectedQuantityCount(productID, kittingID, dummyID, isFoc) {
      let totalSelected = 0
      totalSelected =
        this.getTotalSelectedQuantitySizes(productID, kittingID, dummyID, isFoc) +
        this.getTotalSelectedQuantityEvoucher(productID, kittingID, dummyID, isFoc)
      return totalSelected
    },
    getTotalSelectedQuantitySizes(productID = null, kittingID = null, dummyID, isFoc) {
      let totalSelectedQuantitySizes = 0
      if (this.requirements.sizes !== undefined) {
        let totalSelectedQuantitySizesData = this.requirements.sizes.filter(
          x => x.product_id === productID && x.kitting_id === kittingID
        )
        if (totalSelectedQuantitySizesData.length > 0) {
          totalSelectedQuantitySizesData.forEach(item => {
            if (item.data.length > 0 && item.dummy_id === dummyID) {
              item.data.forEach(x => {
                totalSelectedQuantitySizes += isFoc ? x.foc_qty : x.quantity
              })
            }
          })
        }
      }
      return totalSelectedQuantitySizes
    },
    getTotalSelectedQuantityEvoucher(productID = null, kittingID = null, dummyID, isFoc) {
      let totalSelectedQuantityEvoucher = 0
      if (this.requirements.evoucher !== undefined) {
        let totalSelectedQuantityEvoucherData = this.requirements.evoucher.filter(
          x => x.product_id === productID && x.kitting_id === kittingID
        )
        if (totalSelectedQuantityEvoucherData.length > 0) {
          totalSelectedQuantityEvoucherData.forEach(item => {
            if (item.data.length > 0 && item.dummy_id === dummyID) {
              item.data.forEach(y => {
                totalSelectedQuantityEvoucher += isFoc ? y.foc_qty : y.quantity
              })
            }
          })
        }
      }
      return totalSelectedQuantityEvoucher
    },
    getTotalSelectedQuantityAddresses(productID = null, kittingID = null, dummyID, isFoc) {
      let totalSelectedQuantityAddress = 0
      let totalSelectedQuantityAddressData = this.requirements.addresses.filter(
        x => x.product_id === productID && x.kitting_id === kittingID
      )
      if (totalSelectedQuantityAddressData.length > 0) {
        totalSelectedQuantityAddressData.forEach(item => {
          if (item.data.length > 0 && item.dummy_id === dummyID) {
            item.data.forEach(y => {
              totalSelectedQuantityAddress += isFoc ? y.foc_qty : y.quantity
            })
          }
        })
      }
      return totalSelectedQuantityAddress
    },
    attributesSelectionToggle(index) {
      let attributeIndex = this.toggleAttributes.findIndex(x => x === index)
      if (attributeIndex !== -1) {
        this.toggleAttributes.splice(attributeIndex, 1)
      } else {
        this.toggleAttributes.push(index)
      }
    },
    normalizeID(id) {
      return id !== undefined ? id : null
    },
    isHA(data, key = 'general.product_additional_requirements') {
      let count = 0
      let ids = this.$helpers.getValue(data, key)
      if (Array.isArray(ids)) {
        ids.forEach(id => {
          if (
            this.getMasterDataIdByKeyAndTitle(
              this.$const.masterKey.PRODUCT_ADDITIONAL_REQUIREMENTS,
              this.$const.masterData.ADDRESS
            ) === id
          ) {
            count += 1
          }
        })
      }
      if (count > 0) {
        return true
      }
      return false
    },
    recalculateCartAdditionalAttributesIncompleteIds() {
      if (Array.isArray(this.itemsData) && this.itemsData.length > 0) {
        let count = 0
        let incompleteData = {
          id: null,
          key: '',
        }
        this.itemsData.forEach(itemData => {
          let kittingIDLocal = this.isEvoucherRedemption ? itemData.master_kitting_id : itemData.kitting_id
          let productIDLocal = this.isEvoucherRedemption ? itemData.master_product_id : itemData.product_id
          if (productIDLocal !== undefined && kittingIDLocal === undefined) {
            incompleteData.id = productIDLocal
            incompleteData.key = 'product_ids'
          } else {
            incompleteData.id = kittingIDLocal
            incompleteData.key = 'kitting_ids'
          }
          if (itemData.dummy !== null) {
            if (
              this.getAttributeTotalSelectedQuantityCount(
                productIDLocal,
                kittingIDLocal,
                itemData.dummy.id,
                itemData.quantity === 0
              ) !==
              (productIDLocal && !kittingIDLocal
                ? this.selectedInstantQty
                : this.selectedInstantQty * (itemData.quantity !== 0 ? itemData.quantity : itemData.foc_qty))
            ) {
              count += 1
            }
          }
        })
        if (count > 0) {
          this.setCartAdditionalAttributesIncompleteIds(incompleteData)
        } else {
          this.unsetCartAdditionalAttributesIncompleteIds(incompleteData)
        }
      }
    },
  },
}
