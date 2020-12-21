<template>
  <q-pagination
    v-model="page"
    size="md"
    input
    direction-links
    boundary-links
    boundary-numbers
    :max="Math.ceil(maxPages / perPage)"
    :min="minPages"
  />
</template>
<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SimplePagination',
  computed: {
    ...mapState({
      simplePagination: state => state.globalCMP.simplePagination,
    }),
    currentPage: function() {
      // uuid refers unique table identifier if same page as 2 dataTables
      if (typeof this.uuid !== 'undefined' && typeof this.simplePagination[this.uuid] !== 'undefined') {
        return this.simplePagination[this.uuid].currentPage
      } else {
        return this.simplePagination.currentPage
      }
    },
  },
  props: {
    perPage: {
      type: Number,
      default: 1,
    },
    maxPages: {
      type: [Number, String],
      required: true,
      default: 1,
    },
    minPages: {
      type: Number,
      default: 1,
    },
    paginationHandler: {
      type: Function,
      required: true,
    },
    uuid: {
      type: String,
      required: false,
    },
  },
  data: () => ({
    page: 1,
  }),
  watch: {
    page: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.handleCurrentChange()
        }
      },
    },
  },
  created() {
    this.page = this.currentPage
  },
  methods: {
    ...mapActions(['setSimplePaginationAction']),
    handleCurrentChange() {
      // skip initial call since store already
      if (this.page > 0) {
        let offset = (this.page - 1) * this.perPage
        let data = { offset: offset, currentPage: this.page }
        if (typeof this.uuid !== 'undefined') {
          data = {
            unique: true,
            [this.uuid]: {
              offset: offset,
              currentPage: this.page,
              limit: 10,
              search: '',
            },
          }
        }
        this.setSimplePaginationAction(data).then(response => {
          this.paginationHandler(this.uuid)
        })
      }
    },
  },
}
</script>
