<template>
  <div class="payment-tab">
    <div class="row q-col-gutter-sm">
      <div class="col-md-12 col-12">
        <div class="row justify-between items-center q-col-gutter-sm">
          <div class="col-md-auto col-12">
            <q-btn-dropdown
              icon="add"
              color="primary-darkened"
              outline
              rounded
              unelevated
              class="fit"
              :label="$t('Common.payment.label.addPayment')"
              :disable="balance <= 0 || paymentData.selected.payments.unpaid.length === 1 || lockPayment"
              auto-close
            >
              <div
                v-for="(level1, level1Key) in paymentOptions"
                v-if="level1.payment_mode_provider.length > 0"
                :key="`level1-${level1Key}`"
                class="col q-col-gutter-sm q-pa-sm"
              >
                <div class="col-12 text-overline text-weight-bolder">
                  {{ level1.title }}
                </div>
                <div
                  v-for="(level2, level2Key) in level1.payment_mode_provider"
                  :key="`level2-${level2Key}`"
                  class="col-12"
                >
                  <q-btn
                    color="primary-darkened"
                    rounded
                    unelevated
                    :label="level2.name"
                    @click="
                      addPaymentMode(
                        level2.payment_mode_setting[0].id,
                        level2.name,
                        level2.payment_mode_setting[0].setting_detail[0],
                        level2.payment_mode_setting[0].qr_code
                      )
                    "
                  />
                </div>
              </div>
            </q-btn-dropdown>
          </div>
          <div class="col-md-auto col-12">
            <q-input
              outlined
              dense
              :prefix="currencyLabelByCountry"
              :label="$t('Common.payment.label.balance')"
              :value="balance"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              hide-bottom-space
              square
              filled
              :bg-color="balance > 0 ? 'amber-3' : ''"
              readonly
            ></q-input>
          </div>
        </div>
      </div>
      <!-- TODO refactor paid and unpaid as a single component -->
      <!-- Unpaid List -->
      <div
        v-for="(unpaid, unpaidIndex) in paymentData.selected.payments.unpaid"
        :key="`unpaid-${unpaidIndex}`"
        class="col-md-12 col-12 unpaid-list"
      >
        <q-card flat bordered square>
          <q-card-section>
            <div class="row justify-between items-center q-col-gutter-sm">
              <div class="col-md-12 col-12">
                <div class="row items-center justify-between">
                  <div class="col-md-auto">
                    <div class="text-h6">
                      {{ unpaid.payment_mode_name }}
                    </div>
                  </div>
                  <div class="col-md-auto">
                    <q-btn size="md" rounded unelevated color="negative" @click="removePaymentMode(unpaidIndex)">
                      <q-icon name="delete_outline" />
                    </q-btn>
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-12">
                <div class="col q-col-gutter-sm">
                  <div v-for="(field, fieldIndex) in unpaid.fields" v-if="unpaid.fields.length !== 0" :key="fieldIndex">
                    <!--Todo remove field.type === link from form temp only-->
                    <q-input
                      v-if="field.type === 'field'"
                      v-model.trim="
                        field.autofill !== undefined && unpaid.fields[fieldIndex].value === ''
                          ? getAutoFill(field.autofill, unpaidIndex, fieldIndex)
                          : unpaid.fields[fieldIndex].value
                      "
                      dense
                      outlined
                      class="dynamic-fields"
                      :error="
                        $v.paymentData.selected.payments.unpaid.$each[unpaidIndex].fields.$each[fieldIndex].value
                          .$invalid
                      "
                      clearable
                      :type="field.password === undefined && !field.password ? 'text' : 'password'"
                      :readonly="isSinglePaymentMethod && field.name === 'amount'"
                      :label="field.text"
                      hide-bottom-space
                      @keydown="
                        $v.paymentData.selected.payments.unpaid.$each[unpaidIndex].fields.$each[fieldIndex].value.$touch
                      "
                      @input="doCalculation()"
                    />
                    <q-select
                      v-if="field.type === 'dropdown'"
                      v-model="unpaid.fields[fieldIndex].value"
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      clearable
                      :label="field.text"
                      :options="
                        field.inherit
                          ? getInheritDataOptions(field.inherit)
                          : keyValueObjectToOptionsGenerator(field.data)
                      "
                      hide-bottom-space
                      @input="
                        field.inherit_data
                          ? setInheritData(field.name, field.inherit_data, field.value, unpaidIndex)
                          : ''
                      "
                      @keydown="
                        $v.paymentData.selected.payments.unpaid.$each[unpaidIndex].fields.$each[fieldIndex].value.$touch
                      "
                    />
                  </div>
                  <div v-else class="col-md-auto">
                    <div class="text-caption text-muted text-negative">
                      {{ $t('Common.payment.errorMessage.paymentUnavailable') }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12 col-12">
                <div class="row justify-end q-col-gutter-xs items-center">
                  <div v-if="unpaid.qr_code === 1" class="col-md-auto col-12">
                    <q-btn
                      v-if="sharedButton === true"
                      :label="$t('Common.GetQrCode.Button')"
                      color="positive"
                      rounded
                      unelevated
                      class="fit"
                      @click="makePayment(unpaidIndex, true)"
                    />
                  </div>
                  <div v-if="unpaid.qr_code === 1 && sharedButton === true" class="col-md-auto col-12 text-center">
                    -- {{ $t('Common.OR.Text') }} --
                  </div>
                  <div class="col-md-auto col-12">
                    <q-btn
                      :label="$t('Common.MakePayment.Button')"
                      color="positive"
                      rounded
                      unelevated
                      class="fit"
                      @click="makePayment(unpaidIndex)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <!-- Paid List -->
      <div
        v-for="(paid, paidIndex) in paymentData.selected.payments.paid"
        :key="`paid-${paidIndex}`"
        class="col-md-12 col-12 paid-list"
      >
        <q-card square flat bordered>
          <q-card-section>
            <div class="row justify-end items-center q-col-gutter-sm">
              <div class="col-md-12 col-12">
                <div class="row items-center justify-between q-col-gutter-sm">
                  <div class="col-md-auto">
                    <div class="text-h6">
                      {{ paid.payment_mode_provider.name }}
                    </div>
                  </div>
                  <div v-if="paid.is_approve !== undefined && paid.is_approve" class="col-md-auto">
                    <q-chip
                      square
                      text-color="white"
                      :color="
                        paid.status === 1
                          ? 'positive'
                          : paid.status === 0
                          ? 'negative'
                          : paid.status > 1
                          ? 'warning'
                          : 'grey-8'
                      "
                    >
                      {{
                        paid.status === 1
                          ? $t('Common.payment.label.paymentApproved')
                          : paid.status === 0
                          ? $t('Common.payment.label.paymentRejected')
                          : paid.status > 1
                          ? $t('Common.payment.label.paymentPending')
                          : $t('Common.payment.label.paymentUnknown')
                      }}
                    </q-chip>
                  </div>
                  <div v-else class="col-md-auto">
                    <q-chip
                      square
                      text-color="white"
                      :color="
                        paid.status === 1
                          ? 'positive'
                          : paid.status === 0
                          ? 'negative'
                          : paid.status > 1
                          ? 'warning'
                          : 'grey-8'
                      "
                    >
                      {{
                        paid.status === 1
                          ? $t('Common.payment.label.paymentPaid')
                          : paid.status === 0
                          ? $t('Common.payment.label.paymentFailed')
                          : paid.status > 1
                          ? $t('Common.payment.label.paymentPending')
                          : $t('Common.payment.label.paymentUnknown')
                      }}
                    </q-chip>
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-12">
                <div class="col justify-end q-col-gutter-sm">
                  <div
                    v-for="(field, fieldIndex) in decodeJSON(paid.payment_detail).fields.sort(
                      (a, b) => a.order > b.order
                    )"
                    v-if="field.type === 'field'"
                    :key="fieldIndex"
                  >
                    <!--Todo remove field.type === link from form temp only-->
                    <q-input
                      v-if="field.type !== 'link'"
                      v-model="field.value"
                      hide-bottom-space
                      dense
                      outlined
                      clearable
                      :type="field.password === undefined && !field.password ? 'text' : 'password'"
                      :label="field.text"
                      readonly
                    />
                    <q-select
                      v-if="field.type === 'dropdown'"
                      v-model="field.value"
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      clearable
                      :label="field.text"
                      readonly
                      :options="keyValueObjectToOptionsGenerator(field.data)"
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-12 col-12">
                <div class="col items-baseline justify-end text-right">
                  <div class="col-md-auto col-12 text-overline text-grey-5 text-right">
                    {{ paid.created_at }} <br />[ {{ humanizeDateTime(paid.created_at) }} ]
                  </div>
                  <div v-if="paid.is_qr === 1" class="col-md-auto">
                    <q-btn
                      :label="$t('Common.ShowQrCode.Button')"
                      rounded
                      unelevated
                      color="primary-darkened"
                      @click="showQrCodeModal(null, paid.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <layout-modal
        refs="qrCodeModal"
        :title="$t('Common.QrCode.Title')"
        :sub-title="$t('Common.QrCode.Text')"
        :shadow="false"
        :auto-width="true"
        :before-close-action="closeQrCodeModal"
        :footer-button-one="$t('Common.CopyLink.Button')"
        :footer-button-one-action="copyLink"
        :footer-button-one-action-modal-persistent="true"
        :footer-button-two="$t('Common.Close.Btn')"
        :header-search-bar="false"
        :no-esc-dismiss="true"
        classes="transparent text-black"
      >
        <template slot="modal-data" slot-scope="props">
          <div class="row justify-center items-center">
            <img class="col-sm-auto col-md-8" :src="qrCodeImage" alt="qr-image" />
          </div>
        </template>
      </layout-modal>
      <errors-modal refs="errorsModal" />
    </div>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList.vue'
