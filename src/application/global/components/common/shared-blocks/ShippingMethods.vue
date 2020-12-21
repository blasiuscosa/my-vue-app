<template>
  <div class="shipping-area">
    <div class="row justify-start">
      <div v-if="readOnly" class="col-12">
        <info :message="$t('Common.SelectedShippingMethod.Text', { method: getDeliveryMethodString })" />
      </div>
      <div v-else class="col-12">
        <q-field class="required" :error="$v.localAddressData.sale_delivery_method.$error" hide-bottom-space borderless>
          <template slot="control">
            <div class="row q-col-gutter-sm items-center">
              <div v-if="filterShippingMethods.length > 0" class="col-auto">
                <q-option-group
                  v-model="localAddressData.sale_delivery_method"
                  inline
                  type="radio"
                  :options="filterShippingMethods"
                />
              </div>
              <div class="col-auto">
                <q-btn color="primary" flat icon="info">
                  <q-tooltip :offset="[5, 5]">
                    <div v-for="info in shippingMethodInfoOptions" class="info">
                      {{ info.label }}
                    </div>
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12">
        <shipping-method-delivery
          v-if="shippingDeliveryID === localAddressData.sale_delivery_method"
          ref="shippingMethodDelivery"
          v-model="localAddressData"
          :member-addresses="memberAddresses"
          :country-id="countryId"
          :enable-cross-country="enableCrossCountry"
          :read-only="readOnly"
        />
        <shipping-method-self-collection
          v-if="shippingSelfPickupID === localAddressData.sale_delivery_method && !disableCollectionPointSelection"
          ref="shippingMethodSelfCollection"
          v-model="localAddressData"
          :country-id="countryId"
          :transaction-location-id="transactionLocationId"
          :read-only="readOnly"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ShippingMethodDelivery from './ShippingMethodDelivery'
import ShippingMethodSelfCollection from './ShippingMethodSelfCollection'
import shippingMethodsCommonMixin from 'src/application/global/mixins/shippingMethodsCommonMixin'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'ShippingMethods',
  components: {
    ShippingMethodSelfCollection,
    ShippingMethodDelivery,
  },
  mixins: [shippingMethodsCommonMixin],
  props: {
    forceIncludeShippingMethods: {
      type: Array,
      default: () => [],
    },
  },
  validations: {
    localAddressData: {
      sale_delivery_method: {
        required,
      },
    },
  },
  data: () => ({
    shippingData: {},
    shippingSelfCollectionData: {},
  }),
  computed: {
    filterShippingMethods() {
      let filter = this.availableShippingOptions.filter(x => this.deliveryMethodEnabler(x.value))
      filter = [...this.forceIncludeShippingMethods, ...filter]
      return _.uniqBy(filter, 'label')
    },
  },
  watch: {
    filterShippingMethods: {
      async handler(to) {
        let exist = to.find(x => x.value === this.localAddressData.sale_delivery_method)
        if (!exist) {
          if (to.length > 0) {
            this.localAddressData.sale_delivery_method = to[0].value
          }
        }
      },
    },
  },
  async mounted() {
    if (this.triggerValidation) {
      await this.validate()
    }
  },
  methods: {
    deliveryMethodEnabler(value) {
      if (this.shippingDeliveryID === value) {
        if (this.removeSelfPickup) {
          return false
        }
      } else if (this.shippingSelfPickupID === value) {
        if (this.removeDelivery) {
          return false
        }
      } else if (this.shippingWithoutShippingID === value) {
        if (this.removeWithoutShipping) {
          return false
        }
      }
      return true
    },
    async validate() {
      // Validating parent and child component
      this.$v.$touch()
      let validationPromise = []
      if (this.$refs.shippingMethodDelivery) {
        validationPromise.push(this.$refs.shippingMethodDelivery.validate())
      }
      if (this.$refs.shippingMethodSelfCollection) {
        validationPromise.push(this.$refs.shippingMethodSelfCollection.validate())
      }
      return await Promise.all(validationPromise).then(validation => {
        return validation.indexOf(true) !== -1 || this.$v.$error
      })
    },
  },
}
</script>
