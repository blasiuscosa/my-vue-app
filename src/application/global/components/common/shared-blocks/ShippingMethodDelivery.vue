<template>
  <div class="row q-col-gutter-sm">
    <div v-if="!readOnly" class="col-12">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <div class="row q-col-gutter-sm">
            <div
              v-for="(address, index) in getSelectableAddress"
              v-if="!address.exclude"
              :key="`address-${index}`"
              class="col-md-2 col-12"
              @mouseover="addressHover = index"
              @mouseleave="addressHover = false"
            >
              <q-card
                flat
                :class="addressHover === index ? 'grey-1 text-black' : ''"
                bordered
                class="fit cursor-pointer"
                @click.native="setSelectedAddress(index)"
              >
                <q-item :class="{ 'bg-primary-darkened text-white': isSelectedIndex(index) }">
                  <q-item-section avatar>
                    <q-icon :name="isSelectedIndex(index) ? 'check' : 'place'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ address.title }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-card-section style="min-height: 150px;">
                  <p v-html="getAddressString(address, true)" />
                </q-card-section>
                <q-separator v-if="address.isCustom" />
                <q-card-actions v-if="address.isCustom" align="right">
                  <q-btn icon="edit" dense outline @click="setSelectedAddress(index)" />
                  <q-btn icon="delete_forever" dense color="negative" @click="removeAddress(index)" />
                </q-card-actions>
              </q-card>
            </div>
            <div v-if="!isCustomAddressExist" class="col-12">
              <div class="row justify-start">
                <div class="col-auto">
                  <q-field
                    class="required"
                    :error="$v.localAddressData.recipient_addresses.$error"
                    hide-bottom-space
                    borderless
                  >
                    <template slot="control">
                      <q-btn
                        rounded
                        unelevated
                        color="positive"
                        icon="add"
                        label="Add new address"
                        @click="manipulateAddress({ newAddress: true })"
                      />
                    </template>
                  </q-field>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-12">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <div class="row q-col-gutter-sm">
                <div v-if="showNameField" class="col-12">
                  <q-input
                    v-model="localAddressData.recipient_name"
                    :class="{ required: !skipValidation }"
                    dense
                    outlined
                    :label="recipientNameLabel"
                    :error="$v.localAddressData.recipient_name.$error"
                    hide-bottom-space
                    clearable
                  />
                </div>
                <div v-if="showEmailField" class="col-12">
                  <q-input
                    v-model="localAddressData.recipient_email"
                    :class="{ required: !skipValidation }"
                    dense
                    outlined
                    :label="recipientEmailLabel"
                    :error="$v.localAddressData.recipient_email.$error"
                    hide-bottom-space
                    clearable
                  />
                </div>
                <div v-if="showPhoneField" class="col-12">
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-select
                        v-model="localAddressData.recipient_mobile_country_code_id"
                        :class="{ required: !skipValidation }"
                        :label="$t('Common.PhoneCode.Text')"
                        :error="
                          $v.localAddressData.recipient_mobile_country_code_id.$error ||
                            $v.localAddressData.recipient_mobile_phone_number.$error
                        "
                        hide-bottom-space
                        options-dense
                        dense
                        emit-value
                        map-options
                        outlined
                        clearable
                        :options="callCodeOptionsByCountryName"
                      />
                    </div>
                    <div class="col-7">
                      <q-input
                        v-model="localAddressData.recipient_mobile_phone_number"
                        class="required"
                        :label="recipientPhoneNumberLabel"
                        :error="
                          $v.localAddressData.recipient_mobile_country_code_id.$error ||
                            $v.localAddressData.recipient_mobile_phone_number.$error
                        "
                        hide-bottom-space
                        dense
                        outlined
                        clearable
                        :prefix="getCallCode"
                        :disable="localAddressData.recipient_mobile_country_code_id === ''"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12">
              <shipping-address
                v-if="isCustomAddressExist && !readOnly"
                ref="addressArea"
                :address="getEditableAddress"
                :option-filters="getOptionFilters"
                @fieldOnChange="manipulateAddress"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="col-md-auto col-12">
      <q-card flat square>
        <q-card-section>
          <div class="text-overline">{{ readOnlyAddressTitle || $t('Common.ShippedTo.Text') }} :</div>
          <div v-if="showNameField" class="text-h6 q-mt-sm q-mb-xs text-primary-darkened">{{ getRecipientName }}</div>
          <div v-if="showEmailField" class="text-subtitle1 q-mt-sm q-mb-xs text-primary-darkened">
            {{ getRecipientEmail }}
          </div>
          <div v-if="showPhoneField" class="text-subtitle2 q-mt-sm q-mb-xs text-primary">
            {{ getCallCode }}{{ getMobilePhoneNumber }}
          </div>
          <div class="text-caption" v-html="getAddressString(localAddressData.recipient_addresses, true)"></div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script>
