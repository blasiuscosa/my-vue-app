<template>
  <div id="q-app">
    <transition enter-active-class="animated fadeIn" :duration="500">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { GeneralsMixin, NotificationMixin, WebsocketMixin } from 'src/application/global/mixins/index'
import { mapState } from 'vuex'

/*
 * Root component
 */
export default {
  name: 'App',
  mixins: [NotificationMixin, GeneralsMixin, WebsocketMixin],
  created() {
    // Add mobile browser addressBar color
    this.$q.addressbarColor.set('#12256b')
  },
  computed: {
    ...mapState({
      auth: state => state.authCMP.auth,
      roles: state => state.globalCMP.roles,
    }),
  },
  methods: {
    /**
     *
     * @param el
     * @param done
     */
    resetScroll(el, done) {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      done()
    },
  },
}
</script>
