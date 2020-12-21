<template>
  <div class="products-tab">
    <q-markup-table square flat dense separator="cell" bordered class="fit">
      <thead>
        <tr class="bg-grey-2">
          <th class="text-right">
            {{ $t('Common.listingSearch.tableLabel.productCode') }}
          </th>
          <th class="text-right">
            {{ $t('Common.listingSearch.tableLabel.productName') }}
          </th>
          <th class="text-right">
            {{ $t('Common.listingSearch.tableLabel.balanceStock') }}
          </th>
          <th v-if="salesData.is_esac_redemption !== 1" class="text-right">
            {{ $t('Common.listingSearch.tableLabel.unitCV') }}
          </th>
          <th class="text-right">
            {{ $t('Common.listingSearch.tableLabel.unitPrice') }} ({{ currencyLabelByCountry }})
          </th>
          <th class="text-center">
            {{ $t('Common.tableLabel.Actions') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products.data"
          v-if="typeof products.data !== 'undefined' && products.data.length > 0 && product.price !== null"
          class="cursor-pointer"
        >
          <td
            :data-th="$t('Common.listingSearch.tableLabel.productCode')"
            class="text-right"
            @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
          >
            {{ product.sku || product.code }}
          </td>
          <td
            :data-th="$t('Common.listingSearch.tableLabel.productName')"
            class="text-right"
            @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
          >
            {{ product.name }}
            <q-chip dense :color="product.is_kitting === 0 ? 'amber-3 text-black' : 'lime-3 text-black'">
              {{ product.is_kitting === 0 ? 'STD' : 'KIT' }}
            </q-chip>
          </td>
          <td
            :data-th="$t('Common.listingSearch.tableLabel.balanceStock')"
            class="text-right"
            @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
          >
            0
          </td>
          <td
            v-if="salesData.is_esac_redemption !== 1"
            :data-th="$t('Common.listingSearch.tableLabel.unitCV')"
            class="text-right"
            @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
          >
            {{ isEnrollment && product.price.wp_cv ? product.price.wp_cv : product.price.base_cv }}
          </td>
          <td
            :data-th="$t('Common.listingSearch.tableLabel.unitPrice')"
            class="text-right"
            @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
          >
            {{ currencyLabelByCountry }} {{ product.price.gmp_price_tax }}
          </td>
          <td :data-th="$t('Common.tableLabel.Actions')" class="text-center">
            <q-btn
              dense
              color="positive"
              icon="add"
              @click="addToCart(product.is_kitting === 0 ? 'product' : 'kitting', product.id)"
            />
          </td>
        </tr>
        <tr v-show="typeof products === 'undefined' || typeof products.total === 'undefined' || products.total === 0">
          <td colspan="6">
            <empty-list />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <div class="row justify-end generic-margin">
      <div>
        <simple-pagination :uuid="uuid" :per-page="10" :max-pages="getMaxPages" :pagination-handler="queryHandler" />
      </div>
    </div>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList.vue'
import simplePagination from 'src/application/global/components/common/pagination/simplePagination'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ProductsTab',
  components: {
    EmptyList,

    simplePagination,
  },
  props: {
    salesData: {
      type: Object,
      required: false,
    },
    memberDetails: {
      type: Object,
      required: false,
    },
    queryHandler: {
      type: Function,
      required: false,
    },
    addToCart: {
      type: Function,
      required: false,
    },
    uuid: {
      type: String,
    },
    isEnrollment: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      products: state => state.salesCMP.salesProductSearchList.list,
    }),
    ...mapGetters(['currencyLabelByCountry']),
    getMaxPages() {
      if (typeof this.products.data !== 'undefined' && typeof this.products.total !== 'undefined') {
        return this.products.total
      }
      return 0
    },
  },
}
</script>
