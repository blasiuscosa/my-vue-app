<!-- Componen HTML Area -->
<template>
  <div class="form-holder">
    <modal-header-form
      :form-title="formTitle"
      :form-name="formName"
      :button-title-caption="buttonTitleCaption"
      :submit="submit"
      :reset-form="resetForm"
      :auto-close="autoClose"
      :before-close="beforeClose"
    />
    <div class="row">
      <div class="col-12">
        <slot name="form-title" />
        <slot name="form-navigation" />
        <div :id="formName" :ref="formName" :name="formName" @submit.prevent>
          <slot name="form" />
        </div>
      </div>
    </div>
  </div>
</template>
<!-- Component SCRIPT area -->
<script>
import modalHeaderForm from 'src/application/global/components/common/header/modalFormHeader'
import _ from 'lodash'
import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  // Name is important do not delete
  name: 'ModelForm',
  components: {
    modalHeaderForm,
  },
  computed: {
    // Assign form related data from vuex store state
    ...mapState({
      errors: state => state.globalCMP.errors.data,
      openCloseModalForm: state => state.globalCMP.openCloseModalForm.modalData,
    }),
  },
  // Declare component props
  props: {
    formTitle: {
      type: String,
      required: true,
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
    formSubmit: {
      type: Function,
      required: true,
    },
    callback: {
      type: Function,
    },
    buttonTitleCaption: {
      type: String,
      required: true,
      default: 'Create',
    },
    resetFormData: {
      type: Function,
      required: false,
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  // Watch field value changes
  watch: {
    formFieldData: {
      // Clear visible validation error by field name once user correct the errors
      handler(obj) {
        const self = this
        // Todo errors object not reactive change mutation set method
        if (this.errors) {
          _.forOwn(obj, function(value, key) {
            if (typeof value !== 'undefined' && value && value.length !== 0 && value !== true) {
              self.clearFormFieldValidation(key)
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
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    // Clear server side form validation errors
    clearFormFieldValidation(name) {
      if (Object.keys(this.errors).length > 0) {
        this.clearValidationAction(name)
      }
    },
    // Reset form fields
    resetForm() {
      this.resetErrorsAction()
      if (this.resetFormData) {
        this.resetFormData()
      }
    },
    // submit any form
    submit(redirect) {
      this.formSubmit(this.formFieldData).then(() => {
        this.resetAndGo(redirect)
        if (this.callback && typeof this.callback === 'function') {
          this.callback()
        }
      })
    },
    // Complete the form submission and redirect and notify
    resetAndGo(redirect) {
      this.resetForm()
      if (redirect) {
        this.currentUpdateIdAction()
      }
      if (redirect) {
        this.openCloseModal({ name: this.openCloseModalForm.name, status: false })
      }
    },
    // Close dialog form without any operations
    beforeClose() {
      // redirect true
      this.resetAndGo(true)
    },
  },
}
</script>
