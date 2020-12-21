<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-8 col-12">
      <div class="row content-between q-col-gutter-md">
        <div class="col-md-8 col-12">
          <!--  Todo make new component for skipDownline config -->
          <q-list v-if="isSkipDownline && !hideMemberInfo" dense>
            <q-item>
              <q-item-section top side>
                {{ $t('Sales.SaleInfoSponsor.Text') }}
              </q-item-section>
              <q-item-section top side>
                {{ getSaleSponsor }}
              </q-item-section>
              <q-item-section top side>
                <div class="q-gutter-xs">
                  <q-btn
                    size="xs"
                    color="primary-darkened"
                    icon="swap_horiz"
                    unelevated
                    rounded
                    @click="activateMemberChange(memberChange)"
                  />
                  <q-btn size="xs" color="primary-darkened" icon="close" unelevated rounded @click="removeSponsor()" />
                </div>
              </q-item-section>
            </q-item>
            <q-separator v-if="salesData.sponsor_member_id === salesData.downline_member_id" />
            <q-item>
              <q-item-section>
                <Info :message="$t('Sales.SaleInfoChangeSponsorInfo.Text')"></Info>
              </q-item-section>
            </q-item>
            <q-item v-if="memberChange">
              <q-item-section class="q-my-sm">
                <q-select
                  v-model.trim="terms"
                  hide-bottom-space
                  :label="$t('members.iboIbName.placeholder.label')"
                  use-input
                  options-dense
                  dense
                  map-options
                  autofocus
                  outlined
                  :options="memberSearchList"
                  @filter="search"
                  @input="item => selected(item, 'terms')"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section>
                        <q-item-label v-html="scope.opt.label" />
                        <q-item-label caption>{{ scope.opt.sublabel }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ $t('Common.NoResult.Text') }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-item-section>
            </q-item>
          </q-list>
          <MemberPersonalInfo
            v-if="!hideMemberInfo"
            :personal-data="memberDetails"
            separator="none"
          ></MemberPersonalInfo>
          <slot name="space-left"></slot>
        </div>
        <div class="col-md-4 col-xs-12">
          <div class="row q-col-gutter-sm">
            <div v-if="showHideFields('transactionDate')" class="col-12">
              <q-input
                hide-bottom-space
                :label="$t('Sales.TransactionDate.Text')"
                dense
                outlined
                clearable
                readonly
                :value="
                  disableEditing
                    ? formatDate(salesData.transaction_date, appSettings.defaulted.date_format)
                    : getCurrentDate(appSettings.defaulted.date_format)
                "
                type="text"
              />
            </div>
            <div class="col-12">
              <q-select
                v-if="!disableEditing || locationsEditState"
                v-model="salesData.location_id"
                class="required"
                hide-bottom-space
                :label="$t('Sales.TransactionLocation.Text')"
                options-dense
                dense
                emit-value
                map-options
                outlined
                :error="validations[validationKey].location_id.$error"
                :error-message="
                  validations[validationKey].location_id.$error
                    ? $t('Common.Missing.Text', {
                        field: $t('general.select.transactionLocation'),
                      })
                    : ''
                "
                clearable
                :readonly="!isValidPayLater && disableEditing"
                :disable="lockTransactionLocation"
                :options="transLocations"
                @input="$emit('setStockLocation', salesData.location_id)"
              />
              <q-input
                v-else
                hide-bottom-space
                :label="$t('Sales.TransactionLocation.Text')"
                dense
                outlined
                :value="getTransLocation"
                readonly
              />
            </div>
            <div class="col-12">
              <q-select
                v-if="(!disableEditing || locationsEditState) && !stockLocationAutoFill"
                v-model="salesData.stock_location_id"
                class="required"
                hide-bottom-space
                :label="$t('Sales.StockLocation.Text')"
                options-dense
                dense
                emit-value
                map-options
                outlined
                :error="
                  $helpers.isSet(validations, 'salesData.stock_location_id') &&
                    validations[validationKey].stock_location_id.$error
                "
                :error-message="
                  $helpers.isSet(validations, 'salesData.stock_location_id') &&
                  validations[validationKey].stock_location_id.$error
                    ? $t('Common.Missing.Text', { field: $t('general.select.stockLocation') })
                    : ''
                "
                clearable
                :disable="salesData.location_id === null"
                :readonly="!isValidPayLater && disableEditing"
                :options="stockLocations"
              />
              <q-input
                v-else
                hide-bottom-space
                :label="$t('Sales.StockLocation.Text')"
                dense
                outlined
                :value="getStockLocation"
                readonly
                :hint="stockLocationAutoFill ? $t('Common.Autofill.Text', { field: '**' }) : ''"
              />
            </div>
            <div v-if="isLocationsEditable" class="col-12">
              <q-btn
                size="xs"
                class="fit"
                rounded
                unelevated
                color="primary-darkened"
                :label="locationsEditState ? 'Cancel Edit' : 'Edit Locations'"
                @click="$emit('changeLocations', locationsEditState)"
              />
            </div>
            <div
              v-if="showHideFields('payCycle')"
              v-permission:[getPermissionDirectiveCallbackString(`create-payCycle`)]="
                event => hasPermissionCheck(event, 'cwSelectionPermissionCreate')
              "
              v-permission:[getPermissionDirectiveCallbackString(`update-payCycle`)]="
                event => hasPermissionCheck(event, 'cwSelectionPermissionUpdate')
              "
              class="col-12"
            >
              <q-select
                v-if="!disableEditing || (disableEditing && salesData.is_back_date_sale && cwSelectionPermissionUpdate)"
                v-model="salesData.cw_id"
                class="required"
                hide-bottom-space
                options-dense
                dense
                emit-value
                map-options
                outlined
                :color="
                  salesData.is_back_date_sale || commissionWeeks.length > 1 ? 'yellow text-black' : 'white text-black'
                "
                :error="validations[validationKey].cw_id.$error"
                clearable
                :readonly="(disableEditing && !salesData.is_back_date_sale) || !cwSelectionPermissionCreate"
                :options="commissionWeeks"
                :label="$t('Common.CW.Text')"
                :hide-hint="!salesData.is_back_date_sale || commissionWeeks.length <= 1"
                :hint="
                  salesData.is_back_date_sale || commissionWeeks.length > 1 ? $t('Common.BackDateAvailable.Text') : ''
                "
              />
              <q-input
                v-else
                hide-bottom-space
                :label="$t('Common.CW.Text')"
                dense
                outlined
                :value="$helpers.getValue(salesData, 'cw.cw_name')"
                readonly
              />
            </div>
            <div v-if="showHideFields('remarks')" class="col-12">
              <q-input
                v-model="salesData.remarks"
                hide-bottom-space
                dense
                outlined
                clearable
                :readonly="disableEditing"
                type="textarea"
                :label="$t('Sales.Remarks.Text')"
              />
            </div>
            <slot name="space-middle"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4 col-12">
      <div class="row justify-end q-col-gutter-md">
        <div v-if="showCvColumns" class="col-4">
          <div class="row no-margin content-stretch full-height q-col-gutter-sm cv-boxes">
            <div class="col-12">
              <span class="text-primary">{{ $t('Common.totalCv.Label') }}</span>
              <h6>{{ $t('Common.cvAmount.Postfix', { cv: salesData.cvs.total_cv || 0 }) }}</h6>
            </div>
            <div class="col-12">
              <span class="text-primary">{{ $t('Common.totalWpCv.Label') }}</span>
              <h6>{{ $t('Common.wpCvAmount.Postfix', { wpCv: salesData.cvs.total_wp_cv || 0 }) }}</h6>
            </div>
            <div class="col-12">
              <span class="text-primary">{{ $t('Common.totalAmpCv.Label') }}</span>
              <h6>{{ $t('Common.ampCvAmount.Postfix', { ampCv: salesData.cvs.total_amp_cv || 0 }) }}</h6>
            </div>
          </div>
        </div>
        <div class="col-8">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.total_nmp"
                hide-bottom-space
                :label="$t('Sales.TotalNMP.Text')"
                dense
                outlined
                type="number"
                readonly
                :prefix="currencyLabelByCountry"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.admin_fee"
                hide-bottom-space
                :label="$t('Sales.AdminFee.Text')"
                dense
                outlined
                type="number"
                :readonly="disableEditing"
                :prefix="currencyLabelByCountry"
                @input="reCalculateCart('admin_fees')"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.delivery_fee"
                hide-bottom-space
                :label="$t('Sales.DeliveryFee.Text')"
                dense
                outlined
                type="number"
                :readonly="disableEditing"
                :prefix="currencyLabelByCountry"
                @input="reCalculateCart('delivery_fees')"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.other_fee"
                hide-bottom-space
                :label="$t('Sales.OtherFee.Text')"
                dense
                outlined
                type="number"
                :readonly="disableEditing"
                :prefix="currencyLabelByCountry"
                @input="reCalculateCart('other_fees')"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.tax_amount"
                hide-bottom-space
                :label="$t('Sales.TaxAmount.Text')"
                dense
                outlined
                type="number"
                readonly
                :prefix="currencyLabelByCountry"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.rounding_adjustment"
                hide-bottom-space
                :label="$t('Sales.RoundingAdjustmentAmount.Text')"
                dense
                outlined
                type="number"
                readonly
                :prefix="currencyLabelByCountry"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="salesData.order_fees.total_gmp"
                hide-bottom-space
                :label="$t('Sales.TotalGMPAmount.Text')"
                dense
                outlined
                type="number"
                :color="salesData.invoice_id && salesData.invoice !== null ? 'positive' : 'red-10'"
                readonly
                :prefix="currencyLabelByCountry"
              />
            </div>
            <div class="col-12">
              <div v-if="isHasPendingPayment" class="animate-blink text-weight-bold text-primary">
                <Info :message="$t('Sales.HasPendingPayment.Text')"></Info>
              </div>
              <slot name="space-right"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { DatesMixin } from 'src/application/global/mixins'
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
  name: 'SaleInfo',
  mixins: [DatesMixin],
  props: {
    memberDetails: {
      type: Object,
    },
    salesData: {
      type: Object,
      required: true,
    },
    disableEditing: {
      type: Boolean,
      default: false,
    },
    locationsEditState: {
      type: Boolean,
      default: false,
    },
    isLocationsEditable: {
      type: Boolean,
      default: false,
    },
    isHasPendingPayment: {
      type: Boolean,
      default: false,
    },
    isValidPayLater: {
      type: Boolean,
      default: false,
    },
    lockTransactionLocation: {
      type: Boolean,
      default: false,
    },
    commissionWeeks: {
      type: Array,
      default: () => [],
    },
    validations: {
      type: Object,
    },
    validationKey: {
      type: String,
      default: 'salesData',
    },
    transLocations: {
      type: Array,
      default: () => [],
    },
    stockLocations: {
      type: Array,
      default: () => [],
    },
    getStockLocation: {
      type: String,
    },
    getTransLocation: {
      type: String,
    },
    isSkipDownline: {
      type: Boolean,
      default: false,
    },
    hideFields: {
      type: Array,
      default: () => [],
    },
    stockLocationAutoFill: {
      type: Boolean,
      default: false,
    },
    showCvColumns: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: Object,
      default: () => ({
        operation: {
          create: {
            payCycle: 'sales.management.new|create',
          },
          update: {
            payCycle: 'sales.management.view|update',
          },
          delete: '',
          view: '',
        },
      }),
    },
    hideMemberInfo: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    memberChange(to) {
      if (to) {
        this.$emit('isDirty')
      }
    },
  },
  data: () => ({
    memberChange: false,
    memberSearchList: [],
    terms: '',
    cwSelectionPermissionCreate: false,
    cwSelectionPermissionUpdate: false,
  }),
  computed: {
    ...mapState({
      membersSearchData: state => state.globalCMP.memberSearchDataGlobal.list,
    }),
    ...mapGetters(['currencyLabelByCountry']),
    getSaleSponsor() {
      return this.$helpers.getValue(this.memberDetails, 'upline.name', this.$t('Common.NotAvailable.Text'))
    },
  },
  methods: {
    ...mapActions(['getMemberSearchAction']),
    async removeSponsor() {
      await new Promise(() => {
        this.$q
          .dialog({
            title: 'Information',
            ok: 'Confirm',
            cancel: 'No',
            noBackdropDismiss: true,
            noEscDismiss: true,
            message: `Confirm Remove Sponsor`,
          })
          .onOk(() => {
            this.salesData.sponsor_member_id = ''
          })
      })
    },
    activateMemberChange(x) {
      this.memberChange = !x
      this.currentTab = 'items'
    },
    search(terms, update, abort) {
      if (terms !== '') {
        let query = {
          sponsor_id: this.salesData.sponsor_member_id,
          search_text: terms,
          limit: 10,
        }
        this.getMemberSearchAction(this.$helpers.removeFalsyValues(query)).then(() => {
          update(() => {
            this.memberSearchList = this.membersSearchData
          })
        })
      } else {
        abort()
      }
    },
    selected(item) {
      let query = { upline_id: this.memberDetails.upline.user_id, user_id: item.userID }
      this.$emit('getMember', query)
      this.salesData.downline_member_id = item.userID
      this.activateMemberChange(this.memberChange)
    },
    hasPermissionCheck(result, type) {
      this[type] = result
    },
    getPermissionDirectiveCallbackString(operation) {
      let text = ''
      let splitText = operation.split('-')
      if (splitText.length === 2) {
        text = this.permissions.operation[splitText[0]][splitText[1]] || ''
      }
      return text
    },
    showHideFields(name) {
      return !this.hideFields.includes(name)
    },
  },
}
</script>
