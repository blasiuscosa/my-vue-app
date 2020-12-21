import { mapMutations, mapState } from 'vuex'
import { uid } from 'quasar'

export default {
  computed: {
    ...mapState({
      trashData: state => state.globalCMP.trashData,
    }),
  },
  methods: {
    ...mapMutations({
      setTrashData: 'SET_TRASH_DATA',
    }),
    pushTrashData(module, data) {
      let trash = {
        id: uid(),
        module: module,
        data: data,
      }
      this.setTrashData(trash)
      return trash.id
    },
    popTrashData(uid) {
      let trashIndex = this.trashData.findIndex(x => x.id === uid)
      if (trashIndex !== -1 || trashIndex === null) {
        this.trashData.pop(trashIndex)
      }
    },
    getTrashDataById(trashUID) {
      if (this.trashData.data.length > 0) {
        let data = this.trashData.data.filter(x => x.id === trashUID)
        return data[0].data
      } else {
        return []
      }
    },
  },
}
