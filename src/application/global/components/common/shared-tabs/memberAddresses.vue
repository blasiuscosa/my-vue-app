<template>
  <div class="address-tab">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div
            v-for="(address, index1) in addresses"
            class="col-md-3 col-xs-12 address-holder"
            :class="{ 'cursor-pointer': !lockMemberData }"
            @click="lockMemberData ? '' : setSelectedAddress(index1)"
          >
            <q-card
              square
              flat
              class="fit q-card--bordered"
              :class="
                $v.addresses.$each[index1].fields.$invalid || $v.addresses.$each[index1].$error
                  ? 'bg-negative text-white'
                  : selectedAddress === index1
                  ? 'bg-grey-1 text-black'
                  : ''
              "
            >
              <q-item>
                <q-item-section avatar>
                  <q-avatar font-size="1.5rem">
                    <q-icon
                      :color="selectedAddress === index1 ? 'positive' : 'grey-2'"
                      :name="selectedAddress === index1 ? 'check_box' : 'check_box_outline_blank'"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ address.title }}
                    <span
                      v-if="addressRulesChecker(index1, 'addresses_compulsory_indices')"
                      :class="
                        $v.addresses.$each[index1].fields.$invalid || $v.addresses.$each[index1].$error
                          ? 'text-white'
                          : 'text-negative'
                      "
                      >*</span
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-card-section>
                <div v-if="address.fields.length > 0" class="address-holder">
                  <div
                    v-for="(field, index2) in sortDynamicFields(address.fields)"
                    v-show="field.value !== ''"
                    :key="field.label"
                    class="address-field light-paragraph"
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
                  <empty-list v-if="lockMemberData" />
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
        </div>
      </div>
      <div class="col-12">
        <div class="row">
          <div v-for="(address, index1) in addresses" v-if="selectedAddress === index1" class="col-12">
            <q-card square flat class="fit q-card--bordered">
              <q-card-section>
                <p
                  v-if="
                    $v.addresses.$each[index1].fields.$invalid &&
                      !addressRulesChecker(index1, 'addresses_compulsory_indices')
                  "
                  class="animated pulse text-negative"
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
                <p
                  v-if="
                    $v.addresses.$each[index1].fields.$invalid &&
                      addressRulesChecker(index1, 'addresses_compulsory_indices')
                  "
                  class="animated flash text-negative"
                >
                  {{ $t('Common.AddressValidationError.Info') }}
                </p>
                <div class="row q-col-gutter-sm">
                  <div v-if="address.fields.length > 0" class="col-md-8">
                    <div class="row actions justify-end q-ma-sm">
                      <div v-if="!lockMemberData" class="col-auto">
                        <q-btn-group unelevated rounded>
                          <q-btn-dropdown
                            ref="target"
                            color="primary"
                            :label="$t('Common.Copy.Button')"
                            icon="file_copy"
                          >
                            <q-list>
                              <q-item
                                v-for="(address, index3) in addresses"
                                v-if="index3 !== index1 && addressRulesChecker(index3, 'addresses_compulsory_indices')"
                                :key="index3"
                                v-close-popup
                                @click.native="setAddressFields(index1, index3)"
                              >
                                <q-item-section icon="content_copy" />
                                <q-item-label>
                                  <q-item-section label> Copy to {{ address.title }} </q-item-section>
                                </q-item-label>
                              </q-item>
                            </q-list>
                          </q-btn-dropdown>
                          <q-btn
                            v-if="address.fields.length > 0"
                            :icon="addressRulesChecker(index1, 'addresses_compulsory_indices') ? 'edit' : 'delete'"
                            color="primary"
                            @click="changeCountry(index1)"
                          />
                        </q-btn-group>
                      </div>
                    </div>
                    <div
                      v-for="(field, index2) in sortDynamicFields(address.fields)"
                      :key="field.label"
                      class="dynamic-field q-ma-sm"
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
                          field.required
                            ? $v.addresses.$each[index1].fields.$each[
                                setDynamicFieldIndex(addresses[index1].fields, field.index)
                              ].value.$invalid
                            : false
                        "
                        :error-message="field.helper !== '' ? field.helper : 'Required Field'"
                        class="text-capitalize"
                        clearable
                        :disable="lockMemberData"
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
                        :label="field.label"
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
                        :options="
                          field.options
                            ? field.options
                            : setDynamicFieldKeyOptionsData(
                                field.key,
                                field.identifier,
                                index1,
                                index2,
                                addressRulesChecker(index1, 'addresses_compulsory_indices')
                              )
                        "
                        @input="
                          field.trigger === 'cities'
                            ? setCities(
                                addresses[index1].fields[setDynamicFieldIndex(addresses[index1].fields, field.index)]
                                  .value,
                                index1,
                                index2
                              )
                            : ''
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
                        :label="field.label"
                        hide-bottom-space
                        options-dense
                        dense
                        emit-value
                        map-options
                        outlined
                        clearable
                        :disable="lockMemberData"
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
                  <div v-else class="col-md-5 col-12">
                    <info class="q-my-md" message="Please choose country to add address fields"></info>
                    <q-select
                      v-model="selectedCountry"
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      label="Countries"
                      clearable
                      :disable="lockMemberData"
                      color="text-grey-6"
                      :options="
                        addressRulesChecker(index1, 'addresses_compulsory_indices')
                          ? countriesOptions.options
                          : countriesActiveOptions.options
                      "
                      @input="setCountrySelectionOnSelectedAddress()"
                    />
                  </div>
                </div>
                <div v-if="loadAddressFailed" class="q-mt-sm">
                  <empty-list :message="$t('Common.LoadingAddressFailed.Text')" font-color="negative" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import trans from 'src/application/global/components/common/transition/transition'
