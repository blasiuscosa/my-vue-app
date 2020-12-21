<template>
  <div class="general-page-holder">
    <div class="row">
      <div class="col-12">
        <div class="text-center q-pa-md">
          <div class="text-h2">
            <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
          </div>
          <div class="text-h6 text-grey-14 q-ma-md">Access is denied.<strong>(403)</strong></div>
          <div class="text-body-1 text-faded q-ma-md">
            You do not have enough privileges to access ({{ $t(deniedRouteName) }}). For more information contact your
            department administrator.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { DENIED_ROUTE_NAME } from 'src/store/localStorageKeys'
import { mapState } from 'vuex'

export default {
  name: 'Deny',
  computed: {
    ...mapState({
      route: state => state.route,
    }),
    deniedRouteName() {
      return localStorage.getItem(DENIED_ROUTE_NAME)
    },
  },
}
</script>
