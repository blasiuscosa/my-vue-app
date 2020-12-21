<template>
  <div class="additional-requirement-area">
    <div v-if="!disableAdditionalRequirements" class="selection-area">
      <div class="col-md-12 sizes-area custom-border">
        <div v-if="!disableEvoucherTypeQtySelection" class="row justify-between items-center evoucher-type-selection">
          <div class="col-md-5 col-sm-12 col-xs-12 q-pa-sm">
            <div class="row justify-between q-col-gutter-sm items-center">
              <div class="col-md-auto">
                <div class="text-h6">
                  {{ $t('Common.InstantRedemption.Text') }}
                </div>
                <div class="text-caption">
                  <Info :message="$t('Common.ChooseAllSizes.Text')" />
                </div>
              </div>
              <div class="col-md-3">
                <q-select
                  v-model="selectedInstantQty"
                  hide-bottom-space
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  :disable="disableEvoucher"
                  :options="quantityOptionsGenerator(itemQty)"
                  @input="calculateBalancedSelectQtyOptions('evoucher', itemQty)"
                />
              </div>
            </div>
          </div>
          <div class="col-md-auto  col-sm-12 col-xs-12">
            <div class="devided">
              {{ $t('Common.OR.Text') }}
            </div>
          </div>
          <div class="col-md-5  col-sm-12 col-xs-12 q-pa-sm">
            <div class="row justify-between q-col-gutter-sm items-center">
              <div class="col-md-auto">
                <div class="text-h6">
                  {{ $t('Common.Evoucher.Text') }}
                </div>
                <div class="text-caption">
                  <Info :message="$t('Common.FutureRedemption.Text')"></Info>
                </div>
              </div>
              <div class="col-md-3">
                <q-select
                  v-model="selectedEvoucherQty"
                  hide-bottom-space
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  :disable="disableEvoucher"
                  :options="quantityOptionsGenerator(itemQty)"
                  @input="calculateBalancedSelectQtyOptions('instant', itemQty)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-markup-table dense separator="cell" bordered square>
        <thead class="bg-grey-1">
          <tr>
            <th>{{ $t('Common.ProductCode.Text') }}</th>
            <th>{{ $t('Common.ProductName.Text') }}</th>
            <th width="5%">
              {{ $t('Common.Quantity.Text') }}
            </th>
            <th width="20%" />
          </tr>
        </thead>
        <attributes
          ref="attributes"
          :is-evoucher-redemption="isEvoucherRedemption"
          :additional-requirements="additionalRequirements"
          :items-data="itemsData"
          :kitting-i-d="kittingID"
          :product-i-d="productID"
          :item-qty="itemQty"
          :table-th="tableTh"
        />
        <!--Todo below props not reactive-->
        <!--:selectedInstantQty="selectedInstantQty"-->
        <!--:selectedEvoucherQty="selectedEvoucherQty"-->
      </q-markup-table>
    </div>
    <div v-else class="info-area text-center">
      <empty-list font-color="amber-8" :message="$t('Sales.AdditionalRequirementSelectionDisabled.Message')" />
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { Attributes } from 'src/application/global/components/common/shared-blocks'
import EmptyList from 'src/application/global/components/common/empty/emptyList'

export default {
  name: 'AdditionalRequirements',
  components: {
    Attributes,
    EmptyList,
  },
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
    disableEvoucher: {
      type: Boolean,
      default: false,
    },
    disableEvoucherTypeQtySelection: {
      type: Boolean,
      default: false,
    },
    isEvoucherRedemption: {
      type: Boolean,
      default: false,
    },
    disableAdditionalRequirements: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    selectedEvoucherQty: 0,
    selectedInstantQty: 0,
  }),
  mounted() {
    this.init()
  },
  computed: {
    ...mapState({
      openCloseModalForm: state => state.globalCMP.openCloseModalForm.modalData,
    }),
    ...mapGetters(['getAdditionalRequirementQty']),
  },
  methods: {
    ...mapMutations({
      setAdditionalRequirementsQty: 'SET_ADDITIONAL_REQUIREMENTS_QUANTITY',
    }),
    async init() {
      let item = await this.getAdditionalRequirementQty(this.productID, this.kittingID)
      if (item !== null) {
        this.selectedInstantQty = item.selectedInstantQty
        this.selectedEvoucherQty = item.selectedEvoucherQty
      }
      // Set instant quantity by default
      await this.calculateBalancedSelectQtyOptions('instant', this.itemQty, true)
    },
    async calculateBalancedSelectQtyOptions(type, qty, init = false) {
      if (type === 'evoucher') {
        this.selectedEvoucherQty = await (qty - this.selectedInstantQty)
      } else if (type === 'instant') {
        this.selectedInstantQty = await (qty - this.selectedEvoucherQty)
      }
      await this.setAdditionalRequirementsQty({
        selectedEvoucherQty: this.selectedEvoucherQty,
        selectedInstantQty: this.selectedInstantQty,
        productID: this.productID,
        kittingID: this.kittingID,
      })
      if (!init) {
        await this.$refs.attributes.rebuild()
      }
    },
    quantityOptionsGenerator(quantity) {
      let options = []
      if (quantity !== '' && quantity !== null) {
        for (let i = 0; i <= quantity; i++) {
          let row = {
            label: i.toString(),
            value: i,
          }
          options.push(row)
        }
      }
      return options
    },
  },
}
</script>
