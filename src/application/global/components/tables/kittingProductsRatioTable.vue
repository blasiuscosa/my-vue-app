<template>
  <div class="ratio-table">
    <q-markup-table flat dense bordered separator="cell">
      <thead>
        <tr>
          <th class="text-center">
            {{ $t('products.standard.ProductCode.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.standard.ProductName.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.Quantity.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.focQty.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.totalBaseCv.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.totalWpCv.label') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.price.unitGMPPrice') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.price.totalGMPPrice') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.price.ratio') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.price.avgPriceUnit') }}
          </th>
          <th class="text-center">
            {{ $t('products.kitting.price.totalPromoPrice') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in kittingProduct.kitting_products" v-if="checkNullPrices()">
          <td data-th="Product Code" class="text-center">
            {{ item.product.sku }}
          </td>
          <td data-th="Product Description" class="text-center">
            {{ item.product.name }}
          </td>
          <td data-th="Qty" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ item.quantity > 0 ? item.quantity : '' }}
          </td>
          <td data-th="Foc Qty" :class="{ 'bg-grey-2': item.foc_qty < 1 }" class="text-center">
            {{ item.foc_qty > 0 ? item.foc_qty : '' }}
          </td>
          <td data-th="Total Base CV" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ cvUnitTotalCalculation(item.product.product_prices_latest.base_cv, item.quantity) }}
          </td>
          <td data-th="Total WP CV" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ cvUnitTotalCalculation(item.product.product_prices_latest.wp_cv, item.quantity) }}
          </td>
          <td data-th="Unit GMP Price" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ item.quantity > 0 ? item.product.product_prices_latest.gmp_price_tax : 0 }}
          </td>
          <td data-th="Total GMP Price" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ priceUnitTotalCalculation(item.product.product_prices_latest.gmp_price_tax, item.quantity) }}
          </td>
          <td data-th="Ratio" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ getUnitRatio(index) }}%
          </td>
          <td data-th="Avg Price / Unit" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ calculateUnitAvgPriceUnit(index) }}
          </td>
          <td data-th="Total Promo Price" :class="{ 'bg-grey-2': item.quantity < 1 }" class="text-center">
            {{ calculateUnitTotalPromoPrice(index) }}
          </td>
        </tr>
        <tr v-if="checkNullPrices()">
          <td colspan="4" />
          <td data-th="Total Base Cv" class="text-center">
            {{ overallTotalCalculation('base_cv') }}
          </td>
          <td data-th="Total WP Cv" class="text-center">
            {{ overallTotalCalculation('wp_cv') }}
          </td>
          <td class="text-center" />
          <td data-th="Total GMP Price" class="text-center">
            <strong>{{ overallTotalCalculation('gmp_price_tax') }}</strong>
          </td>
          <td class="text-center" colspan="2" />
          <td data-th="Total Promo Price" class="text-center">
            <strong>{{ calculateTotalPromoPrice() }}</strong>
          </td>
        </tr>
        <tr v-if="!checkNullPrices()" class="text-danger">
          <td colspan="11" class="text-center">
            {{ $t('products.kitting.price.error') }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>
<script>
import { formatPercentage, formatPrice } from 'src/helpers/filters'
import { mapMutations } from 'vuex'

/**
 This component only accepting below object structure
 addRowTemp: {
    product: {
      sku: '',
        name: ''
    },
    product_prices: {
      gmp_price_tax: 0,
        base_cv: 0,
        wp_cv: 0
    },
    product_id: '',
      quantity: 0,
      foc_qty: 0
  } **/
export default {
  name: 'KittingProductRatioTable',
  props: {
    kittingProduct: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setKittingQualifiedBaseCV(this.overallTotalCalculation('base_cv'))
    })
  },
  methods: {
    ...mapMutations({
      setKittingQualifiedBaseCV: 'SET_KITTING_QUALIFIED_BASE_CV',
    }),
    checkNullPrices() {
      let count = 0
      this.kittingProduct.kitting_products.forEach(x => {
        if (x.product.product_prices_latest === null) {
          count = +1
        }
      })
      return count <= 0
    },
    cvUnitTotalCalculation(cv, qty) {
      return cv * qty
    },
    priceUnitTotalCalculation(price, qty) {
      const total = price * qty
      return formatPrice(total)
    },
    overallTotalCalculation(type) {
      let total = 0
      this.kittingProduct.kitting_products.forEach(function(item) {
        if (item.quantity > 0) {
          total += item.product.product_prices_latest[type] * item.quantity
        }
      })
      return type === 'gmp_price_tax' ? formatPrice(total) : total
    },
    getUnitRatio(index) {
      return formatPercentage((this.getUnitTotalGMP(index) / this.getTotalGMP()) * 100)
    },
    getTotalGMP() {
      let totalGMP = 0
      this.kittingProduct.kitting_products.forEach(function(item) {
        if (item.quantity > 0) {
          totalGMP += item.product.product_prices_latest.gmp_price_tax * item.quantity
        }
      })
      return totalGMP
    },
    getUnitTotalGMP(index) {
      return (
        this.kittingProduct.kitting_products[index].product.product_prices_latest.gmp_price_tax *
        this.kittingProduct.kitting_products[index].quantity
      )
    },
    calculateUnitAvgPriceUnit(index) {
      return formatPrice(
        this.calculateUnitTotalPromoPrice(index) / this.kittingProduct.kitting_products[index].quantity
      )
    },
    calculateUnitTotalPromoPrice(index) {
      return formatPrice((this.kittingProduct.kitting_price.gmp_price_tax * this.getUnitRatio(index)) / 100)
    },
    calculateTotalPromoPrice() {
      let totalPromoPrice = 0
      this.kittingProduct.kitting_products.forEach((item, index) => {
        if (item.quantity > 0) {
          totalPromoPrice += this.kittingProduct.kitting_price.gmp_price_tax * (this.getUnitRatio(index) / 100)
        }
      })
      return formatPrice(totalPromoPrice)
    },
  },
}
</script>
