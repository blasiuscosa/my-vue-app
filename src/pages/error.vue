<template>
  <div class="fullscreen bg-grey-2">
    <div class="fixed-center text-center q-pa-md">
      <div class="text-h2">
        <img src="~assets/surprise.svg" style="width:30vw;max-width:150px;" />
      </div>
      <div class="text-h6 text-grey-14 q-ma-md">
        Oops, something went wrong !<strong> (500, 503, 501, 401, XXX)</strong>
      </div>
      <div class="text-body-1 text-faded q-ma-md">
        It is possible that the server was unable to answer the HTTP/HTTPS request correctly. In this case, it may be
        enough to just refresh the page to resolve the error. To do this, simply click on the <br />
        refresh button <span class="text-weight-bold">OR</span> login again.
      </div>
      <div class="row justify-center q-col-gutter-sm">
        <div class="col-auto">
          <q-btn
            icon="refresh"
            color="primary"
            rounded
            unelevated
            :label="$t('Common.Refresh.Text')"
            size="md"
            @click="$router.push({ name: 'initialize' })"
          />
        </div>
        <div class="col-auto">
          <q-btn
            icon="login"
            color="primary-darkened"
            rounded
            unelevated
            :label="$t('Common.LoginAgain.Text')"
            size="md"
            @click="logoutHandler"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { GeneralsMixin } from 'src/application/global/mixins'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Error',
  mixins: [GeneralsMixin],
  computed: {
    ...mapState({
      route: state => state.route,
    }),
  },
  mounted() {
    this.setErrorOccurred(true)
  },
  methods: {
    ...mapMutations({
      setErrorOccurred: 'SET_ERROR_OCCURRED',
    }),
  },
}
</script>
