<template>
  <form @keydown="clearFormFieldValidation($event.target.name)">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <q-input
          v-model="card.card_holder_name"
          class="required"
          :label="$t('Common.CardHolderName.Text')"
          dense
          outlined
          :error="$v.card.card_holder_name.$error"
          hide-bottom-space
        />
      </div>
      <div class="col-12">
        <q-input
          v-model="card.card_number"
          class="required"
          :label="$t('Common.CardNumber.Text')"
          dense
          outlined
          mask="#### #### #### ####"
          unmasked-value
          :error="$v.card.card_number.$error || setError('card_number', 'type.exp')"
          :error-message="setError('card_number', 'type.msg')"
          hide-bottom-space
        />
      </div>
      <div class="col-12">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-md-4 col-12">
            <q-select
              v-model="expired_month"
              class="required"
              :error="$v.expired_month.$error"
              :label="$t('Common.CardExpiryMonth.Text')"
              options-dense
              dense
              emit-value
              map-options
              outlined
              clearable
              :options="monthList"
              hide-bottom-space
              @input="generateExpiredDate"
            />
          </div>
          <div class="col-auto gt-sm">/</div>
          <div class="col-md-4 col-12">
            <q-select
              v-model="expired_year"
              class="required"
              :error="$v.expired_year.$error"
              options-dense
              dense
              emit-value
              map-options
              outlined
              clearable
              :label="$t('Common.CardExpiryYear.Text')"
              :options="yearList"
              hide-bottom-space
              @input="generateExpiredDate"
            />
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { SetFormFieldErrorsMixin } from 'src/application/global/mixins/index'
import { required, numeric } from 'vuelidate/lib/validators'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'AddNewCard',
  mixins: [SetFormFieldErrorsMixin],
  props: {
    title: { type: String },
    subtitle: { type: String },
    cardInfo: {
      type: [Object, Boolean],
      default: false,
    },
  },
  data() {
    return {
      card: {
        issue_bank_info: '',
        card_type: '',
        card_holder_name: '',
        card_number: '',
        card_expiry: '',
      },
      expired_month: null,
      expired_year: null,
      cardList: [
        { value: 'VISA', text: 'Visa' },
        { value: 'MASTER', text: 'Master' },
      ],
    }
  },
  validations: {
    card: {
      card_holder_name: { required },
      card_number: { required, numeric },
      card_expiry: { required },
    },
    expired_month: { required },
    expired_year: { required },
  },
  computed: {
    monthList() {
      let list = []
      for (let i = 1; i <= 12; i++) {
        let data = i.toString().padStart(2, '0')
        list.push({ value: data, label: data })
      }
      return list
    },
    yearList() {
      let list = []
      for (let i = 0; i < 10; i++) {
        let data = moment()
          .add(i, 'year')
          .format('YY')
        list.push({ value: data, label: data })
      }
      return list
    },
  },
  watch: {
    cardInfo: {
      handler() {
        if (this.cardInfo) {
          let reassignExpDate = this.cardInfo.card_expiry.split('/')
          this.expired_month = reassignExpDate[0]
          this.expired_year = reassignExpDate[1]
          this.card = _.cloneDeep(this.cardInfo)
        }
      },
      deep: true,
      immediate: true,
    },
    card: {
      handler(val) {
        this.$emit('input', val)
      },
      deep: true,
    },
  },
  methods: {
    generateExpiredDate() {
      if (this.expired_month !== '' && this.expired_year !== '') {
        this.card.card_expiry = [this.expired_month, this.expired_year].join('/')
      }
    },
  },
}
</script>
