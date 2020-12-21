<template>
  <div class="general-page-holder">
    <general-header genaral-title="List of back-office users" />
    <div class="filter-holder bg-white shadow-1">
      <div class="row">
        <div class="col-md-6">
          <q-select
            v-model="selectedProxy"
            hide-bottom-space
            options-dense
            dense
            emit-value
            map-options
            outlined
            :options="getProxyOptions"
            clearable
            :label="$t('Common.ApiProxy.Label')"
            @input="changeApiProxy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import generalHeader from 'src/application/global/components/common/header/generalHeader'
import { DEV_API_PROXY, DEV_API_PROXY_OPTIONS } from 'src/store/localStorageKeys'
import { mapActions } from 'vuex'

export default {
  name: 'ApiConfig',
  components: {
    generalHeader,
  },
  data: () => ({
    selectedProxy: null,
  }),
  computed: {
    getProxyOptions() {
      return JSON.parse(localStorage.getItem(DEV_API_PROXY_OPTIONS)) || []
    },
  },
  mounted() {
    let selectedApiProxyObject = false
    let localStorageApiProxy = localStorage.getItem(DEV_API_PROXY)
    if (localStorageApiProxy !== null) {
      selectedApiProxyObject = this.getProxyOptions.find(proxy => proxy.value === localStorageApiProxy)
    }
    if (selectedApiProxyObject !== undefined) {
      this.selectedProxy = selectedApiProxyObject.value
    }
  },
  methods: {
    ...mapActions(['logoutAction']),
    changeApiProxy() {
      localStorage.setItem(DEV_API_PROXY, this.selectedProxy)
      this.logoutAction({ onLogoutRefresh: true })
    },
  },
}
</script>
