<template>
  <div class="information-tab">
    <div class="row q-col-gutter-lg">
      <div class="col-md-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-select
              v-model="memberData.information.language_id"
              class="required"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.PreferredLanguage')"
              :error="validation.information.language_id.$error"
              :error-message="$t('members.selectLanguage.errorLabel')"
              clearable
              :disable="lockMemberData"
              :options="languageOptions.options"
            />
          </div>
          <div class="col-12">
            <q-field
              class="required"
              hide-bottom-space
              stack-label
              outlined
              dense
              :label="$t('members.information.gender')"
              :error="validation.information.gender_id.$error"
            >
              <template slot="control">
                <q-option-group
                  v-model="memberData.information.gender_id"
                  inline
                  :disable="lockMemberData"
                  color="secondary"
                  type="radio"
                  :options="masterDataOptionsCreator('gender')"
                />
              </template>
            </q-field>
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.ethnic_group_id"
              class="required"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.ethnic')"
              :error="validation.information.ethnic_group_id.$error"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('ethnic_group')"
            />
          </div>
          <div class="col-12">
            <q-select
              ref="maritalStatus"
              v-model="memberData.information.martial_status_id"
              class="required"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.marital')"
              :error="validation.information.martial_status_id.$error"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('martial_status')"
              @input="checkMaritalDependency"
            />
          </div>
          <div v-if="maritalDependency" class="col-12">
            <q-field hide-bottom-space stack-label dense outlined :label="$t('members.information.spouseElkenMember')">
              <template slot="control">
                <q-option-group
                  v-model="memberData.information.spouse.spouse_elken_member"
                  :disable="lockMemberData"
                  inline
                  color="secondary"
                  type="radio"
                  :options="[
                    { label: 'Yes', value: 1 },
                    { label: 'No', value: 0 },
                  ]"
                />
              </template>
            </q-field>
          </div>
          <div v-if="memberData.information.spouse.spouse_elken_member" class="col-12 marital-status-dependency">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-input
                  v-model="memberData.information.spouse.spouse_name"
                  class="required"
                  hide-bottom-space
                  dense
                  outlined
                  :label="$t('members.information.spouseName')"
                  :error="validation.information.spouse.spouse_name.$error"
                  :disable="lockMemberData"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="memberData.information.spouse.spouse_ibo_id"
                  class="required"
                  hide-bottom-space
                  dense
                  outlined
                  :label="$t('members.information.spouseIboId')"
                  :error="validation.information.spouse.spouse_ibo_id.$error"
                  :disable="lockMemberData"
                />
              </div>
              <div class="col-12">
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select
                      v-model="memberData.information.spouse.ic_pass_type_id"
                      class="required"
                      hide-bottom-space
                      :label="$t('members.icPassportSpouseType.label')"
                      :error="
                        validation.information.spouse.ic_pass_type_id.$error ||
                          validation.information.spouse.ic_pass_type_number.$error
                      "
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      clearable
                      :disable="lockMemberData"
                      :options="masterDataOptionsCreator('ic_passport_type')"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="memberData.information.spouse.ic_pass_type_number"
                      class="required"
                      hide-bottom-space
                      :label="$t('members.icPassportSpouse.label')"
                      :error="
                        validation.information.spouse.ic_pass_type_id.$error ||
                          validation.information.spouse.ic_pass_type_number.$error
                      "
                      dense
                      outlined
                      :disable="lockMemberData || memberData.information.spouse.ic_pass_type_id === ''"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-select
              v-model="memberData.information.salutation_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.salutation')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('salutation')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.dependent_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.dependent')"
              clearable
              :disable="lockMemberData"
              :options="memberDependentConfigOptionsByCountry"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.religion_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.religion')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('religion')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.education_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.education')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('education')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.occupation_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.occupation')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('occupation')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.industry_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.industry')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('industry')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.salary_range_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.salaryRange')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('salary_range')"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="memberData.information.annual_revenue_id"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.annualRevenue')"
              clearable
              :disable="lockMemberData"
              :options="masterDataOptionsCreator('annual_revenue')"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="memberData.contact_info.replicator_website"
              hide-bottom-space
              dense
              outlined
              :label="$t('members.information.website')"
              :disable="lockMemberData"
            />
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="memberData.contact_info.tel_office_1_country_code_id"
                  hide-bottom-space
                  :label="$t('Common.PhoneCode.Text')"
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  clearable
                  :disable="lockMemberData"
                  :options="callCodeOptionsByCountry"
                />
              </div>
              <div class="col-7">
                <q-input
                  v-model="memberData.contact_info.tel_office_1_num"
                  hide-bottom-space
                  :label="$t('members.information.phone1')"
                  dense
                  outlined
                  :disable="lockMemberData || memberData.contact_info.tel_office_1_country_code_id === ''"
                />
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="memberData.contact_info.tel_office_2_country_code_id"
                  hide-bottom-space
                  :label="$t('Common.PhoneCode.Text')"
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  clearable
                  :disable="lockMemberData"
                  :options="callCodeOptionsByCountry"
                />
              </div>
              <div class="col-7">
                <q-input
                  v-model="memberData.contact_info.tel_office_2_num"
                  hide-bottom-space
                  :label="$t('members.information.phone2')"
                  dense
                  outlined
                  :disable="lockMemberData || memberData.contact_info.tel_office_2_country_code_id === ''"
                />
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="memberData.contact_info.fax_country_code_id"
                  hide-bottom-space
                  :label="$t('Common.PhoneCode.Text')"
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  clearable
                  :disable="lockMemberData"
                  :options="callCodeOptionsByCountry"
                />
              </div>
              <div class="col-7">
                <q-input
                  v-model="memberData.contact_info.fax_num"
                  hide-bottom-space
                  :label="$t('members.information.fax')"
                  dense
                  outlined
                  :disable="lockMemberData || memberData.contact_info.fax_country_code_id === ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-select
              v-model="memberData.contact_info.preferred_contact_id"
              class="required"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :label="$t('members.information.PreferredContact')"
              :error="validation.contact_info.preferred_contact_id.$error"
              :error-message="$t('members.PreferredContact.errorLabel')"
              clearable
              bottom-slots
              :disable="
                (lockMemberData && isNewUser) || isPreferredContactEmailVerified || isPreferredContactPhoneVerified
              "
              :options="masterDataOptionsCreator('preferred_contact')"
            >
              <template
                v-if="
                  isPreferredContactSelected &&
                    !isNewUser &&
                    (isPreferredContactEmailVerified || isPreferredContactPhoneVerified)
                "
                v-slot:after
              >
                <q-btn
                  v-if="!preferredContactUpdate"
                  rounded
                  unelevated
                  color="primary"
                  :label="$t('common.button.change')"
                  @click="changePreferredContact(preferredContactUpdate)"
                >
                  <q-tooltip>{{ $t('members.information.ChangePreferredContact.Text') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-else
                  rounded
                  unelevated
                  color="negative"
                  :label="$t('common.button.cancel')"
                  @click="reversePreferredContact"
                >
                </q-btn>
              </template>
            </q-select>
          </div>
          <div class="col-12">
            <q-input
              v-model="memberData.contact_info.email"
              :class="{ required: isEmailPreferredContact }"
              hide-bottom-space
              bottom-slots
              dense
              outlined
              :label="$t('members.information.email')"
              :error="
                isEmailPreferredContact &&
                validation.contact_info.email !== null &&
                validation.contact_info.email !== undefined
                  ? validation.contact_info.email.$error
                  : false
              "
              clearable
              :disable="
                (isEmailPreferredContact && isPreferredContactEmailVerified) ||
                  preferredContactRequested ||
                  preferredContactVerified ||
                  lockMemberData ||
                  !isPreferredContactSelected
              "
            >
              <template v-if="isEmailPreferredContact" v-slot:hint>
                <info
                  :icon="isPreferredContactEmailVerified ? 'verified_user' : 'error'"
                  :icon-color="isPreferredContactEmailVerified ? 'positive' : 'primary'"
                  :message="
                    isPreferredContactEmailVerified ? $t('Common.Verified.Text') : $t('Common.NotVerified.Text')
                  "
                >
                  <template v-if="!isPreferredContactEmailVerified" slot="bottom-actions">
                    <q-btn
                      color="primary"
                      rounded
                      unelevated
                      size="sm"
                      :label="$t('common.button.requestVerificationCode')"
                      @click="openCloseModal({ name: 'verificationModal', status: true })"
                    ></q-btn>
                  </template>
                </info>
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="memberData.contact_info.mobile_1_country_code_id"
                  :class="{ required: isPhonePreferredContact }"
                  hide-bottom-space
                  :label="$t('Common.PhoneCode.Text')"
                  :error="
                    isPhonePreferredContact
                      ? validation.contact_info.mobile_1_country_code_id.$error ||
                        validation.contact_info.mobile_1_num.$error
                      : false
                  "
                  options-dense
                  dense
                  emit-value
                  map-options
                  bottom-slots
                  outlined
                  clearable
                  :disable="
                    preferredContactRequested ||
                      preferredContactVerified ||
                      lockMemberData ||
                      !isPreferredContactSelected
                  "
                  :options="callCodeOptionsByCountry"
                >
                  <template v-if="isPhonePreferredContact" v-slot:hint>
                    <info
                      :icon="isPreferredContactPhoneVerified ? 'verified_user' : 'error'"
                      :icon-color="isPreferredContactPhoneVerified ? 'positive' : 'primary'"
                      :message="
                        isPreferredContactPhoneVerified ? $t('Common.Verified.Text') : $t('Common.NotVerified.Text')
                      "
                    >
                      <template v-if="!isPreferredContactPhoneVerified" slot="bottom-actions">
                        <q-btn
                          color="primary"
                          rounded
                          unelevated
                          size="sm"
                          :label="$t('common.button.requestVerificationCode')"
                          @click="openCloseModal({ name: 'verificationModal', status: true })"
                        ></q-btn>
                      </template>
                    </info>
                  </template>
                </q-select>
              </div>
              <div class="col-7">
                <q-input
                  v-model="memberData.contact_info.mobile_1_num"
                  :class="{ required: isPhonePreferredContact }"
                  hide-bottom-space
                  :label="$t('members.information.mobile1')"
                  :error="
                    isPhonePreferredContact
                      ? validation.contact_info.mobile_1_country_code_id.$error ||
                        validation.contact_info.mobile_1_num.$error
                      : false
                  "
                  dense
                  outlined
                  clearable
                  :disable="
                    preferredContactRequested ||
                      preferredContactVerified ||
                      lockMemberData ||
                      !isPreferredContactSelected
                  "
                >
                </q-input>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="memberData.contact_info.mobile_2_country_code_id"
                  hide-bottom-space
                  :label="$t('Common.PhoneCode.Text')"
                  options-dense
                  dense
                  emit-value
                  map-options
                  outlined
                  clearable
                  :disable="lockMemberData"
                  :options="callCodeOptionsByCountry"
                />
              </div>
              <div class="col-7">
                <q-input
                  v-model="memberData.contact_info.mobile_2_num"
                  hide-bottom-space
                  :label="$t('members.information.mobile2')"
                  dense
                  outlined
                  :disable="lockMemberData || memberData.contact_info.mobile_2_country_code_id === ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BasicModal
      refs="verificationModal"
      :title="$t('common.modal.titles.preferredContactVerification.title')"
      :sub-title="preferredContactVerified ? '' : $t('common.modal.titles.preferredContactVerification.subTitle')"
      min-height="15vh"
      min-width="25vw"
    >
      <template slot="modal-data">
        <div v-if="!preferredContactVerified" class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="preferredContactVerificationCode"
              class="required"
              hide-bottom-space
              dense
              outlined
              label="Verification Code"
              :error="
                $v.preferredContactVerificationCode.$error ||
                  validation.$error ||
                  setError('verification_code', 'type.exp')
              "
              :error-message="
                setError('verification_code', 'type.msg') || $t('Common.VerificationCodeMissingOrMismatch.ErrorLabel')
              "
              clearable
              :disable="!preferredContactRequested"
              :bg-color="preferredContactRequested ? 'amber-3' : 'white text-black'"
            >
            </q-input>
          </div>
          <div class="col-6">
            <q-btn
              v-if="memberData.contact_info.preferred_contact_id !== null && !preferredContactRequested"
              unelevated
              rounded
              class="full-width"
              :label="$t('common.button.request')"
              icon-right="send"
              color="primary"
              @click="requestVerificationCode"
            />
            <q-btn
              v-else
              unelevated
              rounded
              class="full-width"
              :label="$t('common.button.verify')"
              icon-right="send"
              color="action-button-success"
              @click="verifyPreferredContact"
            />
          </div>
        </div>
        <div v-else class="row">
          <div class="col-12">
            <Info
              stacked
              icon-color="positive"
              text-color="text-positive"
              icon-size="2.5rem"
              :message="$t('common.message.info.verificationComplete')"
            ></Info>
          </div>
        </div>
      </template>
    </BasicModal>
    <errors-modal refs="errorsModal" @callback="functionName => this[functionName]()" />
  </div>
</template>
<script>
import { GeneralsMixin, MasterDataTransformarMixin, SetFormFieldErrorsMixin } from 'src/application/global/mixins/index'
import trans from 'src/application/global/components/common/transition/transition'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'InformationTab',
  components: {
    trans,
  },
  mixins: [MasterDataTransformarMixin, GeneralsMixin, SetFormFieldErrorsMixin],
  props: {
    memberData: {
      type: Object,
      required: true,
    },
    validation: {
      type: Object,
      required: true,
    },
    lockMemberData: {
      type: Boolean,
      default: false,
    },
    isNewUser: {
      type: Boolean,
      default: true,
    },
    countryID: {
      type: [Number, String],
    },
    disableContactVerification: {
      type: Boolean,
      default: false,
    },
  },
  validations: {
    preferredContactVerificationCode: {
      check(val) {
        if (this.disableContactVerification) {
          return true
        }
        return val !== null && val !== undefined && val !== ''
      },
    },
  },
  data: () => ({
    maritalDependency: false,
    preferredContactRequested: false,
    preferredContactVerificationCode: '',
    preferredContactVerified: false,
    preferredContactUpdate: false,
    copyContactInfo: {},
  }),
  watch: {
    memberData: {
      handler(to) {
        if (to.information.spouse.spouse_elken_member === 0) {
          this.memberData.information.spouse.spouse_name = ''
          this.memberData.information.spouse.spouse_ibo_id = ''
          this.memberData.information.spouse.ic_pass_type_id = null
          this.memberData.information.spouse.ic_pass_type_number = null
        }
      },
      deep: true,
    },
    done: {
      handler(to) {
        if (to) {
          this.checkMaritalDependency(this.memberData.information.martial_status_id)
        }
      },
    },
  },
  computed: {
    ...mapGetters(['callCodeOptionsByCountry', 'memberDependentConfigOptionsByCountry']),
    ...mapState({
      countriesOptions: state => state.globalCMP.countriesOptions.data,
      languageOptions: state => state.globalCMP.languagesOptions.data,
      done: state => state.globalCMP.done,
    }),
    isPreferredContactSelected() {
      return this.memberData.contact_info.preferred_contact_id !== null
    },
    isPhonePreferredContact() {
      return (
        this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.PREFERRED_CONTACT, this.$const.masterData.PHONE) ===
        this.memberData.contact_info.preferred_contact_id
      )
    },
    isEmailPreferredContact() {
      return (
        this.getMasterDataIdByKeyAndTitle(this.$const.masterKey.PREFERRED_CONTACT, this.$const.masterData.EMAIL) ===
        this.memberData.contact_info.preferred_contact_id
      )
    },
    getCountryID() {
      return this.isNewUser ? (this.countryID !== null ? this.countryID : null) : this.memberData.details.country_id
    },
    isPreferredContactEmailVerified() {
      return this.memberData.contact_info.email_verified === 1
    },
    isPreferredContactPhoneVerified() {
      return this.memberData.contact_info.mobile_1_verified === 1
    },
  },
  async mounted() {
    this.master.keys = [
      this.$const.masterData.GENDER,
      this.$const.masterData.RELATIONSHIPS,
      this.$const.masterData.MARITAL_STATUS,
      this.$const.masterData.RELIGION,
      this.$const.masterData.ETHNIC_GROUP,
      this.$const.masterData.SALUTATION,
      this.$const.masterData.OCCUPATION,
      this.$const.masterData.EDUCATION,
      this.$const.masterData.INDUSTRY,
      this.$const.masterData.SALARY_RANGE,
      this.$const.masterData.ANNUAL_REVENUE,
      this.$const.masterData.PREFERRED_CONTACT,
    ]
    let query1 = {
      country_id: this.getCountryID,
    }
    this.master.country_id = query1.country_id
    await this.getLanguagesAction(query1)
    let query2 = {
      country_id: this.getCountryID,
      relations: ['MemberDependentConfig'],
    }
    await this.getCountryRelationAction(query2)
  },
  methods: {
    ...mapActions([
      'getLanguagesAction',
      'getCountryRelationAction',
      'requestMobileNumberValidationAction',
      'performMobileNumberValidationAction',
      'requestEmailValidationAction',
      'performEmailValidationAction',
    ]),
    ...mapMutations({
      setNotification: 'SHOW_NOTIFICATION',
    }),
    checkMaritalDependency(value) {
      if (value !== '') {
        let maritalStatus = this.masterDataOptionsCreator('martial_status').filter(key => key.value === value)
        if (maritalStatus.length > 0) {
          this.maritalDependency = maritalStatus[0].label === this.$const.masterKey.MARRIED
        }
      }
    },
    requestVerificationCode() {
      if (this.isPhonePreferredContact) {
        this.validation.contact_info.mobile_1_num.$touch()
        this.validation.contact_info.mobile_1_country_code_id.$touch()
        if (
          !this.validation.contact_info.mobile_1_country_code_id.$error &&
          !this.validation.contact_info.mobile_1_num.$error
        ) {
          let query = {
            call_code_id: this.memberData.contact_info.mobile_1_country_code_id,
            verification_mobile: this.memberData.contact_info.mobile_1_num,
          }
          if (!this.isNewUser) {
            query.user_id = this.memberData.details.user_id
          }
          this.requestMobileNumberValidationAction(query)
            .then(res => {
              if (this.$helpers.getValue(res, 'verified') === 1) {
                // mobile number previously verified
                this.preferredContactVerified = true
                this.memberData.contact_info.mobile_1_verified = 1
                this.preferredContactUpdate = false
              } else {
                // show verification code field
                this.preferredContactRequested = true
              }
            })
            .catch(error => {
              this.preferredContactRequested = false
              if (this.$helpers.getValue(error, 'response.status') === 422) {
                this.openCloseModal({ name: 'errorsModal', status: true, callbackFunctionName: 'verificationOnError' })
              }
            })
        }
      } else if (this.isEmailPreferredContact) {
        this.validation.contact_info.email.$touch()
        if (!this.validation.contact_info.email.$error) {
          let query = {
            verification_email: this.memberData.contact_info.email,
          }

          if (!this.isNewUser) {
            query.user_id = this.memberData.details.user_id
          }
          this.requestEmailValidationAction(query)
            .then(res => {
              if (this.$helpers.getValue(res, 'verified') === 1) {
                // mobile number previously verified
                this.preferredContactVerified = true
                this.memberData.contact_info.email_verified = 1
                this.preferredContactUpdate = false
              } else {
                // show verification code field
                this.preferredContactRequested = true
              }
            })
            .catch(error => {
              this.preferredContactRequested = false
              if (this.$helpers.getValue(error, 'response.status') === 422) {
                this.openCloseModal({ name: 'errorsModal', status: true, callbackFunctionName: 'verificationOnError' })
              }
            })
        }
      }
    },
    verifyPreferredContact() {
      this.$v.preferredContactVerificationCode.$touch()
      if (!this.$v.preferredContactVerificationCode.$error) {
        if (this.isPhonePreferredContact) {
          let query = {
            call_code_id: this.memberData.contact_info.mobile_1_country_code_id,
            verification_mobile: this.memberData.contact_info.mobile_1_num,
            verification_code: this.preferredContactVerificationCode,
          }
          if (!this.isNewUser) {
            query.preferred_contact_id = this.memberData.contact_info.preferred_contact_id
            query.user_id = this.memberData.details.user_id
          }
          this.performMobileNumberValidationAction(query)
            .then(res => {
              if (this.$helpers.getValue(res, 'verified') === 1) {
                // mobile number previously verified
                this.preferredContactVerified = true
                this.preferredContactRequested = false
                this.memberData.contact_info.mobile_1_verified = 1
                this.preferredContactUpdate = false
                if (res.code) {
                  this.preferredContactVerificationCode = res.code
                }
              } else {
                // show verification code field
                this.preferredContactRequested = true
              }
            })
            .catch(error => {
              this.preferredContactVerified = false
              if (error.verification_code !== null && error.verification_code !== undefined) {
                this.setNotification({
                  title: 'Mobile number verification failed',
                  message: error.verification_code,
                  type: 'negative',
                })
              }
            })
        } else {
          // this.$v.preferredContactVerificationCode.$touch()
          // if (!this.$v.preferredContactVerificationCode.$error) {
          let query = {
            verification_email: this.memberData.contact_info.email,
            verification_code: this.preferredContactVerificationCode,
          }
          if (!this.isNewUser) {
            query.preferred_contact_id = this.memberData.contact_info.preferred_contact_id
            query.user_id = this.memberData.details.user_id
          }
          this.performEmailValidationAction(query)
            .then(res => {
              if (this.$helpers.getValue(res, 'verified') === 1) {
                // mobile number previously verified
                this.preferredContactVerified = true
                this.preferredContactRequested = false
                this.memberData.contact_info.email_verified = 1
                this.preferredContactUpdate = false
              } else {
                // show verification code field
                this.preferredContactRequested = true
              }
            })
            .catch(error => {
              this.preferredContactVerified = false
              if (error.verification_code !== null && error.verification_code !== undefined) {
                this.setNotification({
                  title: 'Email verification failed',
                  message: error.verification_code,
                  type: 'negative',
                })
              }
            })
          // }
        }
      }
    },
    changePreferredContact(x) {
      if (!x) {
        this.clearPreferredContact()
        this.memberData.contact_info.preferred_contact_id = null
      }
      this.preferredContactUpdate = !x
    },
    onPreferredContactChanged() {
      this.clearPreferredContact()
    },
    clearPreferredContact() {
      this.copyContactInfo = { ...this.memberData.contact_info }
      if (!this.disableContactVerification) {
        this.preferredContactVerified = false
        this.preferredContactRequested = false
        this.preferredContactVerificationCode = ''
        if (this.isEmailPreferredContact) {
          this.memberData.contact_info.email_verified = 0
        } else if (this.isPhonePreferredContact) {
          this.memberData.contact_info.mobile_1_verified = 0
        }
      }
    },
    reversePreferredContact() {
      this.memberData.contact_info = { ...this.copyContactInfo }
      this.preferredContactUpdate = false
      this.preferredContactVerified = this.isPreferredContactEmailVerified || this.isPreferredContactPhoneVerified
    },
    verificationOnError() {
      this.openCloseModal({ name: 'verificationModal', status: false })
    },
  },
}
</script>