import { DatesMixin, GeneralsMixin, LinkCopyMixin } from 'src/application/global/mixins/index'
import layoutModal from 'src/application/global/components/common/modal/layoutModal'
import errorsModal from 'src/application/global/components/common/modal/errorsModal'
import { Dialog } from 'quasar'
import { between, required } from 'vuelidate/lib/validators'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { formatPrice } from 'src/helpers/filters'
import { calculateUnpaidBalance } from 'src/utils/payments/calculation'
import _ from 'lodash'

export default {
  name: 'SalesPaymentTab',
  components: {
    EmptyList,
    layoutModal,
    errorsModal,
  },
  mixins: [GeneralsMixin, DatesMixin, LinkCopyMixin],
  props: {
    paymentData: {
      type: Object,
      required: true,
    },
    totalPayableAmount: {
      type: [String, Number],
      required: true,
    },
    processForm: {
      type: Function,
      required: true,
    },
    callback: {
      type: Function,
    },
    lock: {
      type: Boolean,
      default: false,
    },
    lockPayment: {
      type: Boolean,
      default: false,
    },
    tabChanger: {
      type: Object,
      default: () => ({
        emiter: '',
        to: '',
        from: '',
        current: '',
      }),
    },
    makePaymentData: {
      type: Object,
      default: () => ({
        pay_type: 'sales',
        consignment_deposit_id: null,
      }),
    },
    popupDialog: {
      type: Object,
      default: () => ({
        show: false,
        title: '',
        message: '',
        noEscDismiss: '',
        position: '',
        okBtnText: 'Yes',
        cancelBtnText: 'No',
      }),
    },
    excludePaymentMode: {
      type: Array,
      default: () => [],
    },
    excludePaymentModeProvider: {
      type: Array,
      default: () => [],
    },
    isSinglePaymentMethod: {
      type: Boolean,
      default: false,
    },
    autoFillData: {
      type: Object,
      default: () => {},
    },
    userID: {
      type: [Number, String],
      default: null,
    },
    isEnrolmentSales: {
      type: Boolean,
      default: false,
    },
    isLocationsEmpty: {
      type: Boolean,
      default: false,
    },
    isValidPayLater: {
      type: [Boolean, Number],
      default: false,
    },
    isRequiresUpdate: {
      type: Boolean,
      default: false,
    },
    isHasPendingPayment: {
      type: Boolean,
      default: false,
    },
    skipProcessFormValidation: {
      type: Boolean,
      default: false,
    },
    skipProcessForm: {
      type: Boolean,
      default: false,
    },
    // This is for button for Share Payment LINK/QR
    sharedButton: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState({
      masterData: state => state.globalCMP.masterData.data.list,
      paymentOptions: state => state.salesCMP.paymentOptions.list,
    }),
    ...mapGetters(['currencyLabelByCountry']),
    getSaleId() {
      return this.$helpers.getValue(this.paymentData, 'sale_id')
    },
  },
  validations() {
    let def = {
      paymentData: {
        selected: {
          payments: {
            unpaid: {},
          },
        },
      },
    }
    if (
      this.paymentData !== undefined &&
      this.paymentData.selected.payments.unpaid !== undefined &&
      this.paymentData.selected.payments.unpaid.length > 0
    ) {
      def.paymentData.selected.payments.unpaid = {
        required,
        $each: {
          fields: {
            $each: {
              value: {
                required,
                between(value, elm) {
                  if (elm.name === 'amount') {
                    let balance = 0
                    let paid = this.paymentData.selected.payments.paid
                    let paidTotal = 0.0
                    paid.forEach(paidItem => {
                      if (paidItem.status >= 1) {
                        paidTotal += parseFloat(paidItem.amount)
                      }
                    })
                    balance = this.totalPayableAmount - paidTotal
                    return between(0.01, formatPrice(balance))(value)
                  } else {
                    return true
                  }
                },
              },
            },
          },
        },
      }
    }
    return def
  },
  data: () => ({
    selected_payment_mode_id: '',
    balance: 0.0,
    paymentModeID: 0,
    paymentModeName: '',
    total: 0,
    inheritDataOptions: [],
    qrCodeImage: '',
    qrCodeLink: '',
    getQrCodeImageOnly: false,
    isMounting: false,
  }),
  async mounted() {
    this.isMounting = true
    try {
      await this.initSetupArea()
      // eslint-disable-next-line no-empty
    } catch {}
    this.isMounting = false
  },
  // Special case if tab using keep-alive
  async activated() {
    if (!this.isMounting) {
      try {
        await this.initSetupArea()
        // eslint-disable-next-line no-empty
      } catch {}
    }
  },
  methods: {
    ...mapActions(['getPaymentModesAction', 'makePaymentAction', 'getPaymentQRCodeAction']),
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
      validationReset: 'VALIDATION_FAILED',
    }),
    async initSetupArea() {
      this.doCalculation()
      if (this.isHasPendingPayment && this.isLocationsEmpty) {
        await new Promise(resolve => {
          this.$q
            .dialog({
              title: this.$t('Sale.Payment.TransactionAndStockLocationRequired.Title'),
              message: this.$t('Sale.Payment.TransactionAndStockLocationRequired.Message'),
              noEscDismiss: true,
              noBackdropDismiss: true,
              html: true,
              position: 'top',
              ok: {
                label: 'Ok',
                color: 'positive',
                rounded: true,
                uneleveted: true,
              },
            })
            .onOk(() => {
              if (this.tabChanger && this.tabChanger.to !== this.tabChanger.current) {
                this.$emit(this.tabChanger.emiter, this.tabChanger.to, true)
              }
              resolve(true)
            })
        })
      } else {
        this.popupDialog.show = !this.lock
        if (this.popupDialog.show === true || this.isRequiresUpdate) {
          await new Promise((resolve, reject) => {
            this.$q
              .dialog({
                title: this.popupDialog.title,
                message: this.popupDialog.message,
                noEscDismiss: this.popupDialog.noEscDismiss ? this.popupDialog.noEscDismiss : true,
                noBackdropDismiss: true,
                html: true,
                position: this.popupDialog.position ? this.popupDialog.position : 'top',
                ok: {
                  label: this.popupDialog.okBtnText ? this.popupDialog.okBtnText : 'Yes',
                  color: 'positive',
                  rounded: true,
                  uneleveted: true,
                },
                cancel: {
                  label: this.popupDialog.cancelBtnText ? this.popupDialog.cancelBtnText : 'No',
                  color: 'negative',
                  rounded: true,
                  uneleveted: true,
                },
              })
              .onOk(async () => {
                await this.createUpdateSaleBeforePayment(this.paymentData, false)
                resolve(true)
              })
              .onCancel(() => {
                if (this.tabChanger) {
                  this.$emit(this.tabChanger.emiter, this.tabChanger.to)
                }
                reject(true)
              })
          })
        } else if (this.isValidPayLater) {
          let skipStatus = !this.isHasPendingPayment
          await this.createUpdateSaleBeforePayment(this.paymentData, false, skipStatus)
        }
        if (this.balance > 0.0) {
          await this.getPaymentModes()
        }
      }
    },
    async createUpdateSaleBeforePayment(data, dialogEnabler = false, skip = false) {
      if (!skip && !this.skipProcessForm) {
        try {
          await this.processForm(data, dialogEnabler, this.skipProcessFormValidation, true)
          if (this.tabChanger) {
            this.$emit(this.tabChanger.emiter, this.tabChanger.current)
          }
        } catch (error) {
          if (this.tabChanger) {
            this.$emit(this.tabChanger.emiter, this.tabChanger.to)
          }
        }
      }
    },
    async getPaymentModes() {
      let query = {
        user_id: this.userID,
        location_id: this.paymentData.location_id || this.paymentData.transaction_location_id,
        country_id: this.paymentData.country_id,
        exclude_payment_mode: this.excludePaymentMode,
        exclude_payment_provider: this.excludePaymentModeProvider,
        is_enrollment: this.isEnrolmentSales,
      }
      if (this.getSaleId) {
        query.sale_id = this.getSaleId
        query.order_total_amount = this.balance
      }
      await this.getPaymentModesAction(query)
    },
    async addPaymentMode(id, name, settings, qrCode) {
      settings = JSON.parse(JSON.stringify(settings))
      if (settings.fields !== undefined && Array.isArray(settings.fields)) {
        settings.fields.sort((a, b) => a.order > b.order)
        // Todo remove once backend includes value
        settings.fields.forEach(x => {
          x.value = ''
          if (x.name === 'amount') {
            x.value = parseFloat(this.balance).toFixed(2)
          }
          // Todo remove field.type === link from form temp only
          if (x.type === 'link') {
            x.value = 'skip'
          }
        })
      }
      let data = {
        ...{
          sale_id: this.paymentData.sale_id,
          qr_code: qrCode,
          payment_mode_id: id,
          payment_mode_name: name,
          fields: settings.fields !== undefined ? settings.fields : [],
        },
        ...this.makePaymentData,
      }
      await this.paymentData.selected.payments.unpaid.push(data)
      this.doCalculation()
    },
    removePaymentMode(index) {
      this.paymentData.selected.payments.unpaid.splice(index, 1)
      this.doCalculation()
    },
    activeSelected(id) {
      if (typeof this.paymentModeID !== 'undefined') {
        return this.paymentModeID === id
      }
      return false
    },
    async makePayment(unpaidIndex, isQrCode = false) {
      let unPaidAmountIndex = this.paymentData.selected.payments.unpaid[unpaidIndex].fields.findIndex(
        x => x.name === 'amount'
      )
      if (unPaidAmountIndex !== -1) {
        this.paymentData.selected.payments.unpaid[unpaidIndex].fields[unPaidAmountIndex].value = formatPrice(
          this.paymentData.selected.payments.unpaid[unpaidIndex].fields[unPaidAmountIndex].value
        )
      }
      if (
        !this.$v.paymentData.selected.payments.unpaid.$error &&
        !this.$v.paymentData.selected.payments.unpaid.$invalid
      ) {
        this.paymentData.selected.payments.unpaid[unpaidIndex]['is_qr'] = isQrCode
        this.makePaymentAction(this.removeFalsyValues(this.paymentData.selected.payments.unpaid[unpaidIndex]))
          .then(async res => {
            let response = res.data
            if (isQrCode) {
              this.showQrCodeModal(response, null)
            } else {
              if (response.next_step !== undefined && response.next_step && response.form_data !== undefined) {
                const form = document.createElement('form')

                let formData = JSON.parse(response.form_data)
                form.setAttribute('method', formData.form_attributes.method) // form method
                form.setAttribute('action', formData.form_attributes.action) // form action url
                form.setAttribute('name', 'sales_payment_form') // form name
                form.setAttribute('id', 'sales_payment_form') // form ID

                // To create input control with javascript
                let inputs = formData.form_inputs
                Object.keys(inputs).forEach(function(key, value) {
                  const inputCtrl = document.createElement('input')
                  inputCtrl.type = 'hidden' // input control type
                  inputCtrl.name = key // input control name
                  inputCtrl.value = inputs[key] // input control value
                  form.appendChild(inputCtrl)
                })
                // To bind created input control with created from
                form.target = 'paymentForm'

                // To bind created form with current document body
                document.body.appendChild(form)
                window.open('', 'paymentForm', 'fullscreen=yes,toolbar=0')
                form.submit()
              }
              this.paymentData.selected.payments.unpaid.splice(unpaidIndex, 1)
              if (response) {
                this.paymentData.selected.payments.paid = [...response.payments]
              }
              if (this.callback) {
                this.callback()
              }
              this.doCalculation()
            }
          })
          .catch(error => {
            if (typeof error.response !== 'undefined' && error.response.status === 422) {
              this.openCloseModal({ name: 'errorsModal', status: true })
            }
          })
      } else {
        Dialog.create({
          title: 'Attention !',
          noBackdropDismiss: true,
          noEscDismiss: true,
          message: this.$t('Common.PaymentValidation.Error.Info'),
        })
      }
    },
    showQrCodeModal(response, paymentId) {
      if (response !== null) {
        this.getQrCodeImageOnly = false
        this.qrCodeImage = response.image
        this.qrCodeLink = response.link
        this.openCloseModal({ name: 'qrCodeModal', status: true })
      } else {
        this.getPaymentQRCodeAction(paymentId).then(res => {
          this.getQrCodeImageOnly = true
          this.qrCodeImage = res.image
          this.qrCodeLink = res.link
          this.openCloseModal({ name: 'qrCodeModal', status: true })
        })
      }
    },
    setInheritData(inheritFieldName, inheritData, value, index) {
      if (this.inheritDataOptions[inheritFieldName] !== undefined) {
        this.inheritDataOptions[inheritFieldName] = {}
      }
      this.inheritDataOptions[inheritFieldName] = inheritData[value]
      let inheritFieldIndex = this.paymentData.selected.payments.unpaid[index].fields.findIndex(
        x => x.inherit !== undefined && x.inherit === inheritFieldName
      )
      if (inheritFieldIndex !== -1) {
        this.paymentData.selected.payments.unpaid[index].fields[inheritFieldIndex].value = ''
      }
    },
    getInheritDataOptions(inheritFieldName) {
      let options = []
      if (this.inheritDataOptions[inheritFieldName] !== undefined) {
        options = this.keyValueObjectToOptionsGenerator(this.inheritDataOptions[inheritFieldName].data)
      }
      return options
    },
    getAutoFill(key, index, fieldIndex) {
      if (this.autoFillData !== undefined || Object.keys(this.autoFillData).length > 0) {
        let value = _.pick(this.autoFillData, key)
        value = value[key]
        if ((value !== undefined && value !== '') || value !== null) {
          this.paymentData.selected.payments.unpaid[index].fields[fieldIndex].value = value
        }
      }
    },
    closeQrCodeModal() {
      if (!this.getQrCodeImageOnly) {
        this.callback()
        this.$emit(this.tabChanger.emiter, this.tabChanger.current)
      }
    },
    doCalculation() {
      this.balance = calculateUnpaidBalance(this.paymentData.selected.payments, this.totalPayableAmount)
    },
  },
}
</script>
