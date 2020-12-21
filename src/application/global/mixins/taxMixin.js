import Vue from 'vue'

export default {
  methods: {
    getTaxRate(taxZones) {
      let taxRate = 0.0
      if (typeof taxZones !== 'undefined' && taxZones !== null) {
        taxZones.forEach(x => {
          if (x.tax_value_type !== null && x.tax_value_type.title === Vue.prototype.$const.masterData.PERCENTAGE) {
            taxRate += parseFloat(x.tax_value)
          }
        })
      }
      return taxRate
    },
    getTaxAmount(taxZones, beforeTaxAmount) {
      return this.getAfterTaxAmount(taxZones, beforeTaxAmount) - beforeTaxAmount
    },
    getAfterTaxAmount(taxZones, beforeTaxAmount) {
      let afterTaxAmount = parseFloat(beforeTaxAmount)
      if (typeof taxZones !== 'undefined' && taxZones !== null) {
        let totalTaxPercentage = 0.0
        taxZones.forEach(x => {
          if (x.tax_value_type !== null && x.tax_value_type.title === Vue.prototype.$const.masterData.PERCENTAGE) {
            totalTaxPercentage += parseFloat(x.tax_value)
          } else {
            afterTaxAmount += parseFloat(x.tax_value)
          }
        })
        if (totalTaxPercentage > 0) {
          afterTaxAmount += (totalTaxPercentage / 100.0) * beforeTaxAmount
        }
      }
      return afterTaxAmount
    },
    getBeforeTaxAmount(taxZones, afterTaxAmount) {
      let beforeTaxAmount = parseFloat(afterTaxAmount)
      if (typeof taxZones !== 'undefined' && taxZones !== null) {
        let totalTaxPercentage = 0.0
        taxZones.forEach(x => {
          if (x.tax_value_type !== null && x.tax_value_type.title === Vue.prototype.$const.masterData.PERCENTAGE) {
            totalTaxPercentage += parseFloat(x.tax_value)
          } else {
            beforeTaxAmount -= parseFloat(x.tax_value)
          }
        })
        if (totalTaxPercentage > 0) {
          beforeTaxAmount = (beforeTaxAmount / (100.0 + totalTaxPercentage)) * 100.0
        }
        if (beforeTaxAmount < 0) {
          beforeTaxAmount = 0.0
        }
      }
      return beforeTaxAmount
    },
  },
}
