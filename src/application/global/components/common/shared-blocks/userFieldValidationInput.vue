<template>
  <div>
    <q-input
      v-model="internalValue"
      class="required"
      :label="label"
      hide-bottom-space
      dense
      outlined
      :error="parentHasError || getIsUserFieldUnique"
      :error-message="getIsUserFieldUnique ? validationMessage : ''"
      :disable="!isServerValidationQueryConditionsFilledUp"
      :loading="isProcessingValidation"
      :readonly="disableField"
      type="text"
      @input="callValidations"
    />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { debounce } from 'quasar'

export default {
  name: 'UserFieldValidationInput',
  props: {
    model: {
      type: String,
      required: true,
    },
    validation: {
      type: Object,
    },
    validationMessage: {
      type: String,
    },
    serverValidationQuery: {
      type: Object,
      required: true,
    },
    parentHasError: {
      type: Boolean,
      default: false,
    },
    disableField: {
      type: Boolean,
    },
    skip: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
  },
  watch: {
    serverValidationQuery: {
      handler() {
        this.checkServerValidation()
      },
      deep: true,
    },
  },
  computed: {
    ...mapGetters(['getIsUserFieldUnique']),
    ...mapState({
      isProcessingValidation: state => state.globalCMP.isProcessingValidation,
      appSettings: state => state.globalCMP.appSettings,
    }),
    internalValue: {
      get() {
        return this.model
      },
      set(v) {
        this.$emit('update:model', v)
      },
    },
    isServerValidationQueryConditionsFilledUp() {
      return (
        this.serverValidationQuery.conditions.filter(x => x.value).length ===
        this.serverValidationQuery.conditions.length
      )
    },
  },
  created() {
    this.userFieldUniqueCheck = debounce(this.userFieldUniqueCheck, this.appSettings.debounceDelay)
  },
  methods: {
    ...mapActions(['userFieldUniqueCheck']),
    ...mapMutations({
      resetUserFieldValidations: 'RESET_USER_FIELD_VALIDATIONS',
    }),
    callValidations() {
      this.checkLocalValidation()
      this.checkServerValidation()
    },
    checkServerValidation() {
      if (!this.skip) {
        this.$nextTick(() => {
          if (this.internalValue !== '') {
            this.serverValidationQuery.value = this.internalValue
            this.userFieldUniqueCheck(this.serverValidationQuery)
          }
        })
      }
    },
    checkLocalValidation() {
      if (this.validation) {
        this.validation.$touch()
      }
    },
  },
  beforeDestroy() {
    this.resetUserFieldValidations('userUniqueValidation')
  },
}
</script>
