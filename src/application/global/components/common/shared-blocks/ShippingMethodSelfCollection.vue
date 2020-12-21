<template>
  <div class="row q-col-gutter-sm">
    <div class="col-md-3">
      <q-select
        v-model="state"
        class="required"
        options-dense
        dense
        emit-value
        map-options
        outlined
        :error="$v.localAddressData.self_collection_point_id.$error"
        :label="$t('Common.CollectionPoint.Text')"
        hide-bottom-space
        clearable
        :options="states"
        :readonly="readOnly"
        @clear="selectCollectionPoint(null)"
      />
    </div>
    <div class="col-12">
      <div class="row q-col-gutter-sm">
        <div v-for="(address, index) in addresses" :key="`address-${index}`" class="col-md-3 col-12">
          <q-card flat bordered @click.native="selectCollectionPoint(address)">
            <q-item class="bg-primary-darkened text-white">
              <q-item-section avatar>
                <q-icon name="check" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ address.title }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-card-section>
              <p v-html="getAddressString(address, true)" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import addressMixinNew from 'src/application/global/mixins/addressMixinNew'
import shippingMethodsCommonMixin from 'src/application/global/mixins/shippingMethodsCommonMixin'
import { mapActions, mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'ShippingMethodSelfCollection',
  mixins: [addressMixinNew, shippingMethodsCommonMixin],
  validations: {
    localAddressData: {
      self_collection_point_id: {
        required,
      },
    },
  },
  data: () => ({
    state: null,
    states: [],
    selected: null,
    addresses: [],
  }),
  watch: {
    async state() {
      let self = this
      if (!this.$helpers.isEmpty(this.state)) {
        self.selected = null
        let collectionPoints = this.getStockistStatesByCountry({
          countryId: this.countryId,
          id: this.state,
        })
        if (collectionPoints.length > 0) {
          self.selected = collectionPoints[0].id
          self.addresses = _.map(collectionPoints, address => {
            address.title = self.$helpers.getValue(address, 'name')
            address.fields = self.$helpers.getValue(address, 'address_data[0].fields') || []
            return address
          })
          this.selectCollectionPoint(collectionPoints[0])
          await this.initializeAddresses(self.addresses)
        }
      } else {
        self.addresses = []
      }
    },
  },
  computed: {
    ...mapGetters(['getStockistStatesByCountry']),
  },
  async mounted() {
    if (this.countryId) {
      await this.loadStockistStateAndCities(this.countryId)
      this.states = _.orderBy(this.getStockistStatesByCountry({ countryId: this.countryId }), 'label', 'asc')
      if (this.$helpers.isSet(this.localAddressData, 'self_collection_point_id', ['notNull', 'notEmpty'])) {
        this.state = this.localAddressData.self_collection_point_id
      } else {
        if (this.transactionLocationId) {
          let initialCollectionPoint = this.states.find(x => x.location_id === this.transactionLocationId)
          if (initialCollectionPoint) {
            this.state = this.$helpers.getValue(initialCollectionPoint, 'value', null)
          }
        }
      }
      if (this.$helpers.isSet(this.localAddressData, 'self_collection_city_id', ['notNull', 'notEmpty'])) {
        this.selected = this.localAddressData.self_collection_city_id
      }
    }
  },
  methods: {
    ...mapActions(['loadStockistStateAndCities']),
    selectCollectionPoint(collectionPoint) {
      if (collectionPoint === null) {
        this.localAddressData.self_collection_point_id = null
        this.localAddressData.self_collection_city_id = null
      } else {
        this.selected = collectionPoint.id
        this.localAddressData.self_collection_point_id = collectionPoint.value
        this.localAddressData.self_collection_city_id = collectionPoint.id
      }
    },
    async validate() {
      // Validating component
      return await new Promise(resolve => {
        this.$v.$touch()
        resolve(this.$v.$error)
      })
    },
  },
}
</script>
