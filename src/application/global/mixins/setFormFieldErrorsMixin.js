import { mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      errors: state => state.globalCMP.errors.data,
    }),
  },
  methods: {
    ...mapActions(['clearValidationAction']),
    // Return error boolean expression
    // Passing name and type
    // Passing name and type
    setError: function(name, type) {
      let errors = this.$helpers.getValue(this.errors, 'errors')
      // Check type and process
      if (type === 'type.exp') {
        // Check this.errors contains name key inside object
        return errors && errors.hasOwnProperty(name)
      }
      // Check type and process
      if (errors && errors.hasOwnProperty(name) && type === 'type.msg') {
        let errors = ''
        for (let error of this.errors.errors[name]) {
          errors += error
          if (Array.isArray(this.errors.errors[name])) {
            errors += this.errors.errors[name].length > 1 ? '||' : ''
          }
        }
        return errors
      }

      return ''
    },
    // ClearValidation
    clearFormFieldValidation(name) {
      if (typeof this.errors !== 'undefined' && Object.keys(this.errors).length > 0) {
        this.clearValidationAction(name)
      }
    },
  },
}
