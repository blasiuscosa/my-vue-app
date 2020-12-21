<template>
  <div class="form-holder" :class="{ 'bg-white shadow-1': backgroudColor }">
    <header-form
      :is-loading="isLoading"
      :form-name="formName"
      :submit="submit"
      :reset-form="resetForm"
      :button-one-caption="getButtonOneCaption"
      :button-one-icon="buttonOneIcon"
      :button-one-visibility="buttonOneVisibility"
      :button-two-caption="getButtonTwoCaption"
      :button-two-icon="buttonTwoIcon"
      :button-two-visibility="buttonTwoVisibility"
      :button-two-action="buttonTwoAction"
      :button-three-caption="buttonThreeCaption"
      :button-three-icon="buttonThreeIcon"
      :button-three-visibility="buttonThreeVisibility && this.urlResetPathName && this.urlResetPathName !== ''"
      :disable-submit="disableSubmit"
      :hide-submit="hideSubmit"
      :button-custom-action-caption="buttonCustomActionCaption"
      :button-custom-action-icon="buttonCustomActionIcon"
      :button-custom-action-actions="buttonCustomActionActions"
      :before-close="beforeClose"
    />
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <slot name="form-title" />
      </div>
      <div class="col-12">
        <div :id="formName" :ref="formName" :name="formName">
          <slot name="form" />
        </div>
      </div>
    </div>
    <maintenance v-if="isMaintenanceMode" />
  </div>
</template>
<!-- Component SCRIPT area -->
<script>
import HeaderForm from '../header/formHeader'
import Maintenance from '../notification/maintenance'
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'

export default {
  // Name is important do not delete
  name: 'BasicForm',
  components: {
    HeaderForm,
    Maintenance,
  },
  computed: {
    // Assign form related data from vuex store state
    ...mapState({
      errors: state => state.globalCMP.errors.data,
    }),
    getButtonOneCaption() {
      return this.isUpdate ? this.$t('common.button.update') : this.$t('common.button.save')
    },
    getButtonTwoCaption() {
      return this.isUpdate ? this.$t('common.button.updateAndClose') : this.$t('common.button.saveAndClose')
    },
  },
  // Declare component props
  props: {
    backgroudColor: {
      type: Boolean,
      default: false,
    },
    formFieldData: {
      type: Object,
      required: true,
      default: () => {},
    },
    formName: {
      type: String,
      required: true,
    },
    urlResetPathName: {
      type: String,
      required: true,
    },
    formSubmit: {
      type: Function,
      required: true,
    },
    disableSubmit: {
      type: Boolean,
      default: false,
    },
    hideSubmit: {
      type: Boolean,
      default: false,
    },
    buttonOneCaption: {
      type: String,
    },
    buttonOneIcon: {
      type: String,
      required: false,
      default: 'done',
    },
    buttonOneVisibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    buttonTwoCaption: {
      type: String,
    },
    buttonTwoIcon: {
      type: String,
      required: false,
      default: 'done_all',
    },
    buttonTwoVisibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    buttonTwoAction: {
      type: Function,
    },
    buttonThreeCaption: {
      type: String,
      required: false,
      default: function() {
        return this.$t('common.button.cancel')
      },
    },
    buttonThreeIcon: {
      type: String,
      required: false,
      default: 'clear',
    },
    buttonThreeVisibility: {
      type: Boolean,
      required: false,
      default: true,
    },
    buttonCustomActionCaption: {
      type: String,
    },
    buttonCustomActionIcon: {
      type: String,
      required: false,
      default: 'delete',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    buttonCustomActionActions: {
      type: Object,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
  },
  // Watch field value changes
  watch: {
    formFieldData: {
      // Clear visible validation error by field name once user correct the errors
      handler(obj) {
        if (this.errors) {
          _.forOwn(obj, (value, key) => {
            // For dynamic objects
            if (obj[key] !== null && typeof obj[key] === 'object' && typeof obj[key].length !== 'undefined') {
              obj[key].forEach(item => {
                if (typeof item === 'object') {
                  _.forOwn(item, value => {
                    if (typeof value !== 'undefined' && value && value.length !== 0 && value !== true) {
                      this.clearFormFieldValidation(value)
                    }
                  })
                } else {
                  if (typeof item !== 'undefined' && item && item.length !== 0 && item !== true) {
                    this.clearFormFieldValidation(item)
                  }
                }
              })
            } else {
              if (typeof value !== 'undefined' && value && value.length !== 0 && value !== true) {
                this.clearFormFieldValidation(key)
              }
            }
          })
        }
      },
      // Watch Objects / Array deep value changes
      deep: true,
    },
  },
  methods: {
    // Declare vuex actions
    ...mapActions([
      'clearValidationAction',
      'resetErrorsAction',
      'openCloseModalAction',
      'getModuleListAction',
      'currentUpdateIdAction',
    ]),
    // Clear server side form validation errors
    clearFormFieldValidation(name) {
      if (Object.keys(this.errors).length > 0) {
        this.clearValidationAction(name)
      }
    },
    // Reset form fields
    async resetForm() {
      await this.resetErrorsAction()
    },
    // submit any form
    submit(redirect) {
      this.formSubmit(this.formFieldData).then(() => {
        this.resetAndGo(redirect)
      })
    },
    // Complete the form submission and redirect and notify
    resetAndGo(redirect) {
      this.resetForm()
      this.currentUpdateIdAction()
      if (redirect) {
        this.$router.push({ name: this.urlResetPathName })
      }
    },
    // Close dialog form without any operations
    beforeClose() {
      this.resetForm()
      this.currentUpdateIdAction()
      this.$router.push({ name: this.urlResetPathName })
    },
  },
}
</script>
