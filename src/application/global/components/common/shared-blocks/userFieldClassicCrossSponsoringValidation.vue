<template>
  <div class="">
    <span v-if="newMemberIcPassportNo === ''" class="text-red">{{
      $t('CustomValidator.IcPassportCrossSponsoring.Error', { field: $t('members.icPassport.label') })
    }}</span>
    <span
      v-if="
        getExternalApiClassicCrossSponsoringVerificationPass !== null &&
          getExternalApiClassicCrossSponsoringVerificationPass === false
      "
      class="text-red"
    >
      {{ $t('CustomValidator.IcPassportCrossSponsoringValidation.Error', { memberID: sponsorMemberID }) }}
    </span>
    <span v-if="getExternalApiClassicCrossSponsoringVerificationHasApiError" class="text-amber">
      {{ $t('CustomValidator.IcPassportCrossSponsorValidationOffline.Title') }}
    </span>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'UserFieldClassicCrossSponsoringValidation',
  props: {
    newMemberIcPassportNo: {
      type: [String, Number],
      required: true,
    },
    sponsorIcPassportNo: {
      type: [String, Number],
      required: true,
    },
    sponsorMemberID: {
      type: [String, Number],
      required: true,
    },
    validation: {
      type: Object,
    },
    validationMessage: {
      type: String,
    },
    disableField: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    newMemberIcPassportNo() {
      this.checkServerValidation()
    },
    sponsorIcPassportNo() {
      this.checkServerValidation()
    },
  },
  computed: {
    ...mapGetters([
      'getExternalApiClassicCrossSponsoringVerificationPass',
      'getExternalApiClassicCrossSponsoringVerificationHasApiError',
    ]),
    ...mapState({
      isProcessingValidation: state => state.globalCMP.isProcessingValidation,
    }),
  },
  methods: {
    ...mapActions(['userFieldClassicCrossSponsoringCheck']),
    ...mapMutations({
      resetUserFieldValidations: 'RESET_USER_FIELD_VALIDATIONS',
    }),
    checkServerValidation() {
      if (this.sponsorIcPassportNo !== '') {
        this.userFieldClassicCrossSponsoringCheck({
          downline_ic_passport_number: this.newMemberIcPassportNo,
          sponsor_ic_passport_number: this.sponsorIcPassportNo,
        })
      }
    },
  },
  beforeDestroy() {
    this.resetUserFieldValidations('userCrossSponsoringValidation')
  },
}
</script>
