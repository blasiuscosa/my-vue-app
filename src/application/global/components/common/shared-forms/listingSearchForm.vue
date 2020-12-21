<template>
  <div class="form-holder">
    <div class="form-tabs text-black product-listing">
      <!--      Todo Dont show tab title-->
      <!--      <q-tabs v-model="tab" align="left" indicator-color="primary-darkened" active-bg-color="primary text-white">-->
      <!--        <q-tab name="standardProducts" :label="$t('Common.listingSearch.label.Products')" />-->
      <!--      </q-tabs>-->
      <!--      <q-separator />-->
      <q-tab-panels v-model="tab">
        <q-tab-panel name="standardProducts" class="no-border">
          <!-- standardProducts Content-->
          <products-tab
            :uuid="itemSearchUUID"
            :sales-data="salesData"
            :query-handler="queryHandler"
            :add-to-cart="addToCart"
            :is-enrollment="isEnrollmentSearch"
          />
          <!-- standardProducts Content End -->
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>
<script>
import { GeneralsMixin } from 'src/application/global/mixins/index'
import { ProductsTab } from 'src/application/global/components/common/shared-forms/listing-tabs/index'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'ListingSearchForm',
  components: {
    ProductsTab,
  },
  mixins: [GeneralsMixin],
  props: {
    salesData: {
      type: Object,
      required: true,
    },
    memberDetails: {
      type: Object,
      required: false,
    },
    addToCart: {
      type: Function,
      required: false,
    },
    excludeKittingSearch: {
      type: Boolean,
      default: false,
    },
    isEnrollmentSearch: {
      type: Boolean,
      default: false,
    },
    isRentalSales: {
      type: Boolean,
      default: false,
    },
    isConsignmentReturn: {
      type: Boolean,
      default: false,
    },
    enrollmentTypeID: {
      type: Number,
      default: -1,
    },
    enrollmentCountryID: {
      type: Number,
      default: null,
    },
    filters: {
      type: Array,
      default: () => [],
    },
    excludeFilters: {
      type: Array,
      default: () => [],
    },
    transactionLocationId: {
      type: Number,
    },
    filterBySaleTypes: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState({
      headerSearchBarField: state => state.globalCMP.headerSearchBarField,
      simplePagination: state => state.globalCMP.simplePagination,
      openCloseModalForm: state => state.globalCMP.openCloseModalForm.modalData,
      productsCollection: state => state.salesCMP.salesProductSearchList.list,
      selectedFilters: state => state.globalCMP.selectedFilters,
    }),
    ...mapGetters({
      paginationQuery: 'pagination',
    }),
    stockLocationId() {
      return this.$helpers.getValue(this.salesData, 'stock_location_id')
    },
  },
  data: () => ({
    terms: '',
    itemSearchUUID: 'sales_item_search',
    tab: 'standardProducts',
  }),
  watch: {
    headerSearchBarField: {
      async handler() {
        await this.queryHandler()
      },
    },
  },
  mounted() {
    this.queryHandler()
  },
  methods: {
    ...mapActions(['getSalesProductSearchAction', 'getEnrollmentSalesProductSearchAction']),
    ...mapMutations({
      unsetSimplePaginationData: 'UNSET_SIMPLE_PAGINATION_DATA',
    }),
    async queryHandler(type = this.itemSearchUUID) {
      if (!this.isEnrollmentSearch) {
        let userID =
          (await this.memberDetails) !== undefined && this.memberDetails.details !== undefined
            ? this.memberDetails.details.user_id
            : null
        let query = {
          country_id: this.selectedFilters.countryID,
          user_id: userID,
          text: this.headerSearchBarField,
          transaction_location_id: this.transactionLocationId,
          exclude: this.excludeKittingSearch ? 'kitting' : '',
          is_consignment_return: this.isConsignmentReturn,
          mixed: true,
          filters: this.filters,
          exclude_filters: this.excludeFilters,
          esac_vouchers: this.salesData.is_esac_redemption === 1 ? this.salesData.esac_vouchers : null,
          limit:
            typeof this.simplePagination[type] !== 'undefined'
              ? this.simplePagination[type].limit
              : this.paginationQuery.limit,
          offset:
            typeof this.simplePagination[type] !== 'undefined'
              ? this.simplePagination[type].offset
              : this.paginationQuery.offset,
        }
        if (this.stockLocationId) {
          query.stock_location_id = this.stockLocationId
        }
        if (this.filterBySaleTypes.length > 0) {
          query.sale_types = this.filterBySaleTypes
        }
        await this.getSalesProductSearchAction(query)
      } else {
        // use new API here
        let query = {
          country_id: this.enrollmentCountryID,
          transaction_location_id: this.transactionLocationId,
          enrollment_type_id: this.enrollmentTypeID,
          is_rental_sales: this.isRentalSales,
          filters: this.filters,
          exclude_filters: this.excludeFilters,
          text: this.headerSearchBarField,
          limit:
            typeof this.simplePagination[type] !== 'undefined'
              ? this.simplePagination[type].limit
              : this.paginationQuery.limit,
          offset:
            typeof this.simplePagination[type] !== 'undefined'
              ? this.simplePagination[type].offset
              : this.paginationQuery.offset,
        }
        await this.getEnrollmentSalesProductSearchAction(query)
      }
    },
    getProductCollectionsCount(type) {
      if (typeof this.productsCollection !== 'undefined') {
        if (
          typeof this.productsCollection.data !== 'undefined' &&
          typeof this.productsCollection.total !== 'undefined'
        ) {
          return this.productsCollection.total
        }
      }
      return '0'
    },
    // Complete the form submission and redirect and notify
    resetAndGo(redirect) {
      if (redirect) {
        this.openCloseModal({ name: this.openCloseModalForm.name, status: false })
      }
    },
    beforeClose() {
      // redirect true
      this.resetAndGo(true)
    },
  },
}
</script>
