<template>
  <div class="shared-shipping-tab">
    <div class="row">
      <div class="col-md-12 col-xs-12">
        <q-card square flat>
          <q-card-section>
            <div v-if="filterShippingMethods.length > 0" class="row justify-start">
              <div class="col-auto">
                <q-field
                  class="required"
                  hide-bottom-space
                  :error="validations.selected.shipping.sale_delivery_method.$error"
                >
                  <q-radio
                    v-for="(method, index) in filterShippingMethods"
                    :key="index"
                    v-model="salesData.selected.shipping.sale_delivery_method"
                    class="on-left"
                    color="secondary"
                    :val="method.value"
                    :label="method.label"
                    @input="shippingMethodChanges()"
                  />
                </q-field>
              </div>
              <div class="col-auto">
                <q-btn flat round icon="info">
                  <q-tooltip>
                    <div v-for="opt in masterDataOptionsCreator($const.masterKey.SHIPPING_METHOD_INFO)" class="info">
                      {{ opt.label }}
                    </div>
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
            <div v-else class="row">
              <div v-if="!lockSalesOrder" class="col">
                {{ $t('Common.NoShippingMethodAvailable.Info') }}
              </div>
              <div v-else class="text-subtitle1,text-subtitle2">
                Selected Shipping Method <br /><small>{{
                  salesData.delivery_method ? salesData.delivery_method : '--N/A--'
                }}</small>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <q-banner v-if="showAlert">
          {{ $t('Common.DeliveryFeeUpdated.Text') }}
        </q-banner>
      </div>
    </div>
    <div
      v-if="
        salesData.selected.shipping.sale_delivery_method !== '' &&
          getMasterDataIdByKeyAndTitle($const.masterKey.SALE_DELIVERY_METHOD, $const.masterData.DELIVERY) ===
            salesData.selected.shipping.sale_delivery_method
      "
      class="shared-shipping-content"
    >
      <q-field
        class="required"
        hide-bottom-space
        :error="selectedAddress === null && recalculateDeliveryChargesRequired"
      >
        <div class="row bg-grey-1 group justify-start relative-position">
          <div
            v-for="(address, index1) in addresses"
            v-if="addresses.length > 0"
            class="col-md-2 address-holder cursor-pointer"
            :class="{
              'col-lg-4 no-pointer-events': lockSalesOrder && !skipDownline,
              disabled:
                address.fields.length < 1 ||
                (!lockSalesOrder &&
                  !isShippingAddressCrossCountryDeliveryEligible(index1, transactionCountryID) &&
                  index1 < 4),
            }"
            @click="
              address.fields.length > 0 &&
              isShippingAddressCrossCountryDeliveryEligible(index1, transactionCountryID) &&
              index1 < 5
                ? checkSetSelectedAddressCondition(index1)
                : '',
                address.fields.length > 0 &&
                isShippingAddressCrossCountryDeliveryEligible(index1, transactionCountryID) &&
                index1 < 5
                  ? applyRecipientAddress(index1)
                  : ''
            "
          >
            <div
              v-if="!lockSalesOrder && !isShippingAddressCrossCountryDeliveryEligible(index1, transactionCountryID)"
              class="address-overlay absolute-center fit text-center dimmed text-black"
            >
              <span class="z-max bg-yellow-1 text-body-2 text-weight-bold">{{
                $t('Common.CrossCountryDeliveryNotAllowed.Text')
              }}</span>
            </div>
            <q-card
              square
              flat
              class="fit custom-border"
              :color="
                (!lockSalesOrder || skipDownline) && $v.addresses.$each[index1].fields.$invalid
                  ? 'negative text-white'
                  : selectedAddress === index1
                  ? 'white text-black'
                  : 'white text-black'
              "
            >
              <q-card-section>
                <q-icon v-if="selectedAddress === index1" slot="right" color="positive" name="check_circle" />
                <div v-if="!lockSalesOrder || skipDownline" class="col-md-12">
                  <div class="text-subtitle1,text-subtitle2">
                    {{ address.title }}
                  </div>
                </div>
                <div v-else>
                  <div class="text-black">
                    <small class="text-h6">Recipient</small>
                  </div>
                  <div class="text-green-7">
                    {{ salesData.selected.shipping.recipient_name }}
                  </div>
                  <div class="text-h6">
                    <small
                      >{{ getCallCodeLabel() }}{{ salesData.selected.shipping.recipient_mobile_phone_number }}
                    </small>
                  </div>
                </div>
              </q-card-section>
              <q-card-section>
                <div v-if="address.fields.length > 0" class="address-holder">
                  <div
                    v-for="(field, index2) in sortDynamicFields(address.fields)"
                    v-show="field.value !== ''"
                    :key="field.label"
                    class="address-field light-paragraph"
                    :class="
                      (!lockSalesOrder || skipDownline) && $v.addresses.$each[index1].fields.$invalid
                        ? 'text-white'
                        : 'text-grey-8'
                    "
                  >
                    <span v-if="field.type === 'select'">
                      {{ setSelectDataValue(field.value, field.key, field.type) }}</span
                    >
                    <span v-else>{{ removeLastComma(field.value) }}</span>
                    <span v-if="index2 !== address.fields.length - 1">,</span>
                    <span v-else>.</span>
                  </div>
                </div>
                <div v-else class="empty col-md-12">
                  <empty-list v-if="!address.title.includes('Custom')" />
                  <div v-else class="row fit justify-center">
                    <div class="text-grey-3 self-center">
                      <span class="text-h2">
                        <q-icon name="add" />
                      </span>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <!-- Add new address if no address -->
          <div
            v-if="addresses.length < 5 && addresses.length !== 1"
            class="col-md-2 address-holder"
            @click="setCustomAddress()"
          >
            <q-card square flat class="fit custom-border">
              <q-card-section class="fit">
                <div class="row fit justify-center">
                  <div class="text-grey-3 self-center">
                    <q-field
                      class="required"
                      hide-bottom-space
                      :error="validations.selected.shipping.recipient_addresses.$error"
                    >
                      <span class="text-h2">
                        <q-icon name="add" />
                      </span>
                    </q-field>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-field>
      <div v-if="addresses.length > 0 && (!lockSalesOrder || (lockSalesOrder && skipDownline))" class="row mt-10">
        <div class="col-md-5">
          <q-card square flat class="full-height">
            <q-card-section>
              <p class="text-h6">
                Recipient Details
              </p>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-xs">
                <div class="col-12">
                  <q-input
                    v-model="salesData.selected.shipping.recipient_name"
                    class="required"
                    hide-bottom-space
                    dense
                    outlined
                    label="Recipient Name"
                    :error="validations.selected.shipping.recipient_name.$error"
                    clearable
                    @input="validations.selected.shipping.recipient_name.$touch"
                  />
                </div>
                <div class="col-12 relative-position">
                  <q-field
                    class="required"
                    hide-bottom-space
                    label="Phone Number"
                    :error="
                      validations.selected.shipping.recipient_mobile_country_code_id.$error ||
                        validations.selected.shipping.recipient_mobile_phone_number.$error
                    "
                  >
                    <div class="row q-col-gutter-xs">
                      <div class="col-6">
                        <q-select
                          v-model="salesData.selected.shipping.recipient_mobile_country_code_id"
                          hide-bottom-space
                          options-dense
                          dense
                          emit-value
                          map-options
                          outlined
                          clearable
                          :options="callCodeOptionsByCountry"
                          @input="validations.selected.shipping.recipient_mobile_country_code_id.$touch"
                        />
                      </div>
                      <div class="col-6">
                        <q-input
                          v-model="salesData.selected.shipping.recipient_mobile_phone_number"
                          hide-bottom-space
                          dense
                          outlined
                          clearable
                          :disable="salesData.selected.shipping.recipient_mobile_country_code_id === ''"
                          @input="validations.selected.shipping.recipient_mobile_phone_number.$touch"
                        />
                      </div>
                    </div>
                  </q-field>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-for="(address, index1) in addresses" v-if="selectedAddress === index1" class="col-md-7">
          <q-card square flat class="full-height">
            <q-card-section>
              <p class="text-h6">
                Recipient Shipping Address
              </p>
              <q-btn-group slot="right" outline>
                <q-btn
                  v-if="address.title.includes('Custom') && recalculateDeliveryChargesRequired"
                  icon="loop"
                  :label="$t('Common.RecalculateDeliveryFee.Text')"
                  color="positive"
                  @click="customAddressGetDeliveryCharges(index1)"
                />
                <q-btn
                  v-if="address.title.includes('Custom')"
                  icon="close"
                  color="negative"
                  @click="removeCustomAddress(index1)"
                >
                  <q-tooltip>
                    <small>{{ $t('Common.Clear.Button') }}</small>
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-card-section>
            <q-card-section>
              <p
                v-if="address.title.includes('Custom') && $v.recalculateDeliveryChargesRequired.$invalid"
                class="animated flash text-negative"
              >
                {{ $t('Common.RecalculateDeliveryFee.Info') }}
              </p>
              <p
                v-if="$v.addresses.$each[index1].fields.$invalid && !isCustomAddressLimitCountry"
                class="animated flash text-negative"
              >
                {{ $t('Common.AddressValidationError.Info.1') }}
                <q-btn
                  v-if="address.fields.length > 0"
                  icon="delete"
                  outline
                  dense
                  color="negative"
                  @click="changeCountry(index1)"
                />
                {{ $t('Common.AddressValidationError.Info.2', { title: address.title }) }}
              </p>
              <div class="row q-col-gutter-sm" :class="{ 'lock disabled': !address.title.includes('Custom') }">
                <div
                  v-if="address.fields.length > 0"
                  class="col-md-12"
                  :class="{ 'no-pointer-events not-allowed': !address.title.includes('Custom') }"
                >
                  <div
                    v-for="(field, index2) in sortDynamicFields(address.fields)"
                    :key="field.label"
                    class="dynamic-field"
                  >
                    <q-input
                      v-if="field.type === 'input'"
                      v-model.trim="
                        addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)].value
                      "
                      hide-bottom-space
                      dense
                      outlined
                      :label="field.label"
                      :error="
                        field.required && address.title.includes('Custom')
                          ? $v.addresses.$each[index1].fields.$each[
                              setDynamicFieldIndex(addresses[index1].fields, field.index)
                            ].value.$invalid
                          : false
                      "
                      :error-message="field.helper !== '' ? field.helper : 'Required Field'"
                      class="text-capitalize,q-mb-sm"
                      clearable
                      :readonly="!address.title.includes('Custom')"
                      @input="
                        addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)].value
                          .$touch
                      "
                    />
                    <q-select
                      v-if="
                        field.type === 'select' || (field.type === 'custom-select' && field.type !== 'masters-select')
                      "
                      v-model="
                        addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)].value
                      "
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      :disable="
                        field.key === 'countries' ||
                          (setDynamicFieldKeyOptionsData(field.key, field.identifier, index1, index2).length < 1 &&
                            field.type !== 'custom-select')
                      "
                      clearable
                      :readonly="!address.title.includes('Custom')"
                      :options="
                        field.options
                          ? field.options
                          : setDynamicFieldKeyOptionsData(
                              field.key,
                              field.identifier,
                              index1,
                              index2,
                              address.title.includes('Custom')
                            )
                      "
                      @input="
                        field.trigger === 'cities'
                          ? setCities(
                              addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)]
                                .value
                            )
                          : '',
                          field.required
                            ? addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)]
                                .value.$touch
                            : false
                      "
                    />
                    <q-select
                      v-if="field.type === 'masters-select'"
                      v-model="
                        addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)].value
                      "
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      clearable
                      :disable="true"
                      :readonly="!address.title.includes('Custom')"
                      :options="
                        field.options
                          ? field.options
                          : setDynamicFieldKeyOptionsData(field.key, field.identifier, index1, index2)
                      "
                      @input="
                        addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)].value
                          .$touch
                      "
                    />
                  </div>
                </div>
                <div
                  v-if="address.title.includes('Custom') && !isCustomAddressLimitCountry && address.fields.length > 0"
                  class="col-md-12"
                >
                  <div class="row justify-end">
                    <q-btn
                      class="q-mt-xs"
                      color="amber"
                      outline
                      label="Change Country"
                      @click="changeCountry(index1)"
                    />
                  </div>
                </div>
                <div v-if="!isCustomAddressLimitCountry && address.fields.length < 1" class="col-md-12">
                  <q-select
                    v-model="selectedCountry"
                    hide-bottom-space
                    options-dense
                    dense
                    emit-value
                    map-options
                    outlined
                    label="Please choose country first"
                    :error="validations.selected.shipping.recipient_addresses.$error"
                    class="animate-blink"
                    clearable
                    :options="getCountriesByFilters()"
                    @input="
                      setCountrySelectionOnSelectedAddress(), validations.selected.shipping.recipient_addresses.$touch
                    "
                  />
                </div>
              </div>
              <div v-if="loadAddressFailed">
                <empty-list :message="$t('Common.LoadingAddressFailed.Text')" font-color="negative" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList.vue'
