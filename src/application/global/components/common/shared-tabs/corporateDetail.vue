<template>
  <div class="information-tab">
    <div class="row q-col-gutter-sm">
      <div class="col-md-6">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <info :message="$t('Common.CompanyDetails.Text')"></info>
          </div>
          <div class="col-12">
            <q-input
              v-model="salesData.corporate_sales.company_name"
              class="required"
              hide-bottom-space
              dense
              outlined
              :label="$t('sales.salesOrder.corporateSales.companyName')"
              :error="validations.corporate_sales.company_name.$error"
              :error-message="$t('sales.salesOrder.corporateSales.companyName.errorLabel')"
              :disable="lockSalesOrder"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="salesData.corporate_sales.company_reg_number"
              class="required"
              hide-bottom-space
              dense
              outlined
              :label="$t('sales.salesOrder.corporateSales.company_reg_number')"
              :error="validations.corporate_sales.company_reg_number.$error"
              :error-message="$t('sales.salesOrder.corporateSales.company_reg_number.errorLabel')"
              :disable="lockSalesOrder"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="salesData.corporate_sales.company_email"
              class="required"
              hide-bottom-space
              dense
              outlined
              :label="$t('sales.salesOrder.corporateSales.company_email')"
              :error="validations.corporate_sales.company_email.$error"
              :error-message="$t('sales.salesOrder.corporateSales.company_email.errorLabel')"
              :disable="lockSalesOrder"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="salesData.corporate_sales.person_in_charge"
              class="required"
              hide-bottom-space
              dense
              outlined
              :label="$t('sales.salesOrder.corporateSales.personInCharge')"
              :error="validations.corporate_sales.person_in_charge.$error"
              :error-message="$t('sales.salesOrder.corporateSales.personInCharge.errorLabel')"
              :disable="lockSalesOrder"
            />
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-select
                  v-model="salesData.corporate_sales.contact_country_code_id"
                  class="required"
                  :label="$t('Common.CountryCode.Text')"
                  :error="
                    validations.corporate_sales.contact_country_code_id.$error ||
                      validations.corporate_sales.contact_number.$error
                  "
                  hide-bottom-space
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  clearable
                  :disable="lockSalesOrder"
                  :options="callCodeOptionsByCountry"
                />
              </div>
              <div class="col-8">
                <q-input
                  v-model="salesData.corporate_sales.contact_number"
                  class="required"
                  :label="$t('members.information.mobile1')"
                  :error="
                    validations.corporate_sales.contact_country_code_id.$error ||
                      validations.corporate_sales.contact_number.$error
                  "
                  hide-bottom-space
                  dense
                  outlined
                  :disable="lockSalesOrder || salesData.corporate_sales.contact_country_code_id === ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="addresses.length > 0" class="col-md-6">
        <!--address here-->
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <info :message="$t('Common.CompanyAddress.Text')"></info>
          </div>
          <div
            v-for="(field, index2) in sortDynamicFields(addresses[0].fields)"
            :key="field.label"
            class="dynamic-field col-12"
          >
            <q-input
              v-if="field.type === 'input'"
              v-model.trim="addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value"
              class="required"
              hide-bottom-space
              dense
              outlined
              :label="field.label"
              :error="
                field.required
                  ? $v.addresses.$each[0].fields.$each[setDynamicFieldIndex(addresses[0].fields, field.index)].value
                      .$invalid
                  : false
              "
              :error-message="field.helper !== '' ? field.helper : 'Required Field'"
              :disable="lockSalesOrder"
              clearable
              @input="addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value.$touch"
            />
            <q-select
              v-if="
                lockSalesOrder ||
                  field.type === 'select' ||
                  (field.type === 'custom-select' && field.type !== 'masters-select')
              "
              v-model="addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value"
              class="required"
              :label="field.label"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :disable="
                lockSalesOrder ||
                  field.key === 'countries' ||
                  (setDynamicFieldKeyOptionsData(field.key, field.identifier, 0, index2).length < 1 &&
                    field.type !== 'custom-select')
              "
              :error="
                field.required
                  ? $v.addresses.$each[0].fields.$each[setDynamicFieldIndex(addresses[0].fields, field.index)].value
                      .$invalid
                  : false
              "
              :error-message="field.helper !== '' ? field.helper : 'Required Field'"
              clearable
              :options="
                field.options ? field.options : setDynamicFieldKeyOptionsData(field.key, field.identifier, 0, index2)
              "
              @input="
                field.trigger === 'cities'
                  ? setCities(
                      addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value,
                      0,
                      index2
                    )
                  : '',
                  field.required
                    ? addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value.$touch
                    : false
              "
            />
            <q-select
              v-if="field.type === 'masters-select'"
              v-model="addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value"
              class="required"
              :error="
                field.required
                  ? $v.addresses.$each[0].fields.$each[setDynamicFieldIndex(addresses[0].fields, field.index)].value
                      .$invalid
                  : false
              "
              :error-message="field.helper !== '' ? field.helper : 'Required Field'"
              :label="field.label"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :disable="lockSalesOrder"
              clearable
              :options="
                field.options ? field.options : setDynamicFieldKeyOptionsData(field.key, field.identifier, 0, index2)
              "
              @input="addresses[0].fields[setDynamicFieldIndex(addresses[0].fields, field.index)].value.$touch"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import trans from 'src/application/global/components/common/transition/transition'
import { AddressMixin, MasterDataTransformarMixin } from 'src/application/global/mixins/index'
import { Dialog } from 'quasar'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'CooperateDetail',
  components: {
    trans,
  },
  mixins: [MasterDataTransformarMixin, AddressMixin],
  props: {
    salesData: {
      type: Object,
      required: true,
    },
    validations: {
      type: Object,
      required: true,
    },
    lockSalesOrder: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({}),
  validations: {
    addresses: {
      $each: {
        fields: {
          $each: {
            value: {
              check(val, elm) {
                if (elm.required || elm.min) {
                  if (elm.value === '' || elm.value === null) {
                    return false
                  }
                  if (typeof elm.min !== 'undefined') {
                    if (val.length < elm.min) {
                      return false
                    }
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
  computed: {
    ...mapGetters(['callCodeOptionsByCountry']),
    ...mapState({
      countriesOptions: state => state.globalCMP.countriesOptions.data,
      languageOptions: state => state.globalCMP.languagesOptions.data,
      appSettings: state => state.globalCMP.appSettings,
      done: state => state.globalCMP.done,
    }),
  },
  mounted() {
    this.addresses = this.salesData.corporate_sales.company_address
    this.selectedCountry = this.salesData.country_id
    this.selectedAddress = 0
    this.setCountrySelectionOnSelectedAddress()
    this.getLanguagesAction()
  },
  methods: {
    ...mapActions(['getLanguagesAction']),
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
        let trashUID = this.pushTrashData('member-address', this.addresses[index].fields)
        this.setCountrySelectionOnSelectedAddress()
        this.selectedCountry = ''
        this.addresses[index].fields = []
        this.$q.notify({
          message: 'The item has been moved to the Bin',
          icon: 'warning',
          timeout: this.appSettings.notifications.timeout,
          position: 'bottom-left',
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
                  icon: 'warning',
                  color: 'black',
                  timeout: this.appSettings.notifications.timeout,
                  position: 'bottom-left',
                })
              },
            },
          ],
        })
      })
    },
  },
}
</script>
