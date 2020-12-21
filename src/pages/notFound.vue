<template>
  <div class="fullscreen bg-grey-2">
    <div class="fixed-center text-center q-pa-md">
      <div class="text-h2">
        <img src="~assets/sweat.svg" style="width:30vw;max-width:150px;" />
      </div>
      <div class="text-h6 text-grey-14 q-ma-md">We couldn't find page you're looking for.<strong>(404)</strong></div>
      <div class="text-body-1 text-faded q-ma-md">
        The page that you are looking for either removed or not exist.
      </div>
      <div class="row justify-center q-col-gutter-sm">
        <div class="col-auto">
          <q-btn
            icon="dashboard"
            color="primary-darkened"
            rounded
            unelevated
            :label="$t('Common.Dashboard.Text')"
            size="md"
            @click="$router.push({ name: 'default' })"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'NotFound',
  computed: {
    ...mapState({
      route: state => state.route,
    }),
  },
}
</script>
