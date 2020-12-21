import { mapActions, mapState } from 'vuex'

export default {
  props: {
    refs: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState({
      openCloseModalForm: state => state.globalCMP.openCloseModalForm.modalData,
    }),
  },
  watch: {
    openCloseModalForm: {
      handler() {
        let getCurrentModal = this.openCloseModalForm.find(x => x.name === this.refs)
        if (getCurrentModal) {
          let item = {
            [getCurrentModal.name]: getCurrentModal.status,
          }
          this.open = Object.assign({}, item)
          this.callback = this.$helpers.getValue(getCurrentModal, 'callbackFunctionName')
        }
      },
      deep: true,
    },
  },
  data: () => ({
    open: {},
    callback: null,
  }),
  methods: {
    ...mapActions(['openCloseModalAction']),
  },
}
