import { mapMutations, mapState } from 'vuex'
import querystring from 'query-string'
import { identity, pickBy } from 'lodash'

export default {
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
      selectedFilters: state => state.globalCMP.selectedFilters,
    }),
  },
  data: () => ({
    query: {},
    visibleColumns: [],
    separator: 'horizontal',
    initialPagination: {
      pagination: {
        rowsPerPage: 0,
      },
      filter: '',
    },
    serverPagination: {},
  }),
  mounted() {
    this.separator = this.appSettings.defaulted.table_separators.selection
  },
  methods: {
    ...mapMutations({
      setFilterData: 'SET_FILTER_DATA',
      unSetFilterData: 'UNSET_FILTER_DATA',
    }),
    /**
     * Process user query then return
     * @param data
     * @param queryString
     * @param additionalQuery
     * @param alternatePagination
     * @param resourceAPI
     * @returns {*}
     */
    processQueryData(
      data,
      queryString = false,
      additionalQuery = {},
      alternatePagination = false,
      resourceAPI = false
    ) {
      let globalQuery = {}
      let pagination = {}
      let filter = ''

      if (data && Object.keys(data).length > 0) {
        if (data.pagination !== undefined) {
          pagination = data.pagination
        }
        if (data.filter !== undefined) {
          filter = data.filter
        }
        // Alternate pagination keys if required
        if (alternatePagination) {
          let specialQuery = {
            paginate: this.$helpers.getValue(pagination, 'rowsPerPage', this.appSettings.fallback.table_rows_per_page),
            page: pagination.page,
          }
          if (this.$helpers.isSet(pagination, 'sortBy', ['notNull', 'notEmpty'])) {
            let sortQuery = {
              [`sort[${[this.$helpers.getValue(pagination, 'sortBy', 'id')]}]`]: this.$helpers.getValue(
                pagination,
                'descending'
              )
                ? 'asc'
                : 'desc',
            }
            specialQuery = { ...specialQuery, ...sortQuery }
          }
          globalQuery = { ...specialQuery }
        } else {
          globalQuery = {
            limit: this.$helpers.getValue(pagination, 'rowsPerPage', this.appSettings.fallback.table_rows_per_page),
            offset: this.$helpers.getValue(pagination, 'page') ? (pagination.page - 1) * pagination.rowsPerPage : 0,
          }
          if (this.$helpers.isSet(pagination, 'sortBy', ['notNull', 'notEmpty'])) {
            if (!resourceAPI) {
              globalQuery.sort = this.$helpers.getValue(pagination, 'sortBy', 'id')
            } else {
              globalQuery.sort_by = this.$helpers.getValue(pagination, 'sortBy', 'id')
            }
          }
          if (!resourceAPI) {
            globalQuery.order = this.$helpers.getValue(pagination, 'descending') ? 'asc' : 'desc'
          } else {
            globalQuery.order_by = this.$helpers.getValue(pagination, 'descending') ? 'ASC' : 'DESC'
          }
        }
      }
      // Additional payload
      if (Object.keys(additionalQuery).length > 0) {
        globalQuery = { ...globalQuery, ...additionalQuery }
      }
      // Transform payload to query string format eg.?abc=1&cde=2
      if (queryString) {
        return '?' + querystring.stringify(pickBy(globalQuery, identity), { arrayFormat: 'bracket' })
      }
      return globalQuery
    },
    /**
     * Set default table setting
     * @param table
     * @returns {initialPagination|{pagination, filter}}
     */
    setDefaultPaginationAttr: function(table) {
      this.initialPagination.pagination.rowsPerPage =
        this.appSettings.tables[table] !== undefined && this.appSettings.tables[table].table_rows_per_page !== undefined
          ? this.appSettings.tables[table].table_rows_per_page
          : this.appSettings.fallback.table_rows_per_page
      return this.initialPagination
    },
    /**
     * Set column visibility on load
     * @param data
     */
    setVisibleColumns: function(data = []) {
      if (data && data.length > 0) {
        data.forEach(x => {
          if (x.visible === undefined || x.visible === true) {
            this.visibleColumns.push(x.name)
          }
        })
      }
    },
  },
}