import addressMixinNew from 'src/application/global/mixins/addressMixinNew'
import shippingMethodsCommonMixin from 'src/application/global/mixins/shippingMethodsCommonMixin'
import ShippingAddress from './ShippingAddress'
import { minLength, required, requiredIf, email } from 'vuelidate/lib/validators'
import _ from 'lodash'

let emptyAddress = {
  title: 'Custom Address',
  isCustom: true,
  fields: [],
}

export default {
  name: 'ShippingMethodDelivery',
  components: {
    ShippingAddress,
  },
  mixins: [addressMixinNew, shippingMethodsCommonMixin],
  validations: {
    localAddressData: {
      recipient_name: {
        required: requiredIf(function() {
          return this.showNameField
        }),
      },
      recipient_email: {
        required: requiredIf(function() {
          return this.showEmailField
        }),
        email,
      },
      recipient_mobile_country_code_id: {
        required: requiredIf(function() {
          return this.showPhoneField
        }),
      },
      recipient_mobile_phone_number: {
        required: requiredIf(function() {
          return this.showPhoneField
        }),
      },
      recipient_addresses: {
        required,
        minLength: minLength(1),
      },
    },
  },
  data: () => ({
    localMemberAddresses: [],
    addressHover: false,
  }),
  watch: {
    memberAddresses: {
      async handler(to) {
        await this.buildAddresses(to)
      },
      deep: true,
    },
    async commonInit() {
      await this.buildAddresses(this.memberAddresses)
    },
  },
  computed: {
    getEditableAddress() {
      let address = this.$helpers.getValue(this.getSelectableAddress, `[${this.getSelectedIndex}]`, emptyAddress)
      if (address && address.isCustom) {
        return address
      }
      return false
    },
    getSelectedIndex() {
      return this.localAddressData.recipient_selected_shipping_index
    },
    getSelectableAddress() {
      let addresses = this.getValidAddresses(this.localMemberAddresses)
      if (addresses.length > 0) {
        return addresses.map(address => {
          if (this.filterCrossBorderCountries.length > 0) {
            let addressCountryId = this.getSelectedAddressCountryId(address)
            if (!this.filterCrossBorderCountries.includes(addressCountryId)) {
              address.exclude = true
            }
          }
          if (address.fields) {
            address.fields = this.sortDynamicFieldsCountryStateCityTop(address.fields)
          }
          return address
        })
      }
      return []
    },
    isCustomAddressExist() {
      let exist = this.getSelectableAddress.filter(address => {
        return !address.exclude && address.title === 'Custom Address'
      })
      return exist.length > 0
    },
    getOptionFilters() {
      return {
        countries: this.filterCrossBorderCountries,
      }
    },
    filterCrossBorderCountries() {
      // Enable cross country delivery based on component
      if (this.enableCrossCountry) {
        let filteredCountriesIDs = [this.countryId]
        this.crossBorderDeliveryCountriesByCountry.forEach(x => {
          filteredCountriesIDs.push(x.value)
        })
        if (filteredCountriesIDs.length > 0) {
          return filteredCountriesIDs
        }
      }
      return []
    },
  },
  methods: {
    async buildAddresses(initAddresses) {
      let selectedAddressExistIndex = false
      let addresses = _.cloneDeep(initAddresses)
      this.localMemberAddresses = []

      // Process addresses
      if (
        this.localAddressData.recipient_addresses !== '' &&
        typeof this.localAddressData.recipient_addresses === 'string'
      ) {
        this.localAddressData.recipient_addresses = JSON.parse(this.localAddressData.recipient_addresses)
      }
      // If recipient address empty dont compare
      if (
        Array.isArray(this.localAddressData.recipient_addresses) &&
        this.localAddressData.recipient_addresses.length > 0
      ) {
        await addresses.forEach((address, index) => {
          let userSelectedAddressString = this.getAddressString(this.localAddressData.recipient_addresses[0])
          if (userSelectedAddressString === this.getAddressString(address)) {
            selectedAddressExistIndex = index
          }
        })
        if (selectedAddressExistIndex !== false) {
          this.localAddressData.recipient_selected_shipping_index = selectedAddressExistIndex
        } else {
          if (this.localAddressData.recipient_addresses.length > 0) {
            let customAddress = this.localAddressData.recipient_addresses[0]
            customAddress.title = 'Custom Address'
            customAddress.isCustom = true

            // Insert as custom address
            this.localAddressData.recipient_selected_shipping_index = addresses.push(customAddress) - 1
          }
        }
      }
      // Initialize addresses dropdown options
      if (addresses.length > 0) {
        addresses = await this.initializeAddresses(addresses)
        this.localMemberAddresses = [...this.localMemberAddresses, ...addresses]
        let selectableAddressesLength = this.getSelectableAddress.filter(x => !x.exclude).length
        if (selectableAddressesLength > 0 && !this.localAddressData.recipient_selected_shipping_index) {
          this.setSelectedAddress(0)
        }
      }
    },
    isSelectedIndex(index) {
      return this.localAddressData.recipient_selected_shipping_index === index
    },
    setSelectedAddress(index) {
      let address = this.$helpers.getValue(this.localMemberAddresses, `[${index}]`)
      if (address) {
        this.$set(this.localAddressData, 'recipient_addresses', [address])
        this.$set(this.localAddressData, 'recipient_selected_shipping_index', index)
      }
    },
    removeAddress(index) {
      this.localMemberAddresses.splice(index, 1)
      let eligibleIndex = this.localMemberAddresses.findIndex(x => x.exclude === false)
      if (eligibleIndex !== -1 && this.localAddressData.recipient_selected_shipping_index === index) {
        this.localAddressData.recipient_addresses = []
        this.setSelectedAddress(eligibleIndex)
      } else if (eligibleIndex === -1) {
        this.localAddressData.recipient_addresses = []
      }
    },
    async manipulateAddress(payload) {
      let { address, key, value, newAddress } = payload
      if (newAddress) {
        this.setSelectedAddress(
          this.localMemberAddresses.push(await this.setAddressFormat(_.cloneDeep(emptyAddress), this.countryId)) - 1
        )
      } else {
        if (key === 'countries') {
          if (value) {
            this.localMemberAddresses[
              this.localAddressData.recipient_selected_shipping_index
            ] = await this.setAddressFormat(address, value)
          }
        } else if (key === 'states') {
          await this.setCities(value)
        }
      }
    },
    async validate() {
      if (this.skipValidation) {
        return false
      }
      // Validating parent and child component
      this.$v.$touch()
      let validationPromise = []
      if (this.$refs.addressArea) {
        validationPromise.push(this.$refs.addressArea.validate())
      }
      return await Promise.all(validationPromise).then(validation => {
        return validation.indexOf(true) !== -1 || this.$v.$error
      })
    },
  },
}
</script>
