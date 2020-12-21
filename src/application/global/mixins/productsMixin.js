export default {
  methods: {
    setAdditionalFields(data) {
      let fields = this.$configs.app.modules.product.default.additionalFields() || []
      fields.forEach(function(field) {
        let keys = Object.keys(field)
        keys.map(function(key) {
          if (!data[key]) {
            data = { ...data, ...field }
          }
        })
      })
      return data
    },
  },
}