import {
  AddressMixin,
  GeneralsMixin,
  MasterDataTransformarMixin,
  TrashCollectorMixin,
} from 'src/application/global/mixins/index'
import { Dialog } from 'quasar'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'SalesShippingTab',
  components: {
    EmptyList,
  },
  mixins: [MasterDataTransformarMixin, AddressMixin, TrashCollectorMixin, GeneralsMixin],
  props: {
    salesData: {
      type: Object,
      required: true,
    },
    memberDetails: {
      type: Object,
      default: () => {},
    },
    lockSalesOrder: {
      type: Boolean,
      required: true,
    },
    validations: {
      type: Object,
      required: true,
    },
    skipDownline: {
      default: false,
    },
    isSalesExchange: {
      default: false,
    },
    isEnrolment: {
      default: false,
    },
    isCustomAddressLimitCountry: {
      type: Boolean,
      default: true,
    },
    transactionCountryID: {
      type: [Number, Boolean],
      default: false,
    },
    enableCrossCountry: {
      type: Boolean,
      required: false,
    },
    id: {
      type: [Number, String],
    },
    availableShippingOptions: {
      type: Array,
      default: () => [],
    },
    removeSelfPickup: {
      type: Boolean,
      required: false,
    },
    forceIncludeShippingMethods: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    recalculateDeliveryChargesRequired: true,
    showAlert: false,
  }),
  computed: {
    ...mapGetters(['callCodeOptionsByCountry']),
    ...mapState({
      masterData: state => state.globalCMP.masterData.data.list,
      storeAddresses: state => state.salesCMP.salesAddresses,
      appSettings: state => state.globalCMP.appSettings,
      selectedFilters: state => state.globalCMP.selectedFilters,
      done: state => state.globalCMP.done,
    }),
    isMasterLoadingDone() {
      return this.$wait.is([this.master.identifier])
    },
    filterShippingMethods() {
      let filter = this.availableShippingOptions.filter(x => !this.deliveryMethodEnabler(x.value))
      filter = [...this.forceIncludeShippingMethods, ...filter]
      return _.uniqBy(filter, 'label')
    },
  },
  watch: {
    // Custom validator for this special case
    // update to parent with latest validation status
    $v: {
      handler(data) {
        this.$emit('checkAddressesValidationStatus', data.$error)
      },
      deep: true,
    },
    memberDetails: {
      handler() {
        // Reset if member changed for skip downlines
        if (this.isSkipDownline) {
          this.addresses = []
          this.initAddressArea()
        }
      },
      deep: true,
    },
    id: {
      handler() {
        // Reset if new sale become valid sale
        this.initAddressArea()
      },
      deep: true,
    },
    addresses: {
      handler(to) {
        if (to.length > 0) {
          this.recalculateDeliveryChargesRequired = true
        }
      },
      deep: true,
    },
    isMasterLoadingDone(to) {
      if (!to) {
        // Temp solution need to create master data resolver
        this.initAddressArea()
      }
    },
    filterShippingMethods: {
      async handler(to) {
        let exist = to.find(x => x.value === this.salesData.selected.shipping.sale_delivery_method)
        if (!exist) {
          if (to.length > 0) {
            this.salesData.selected.shipping.sale_delivery_method = to[0].value
            await this.shippingMethodChanges()
          }
        }
      },
    },
  },
  async mounted() {
    this.master = {
      identifier: 'shippingMasterKeys',
      keys: [
        this.$const.masterKey.SALE_TYPES,
        this.$const.masterKey.PWP_FREE_ITEMS_PROMO_TYPES,
        this.$const.masterKey.COUNTRY_CODE,
        this.$const.masterKey.SALE_DELIVERY_METHOD,
        this.$const.masterKey.SHIPPING_METHOD_INFO,
      ],
    }
  },
  validations() {
    let def = {
      addresses: {},
      recalculateDeliveryChargesRequired: {},
    }
    if (
      this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_DELIVERY_METHOD, this.$const.masterData.DELIVERY) ===
        this.salesData.selected.shipping.sale_delivery_method &&
      this.addresses.length > 0 &&
      (!this.lockSalesOrder || this.skipDownline)
    ) {
      def.addresses = {
        $each: {
          fields: {
            $each: {
              value: {
                check(val, elm) {
                  if (elm.required || elm.min) {
                    if (elm.value === '' || elm.value === null) {
                      return false
                    }
                  }
                  return true
                },
              },
            },
          },
        },
      }
      def.recalculateDeliveryChargesRequired = {
        isRequired(val) {
          return !val
        },
      }
    }
    return def
  },
  methods: {
    ...mapActions(['getSalesProductSearchAction']),
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
      setCartPwpValidationIds: 'SET_CART_PWP_VALIDATION_IDS',
      unsetCartPwpValidationIds: 'UNSET_CART_PWP_VALIDATION_IDS',
      setCartPwpItemTempList: 'SET_CART_PWP_ITEM_TEMP_LIST',
      unsetCartPwpItemList: 'UNSET_CART_PWP_ITEM_TEMP_LIST',
      setSalesAddresses: 'SET_SALES_ADDRESSES_DATA',
    }),
    async initAddressArea() {
      let salesSelectedRecipientAddress = []
      if (
        this.lockSalesOrder &&
        !this.skipDownline &&
        this.salesData.selected.shipping.recipient_addresses.length > 0
      ) {
        salesSelectedRecipientAddress = JSON.parse(this.salesData.selected.shipping.recipient_addresses)
      }

      if (salesSelectedRecipientAddress.length > 0 && this.lockSalesOrder && !this.skipDownline) {
        this.addresses = salesSelectedRecipientAddress
      } else {
        if (this.isEnrolment || (this.addresses.length < 1 && this.storeAddresses.length < 1)) {
          if (
            this.memberDetails !== null &&
            this.memberDetails !== undefined &&
            this.memberDetails.address !== null &&
            this.memberDetails.address !== '' &&
            this.memberDetails.address !== undefined &&
            Object.keys(this.memberDetails.address).length > 0
          ) {
            if (typeof this.memberDetails.address.address_data === 'string') {
              this.addresses = JSON.parse(this.memberDetails.address.address_data)
            } else {
              this.addresses = JSON.parse(JSON.stringify(this.memberDetails.address.address_data))
            }
          } else if (
            this.memberDetail !== null &&
            this.memberDetail !== undefined &&
            this.memberDetail.address !== null &&
            this.memberDetail.address !== '' &&
            Object.keys(this.memberDetail.address).length > 0
          ) {
            this.addresses = this.memberDetail.address.address_data
          }
        } else {
          if (this.storeAddresses.length > 0) {
            this.addresses = JSON.parse(JSON.stringify(this.storeAddresses))
          }
        }
      }

      if (
        this.getMasterDataIdByKeyAndTitle(
          this.$const.masterKey.SALE_DELIVERY_METHOD,
          this.$const.masterData.DELIVERY
        ) === this.salesData.selected.shipping.sale_delivery_method
      ) {
        this.enableMixinInitCheck = true
      }

      if (this.salesData.selected.shipping.recipient_selected_shipping_index !== '') {
        this.selectedAddress = this.salesData.selected.shipping.recipient_selected_shipping_index
      }

      this.setDeliveryInfo()

      if (
        (!this.lockSalesOrder || this.skipDownline) &&
        this.getMasterDataIdByKeyAndTitle(
          this.$const.masterKey.SALE_DELIVERY_METHOD,
          this.$const.masterData.DELIVERY
        ) === this.salesData.selected.shipping.sale_delivery_method &&
        this.salesData.selected.shipping.recipient_selected_shipping_index !== ''
      ) {
        let isMatching = false
        this.addresses.forEach((address, index) => {
          if (
            this.getAddressString(address) ===
            this.getAddressString(this.addresses[this.salesData.selected.shipping.recipient_selected_shipping_index])
          ) {
            this.selectedAddress = index
            isMatching = true
          }
        })
        if (!isMatching) {
          let customAddress = _.cloneDeep(
            this.$helpers.getValue(this.salesData, 'selected.shipping.recipient_addresses')
          )
          if (typeof customAddress === 'string') {
            customAddress = JSON.parse(customAddress)
          }
          customAddress = customAddress[0].fields
          this.setCustomAddress(customAddress)
        } else {
          this.applyRecipientAddress(this.selectedAddress)
        }
      }

      if (
        this.id !== undefined &&
        this.getMasterDataIdByKeyAndTitle(
          this.$const.masterKey.SALE_DELIVERY_METHOD,
          this.$const.masterData.DELIVERY
        ) === this.salesData.selected.shipping.sale_delivery_method
      ) {
        await this.initMixin(true)
      }
      this.recalculateDeliveryChargesRequired = false
      this.$v.$touch()
    },
    // apply recipient address after
    applyRecipientAddress(index) {
      this.getDeliveryCharges(index)
      if (!this.lockSalesOrder || this.skipDownline) {
        if (this.addresses.length > 0 && index >= 0 && index !== '') {
          this.salesData.selected.shipping.recipient_selected_shipping_index = index
          this.salesData.selected.shipping.recipient_addresses = []
          this.salesData.selected.shipping.recipient_addresses.push(this.addresses[index])
        }
      }
    },
    // validate selectable addresses
    checkSetSelectedAddressCondition(index) {
      if (
        !this.lockSalesOrder ||
        this.skipDownline ||
        !(this.isSaleOrderStatusCancelled || this.isSaleOrderStatusComplete)
      ) {
        if (
          (typeof this.addresses[index].fields !== 'undefined' && this.addresses[index].fields.length > 0) ||
          index > 3
        ) {
          this.setSelectedAddress(index)
        }
      }
    },
    setCustomAddress(custom = false) {
      let addNewCustomAddress = {
        title: 'Custom',
        fields: custom ? custom : [],
      }
      this.addresses.push(addNewCustomAddress)
      this.selectedAddress = this.addresses.length - 1
      this.applyRecipientAddress(this.addresses.length - 1)
      if (custom) {
        this.setCountrySelectionOnSelectedAddress()
      }
      if (this.isCustomAddressLimitCountry) {
        if (this.selectedFilters.countryID !== undefined && this.selectedFilters.countryID !== '') {
          this.loadAddressFailed = false
          this.selectedCountry = this.selectedFilters.countryID
          this.setCountrySelectionOnSelectedAddress()
        } else {
          this.loadAddressFailed = true
        }
      }
    },
    changeCountry(index) {
      Dialog.create({
        title: 'Warning',
        message: 'Your are about to loose existing data',
        noEscDismiss: true,
        noBackdropDismiss: true,
        position: 'top',
        ok: 'Ok',
        cancel: 'Cancel',
      }).onOk(() => {
        let trashUID = this.pushTrashData('shipping-address', this.addresses[index].fields)
        this.setCountrySelectionOnSelectedAddress()
        this.selectedCountry = ''
        this.addresses[index].fields = []
        this.$q.notify({
          message: 'The item has been moved to the Bin',
          icon: 'warning',
          timeout: this.appSettings.notifications.timeout,
          position: 'bottom',
          color: 'tertiary',
          actions: [
            {
              label: 'Undo',
              handler: () => {
                let trashData = this.getTrashDataById(trashUID)
                this.addresses[index].fields = JSON.parse(JSON.stringify(trashData))
                let stateId = this.addresses[index].fields.filter(x => x.key === 'states')
                this.setStates(stateId[0].value)
                this.$q.notify({
                  message: 'Your action has been undo',
                  icon: 'undo',
                  color: 'tertiary',
                  timeout: this.appSettings.notifications.timeout,
                  position: 'bottom',
                })
              },
            },
          ],
        })
      })
    },
    removeCustomAddress(index) {
      this.addresses.splice(index, 1)
      this.selectedCountry = ''
      this.selectedAddress = null
    },
    deliveryMethodEnabler(value) {
      if (this.salesData.is_rental_sale_order === 1 || this.removeSelfPickup) {
        if (
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.SALE_DELIVERY_METHOD,
            this.$const.masterData.SELF_PICK_UP
          ) === value
        ) {
          if (this.removeSelfPickup) {
            return true
          }
          // always disable self pickup cos that is invalid for rental sales
          let isSingaporeRental = false
          let sgCode = this.countriesOptions.options.find(country => {
            return country.label === 'Singapore'
          })
          if (sgCode !== null && sgCode !== undefined) {
            isSingaporeRental = this.salesData.country_id === sgCode.value
          }
          return this.lockSalesOrder || !isSingaporeRental
        } else if (
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.SALE_DELIVERY_METHOD,
            this.$const.masterData.WITHOUT_SHIPPING
          ) === value
        ) {
          // if there's a sponsor member, only enable this
          if (this.skipDownline) {
            if (this.lockSalesOrder && (this.isSaleOrderStatusCancelled || this.isSaleOrderStatusComplete)) {
              return true
            }
          } else {
            return true
          }
        } else if (this.lockSalesOrder || this.skipDownline) {
          return true
        }
      } else {
        if (
          this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.SALE_DELIVERY_METHOD,
            this.$const.masterData.WITHOUT_SHIPPING
          ) === value
        ) {
          if (this.lockSalesOrder && this.skipDownline) {
            return true
          }
          if (!this.lockSalesOrder && !this.skipDownline) {
            return true
          }
          if (this.lockSalesOrder && !this.skipDownline) {
            return true
          }
        } else {
          if (this.lockSalesOrder && !this.skipDownline) {
            if (this.salesData.sponsor_member_id === this.salesData.downline_member_id) {
              return true
            } else {
              return this.salesData.sponsor_member_id !== ''
            }
          }
          if (!this.lockSalesOrder && this.skipDownline) {
            return true
          }
          if (
            !this.isSalesExchange &&
            this.salesData.sponsor_member_id === this.salesData.downline_member_id &&
            this.salesData.downline_member_id !== undefined
          ) {
            return true
          }
        }
      }
    },
    setDeliveryInfo() {
      if (
        this.memberDetails.information !== null &&
        this.memberDetails.information !== '' &&
        (!this.lockSalesOrder || this.skipDownline) &&
        this.getMasterDataIdByKeyAndTitle(
          this.$const.masterKey.SALE_DELIVERY_METHOD,
          this.$const.masterData.DELIVERY
        ) === this.salesData.selected.shipping.sale_delivery_method
      ) {
        this.initMixin(true)
        if (this.salesData.selected.shipping.recipient_name === '') {
          if (this.memberDetails.details !== null && this.memberDetails.details !== undefined) {
            this.salesData.selected.shipping.recipient_name = this.memberDetails.details.name
          } else if (this.memberDetail.details !== null && this.memberDetail.details !== undefined) {
            this.salesData.selected.shipping.recipient_name = this.memberDetail.details.name
          }
        }
        if (this.salesData.selected.shipping.recipient_mobile_country_code_id === '') {
          if (this.memberDetails.contact_info !== null && this.memberDetails.contact_info !== undefined) {
            this.salesData.selected.shipping.recipient_mobile_country_code_id = this.memberDetails.contact_info.mobile_1_country_code_id
          } else if (this.memberDetail.contact_info !== null && this.memberDetail.contact_info !== undefined) {
            this.salesData.selected.shipping.recipient_mobile_country_code_id = this.memberDetail.contact_info.mobile_1_country_code_id
          }
        }
        if (this.salesData.selected.shipping.recipient_mobile_phone_number === '') {
          if (this.memberDetails.contact_info !== null && this.memberDetails.contact_info !== undefined) {
            this.salesData.selected.shipping.recipient_mobile_phone_number = this.memberDetails.contact_info.mobile_1_num
          } else if (this.memberDetail.contact_info !== null && this.memberDetail.contact_info !== undefined) {
            this.salesData.selected.shipping.recipient_mobile_phone_number = this.memberDetail.contact_info.mobile_1_num
          }
        }
      }
    },
    getCallCodeLabel() {
      let label = '--??--'
      let item = this.callCodeOptionsByCountry.find(
        x => x.value === this.salesData.selected.shipping.recipient_mobile_country_code_id
      )
      if (item !== undefined) {
        label = item.label
      }
      return label
    },
    async shippingMethodChanges() {
      let shippingMethodDeliveryID = await this.getMasterDataIdByKeyAndTitle(
        this.$const.masterKey.SALE_DELIVERY_METHOD,
        this.$const.masterData.DELIVERY
      )
      let selectedShippingMethodID = await this.salesData.selected.shipping.sale_delivery_method
      if (shippingMethodDeliveryID !== selectedShippingMethodID) {
        this.salesData.selected.shipping.recipient_addresses = []
        this.salesData.selected.shipping.recipient_name = ''
        this.salesData.selected.shipping.recipient_mobile_country_code_id = ''
        this.salesData.selected.shipping.recipient_mobile_phone_number = ''
        this.salesData.selected.shipping.recipient_selected_shipping_index = null
      } else {
        this.setDeliveryInfo()
        this.initMixin(true)
      }
      if (
        (shippingMethodDeliveryID === selectedShippingMethodID && this.selectedAddress !== null) ||
        selectedShippingMethodID !== shippingMethodDeliveryID
      ) {
        if (this.selectedAddress !== null) {
          this.applyRecipientAddress(this.selectedAddress)
        } else {
          this.getDeliveryCharges()
        }
      }
    },
    async getDeliveryCharges(index) {
      this.showAlert = false
      if (index <= 3 || (index > 3 && this.addresses[index].fields.length > 0) || index === undefined) {
        this.recalculateDeliveryChargesRequired = false
        await this.$emit('reCalculateCart', 'delivery_fees')
        this.showAlert = true
      }
    },
    async customAddressGetDeliveryCharges(index) {
      await this.applyRecipientAddress(index)
    },
    getCountriesByFilters() {
      let unFilteredCountries = this.countriesOptions.options
      let filteredCountriesIDs = [this.transactionCountryID]
      this.crossBorderDeliveryCountriesByCountry.forEach(x => {
        filteredCountriesIDs.push(x.value)
      })
      if (filteredCountriesIDs.length > 0) {
        return unFilteredCountries.filter(x => filteredCountriesIDs.includes(x.value))
      }
    },
  },
  async beforeDestroy() {
    if (
      (!this.lockSalesOrder || this.skipDownline) &&
      this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.SALE_DELIVERY_METHOD, this.$const.masterData.DELIVERY) ===
        this.salesData.selected.shipping.sale_delivery_method &&
      this.salesData.selected.shipping.recipient_selected_shipping_index !== ''
    ) {
      this.setSalesAddresses(this.addresses)
    }
  },
}
</script>
<style lang="stylus">
.address-overlay > span
  margin 0
  position: absolute
  top: 50%
  left: 50%
  margin-right: -50%
  transform: translate(-50%, -50%)
</style>
