import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getMasterDataIdByKeyAndTitle']),
    ...mapState({
      masterData: state => state.globalCMP.masterData.data.list,
    }),
    getMasterIds() {
      return this.ids
    },
  },
  data: () => ({
    master: {
      identifier: false,
      keys: [],
    },
    ids: {},
  }),
  watch: {
    master: {
      async handler() {
        await this.retrieveMasterData()
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(['getMastersWithKey']),
    masterDataConfigOptionsCreator(key) {
      if (this.masterData[key] !== undefined) {
        return this.masterData[key].map(opt => ({ config: opt.title }))
      }
      return []
    },
    masterDataOptionsCreator(key, optionalCompressionData = null, valueKey = 'id') {
      if (this.masterData[key] !== undefined) {
        // Special case used when need to compare master data value with user specified
        if (
          optionalCompressionData !== undefined &&
          optionalCompressionData !== null &&
          optionalCompressionData.length > 0
        ) {
          let union = this.masterData[key].filter(original =>
            optionalCompressionData.find(compare => original.id === compare)
          )
          return union.map(opt => ({ label: opt.title, value: opt.id }))
        }
        // Change map value key if needed
        return this.masterData[key].map(opt => ({
          label: opt.title,
          value: valueKey === 'title' ? opt[valueKey].toLowerCase().replace(/ /g, '_') : opt[valueKey],
        }))
      }
      return []
    },
    masterDataWithCustomOptionsCreator(key, customOptions = [], valueKey = 'id') {
      let data = []
      if (this.masterData[key] !== undefined) {
        // Change map value key if needed
        data = this.masterData[key].map(opt => ({
          label: opt.title,
          value: valueKey === 'title' ? opt[valueKey].toLowerCase().replace(/ /g, '_') : opt[valueKey],
        }))
      }
      return [...data, ...customOptions]
    },
    async retrieveMasterData(keys = false) {
      if (this.master.keys.length > 0 || keys) {
        await this.getMastersWithKey(keys || this.master)
        Object.assign(this.ids, { testId: 'cosa' })
      }
    },
  },
}