import { AddressMixin, MasterDataTransformarMixin, TrashCollectorMixin } from 'src/application/global/mixins/index'
import EmptyList from 'src/application/global/components/common/empty/emptyList.vue'
import { Dialog } from 'quasar'
import { mapActions, mapState } from 'vuex'
import Info from '../elements/info'

export default {
  name: 'AddressTab',
  components: {
    Info,

    EmptyList,
    trans,
  },
  mixins: [AddressMixin, TrashCollectorMixin, MasterDataTransformarMixin],
  props: {
    memberData: {
      type: Object,
      required: true,
    },
    lockMemberData: {
      type: Boolean,
      default: false,
    },
    newRegistration: {
      type: Boolean,
      default: false,
    },
    countryID: {
      type: [Number, String],
    },
  },
  validations: {
    addresses: {
      $each: {
        addressMandatoryCheck(val, elm) {
          if (this.addressRulesChecker(this.addresses.indexOf(val), 'addresses_compulsory_indices')) {
            return val.fields.length > 0
          }
          return true
        },
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
    },
  },
  watch: {
    // Custom validator for this special case
    // update to parent with latest validation status
    $v: {
      handler(data) {
        this.triggerValidation(data)
      },
      deep: true,
    },
  },
  computed: {
    ...mapState({
      languageOptions: state => state.globalCMP.languagesOptions.data,
    }),
    getCountryId() {
      return this.countryID && this.countryID !== null
        ? this.countryID
        : this.newRegistration
        ? this.selectedFilters.countryID
        : this.$helpers.getValue(this.memberData, 'details.country_id', null)
    },
  },
  mounted() {
    this.master.keys = [this.$const.masterKey.ADDRESSES_COMPULSORY_INDICES]
    this.master.country_id = this.getCountryId
    this.addresses = this.memberData.address.address_data
    this.getLanguagesAction()
    this.initMixin(true)
  },
  methods: {
    ...mapActions(['getLanguagesAction']),
    changeCountry(index) {
      this.loadAddressFailed = false
      Dialog.create({
        title: 'Warning',
        message: `Your are about to loose existing address information. You may redo the action by clicking redo button @ notification message.`,
        noEscDismiss: true,
        noBackdropDismiss: true,
        position: 'top',
        ok: 'Ok',
        cancel: 'Cancel',
      }).onOk(() => {
        let trashUID = this.pushTrashData('member-address', this.addresses[index].fields)
        this.setCountrySelectionOnSelectedAddress()
        this.selectedCountry = ''
        this.addresses[index].fields = []
        this.$q.notify({
          message: 'The item has been moved to the Bin',
          icon: 'warning',
          timeout: this.appSettings.notifications.timeout,
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
                })
              },
            },
          ],
        })
      })
    },
    addressRulesChecker(addressIndex, key) {
      let configs = this.masterDataConfigOptionsCreator(key)
      if (configs.length > 0) {
        let confIndex = configs.findIndex(x => x.config === addressIndex.toString())
        if (confIndex !== -1) {
          return true
        }
      }
      return false
    },
    validate() {
      if (!this.lockMemberData) {
        this.$v.$touch()
      }
    },
    triggerValidation(data) {
      this.validate()
      this.$emit('checkAddressesValidationStatus', data.$invalid)
    },
  },
}
</script>
