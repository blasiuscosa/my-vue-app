<template>
  <q-layout view="lHr Lpr lfr" class="frontend bg-blue-grey-1">
    <q-header bordered class="bg-white">
      <!--Toolbar-->
      <q-toolbar class="text-black">
        <q-toolbar-title class="text-body-1 text-weight-light no-padding">
          <div class="row justify-between items-center">
            <div class="col-md-6">
              <div class="row items-center q-col-gutter-sm">
                <div class="col-auto">
                  <q-btn
                    icon="menu"
                    outline
                    dense
                    class="full-height"
                    color="primary"
                    @click="leftDrawerOpen = !leftDrawerOpen"
                  >
                  </q-btn>
                </div>
                <div class="col-auto">
                  <q-btn
                    v-go-back.single="store.backRoute"
                    icon="arrow_back"
                    dense
                    outline
                    class="platform-android-only"
                  />
                </div>
                <div class="col-1 q-pt-md gt-sm">
                  <img class="logo responsive" src="~assets/evo/logo.png" alt="myapp" />
                </div>
                <div class="col-md-auto gt-sm">
                  <simple-clock class="text-primary-darkened" />
                </div>
                <div class="col-md-auto">
                  <q-btn
                    size="sm"
                    dense
                    color="grey-6"
                    icon="fas fa-lightbulb"
                    flat
                    @click="openCloseModal({ name: 'appHelperModal', status: true })"
                  >
                    <q-tooltip>
                      ? Helper
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="row justify-end items-center q-col-gutter-xs">
                <div class="col-md-auto">
                  <q-btn-dropdown
                    dense
                    flat
                    :label="getCountryCode()"
                    color="primary"
                    icon="fas fa-globe"
                    :offset="[0, 10]"
                    square
                    fit
                  >
                    <q-list dense>
                      <q-item
                        v-for="(country, index) in countriesOptions.options"
                        :key="`country-${index}`"
                        v-close-popup
                        :clickable="getCountryCode() !== country.code_iso_2"
                        :active="getCountryCode() === country.code_iso_2"
                        active-class="bg-grey-3"
                        @click="updateGlobalCountry(country.value)"
                      >
                        <q-item-section avatar color="primary">
                          <country-flag :country="country.code_iso_2" size="normal" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ country.label }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-icon
                            :name="getCountryCode() === country.code_iso_2 ? 'done' : ''"
                            color="primary-darkened"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
                <div v-if="userInfo.name" class="col-md-auto">
                  <q-btn dense color="primary" flat icon="fas fa-user-circle">
                    <q-menu :offset="[0, 10]" square fit>
                      <div class="row no-wrap q-pa-md">
                        <div class="column">
                          <div class="text-subtitle2">
                            Email
                          </div>
                          <div class="text-caption">
                            {{ userInfo.email }}
                          </div>
                          <div class="text-caption text-uppercase text-center">
                            <q-chip icon="admin_panel_settings">
                              {{ userInfo.user_type }}
                            </q-chip>
                          </div>
                        </div>
                        <q-separator vertical inset class="q-mx-lg" />
                        <div class="column items-center">
                          <q-avatar size="72px">
                            <q-img class="text-primary-darkened" src="~/assets/profile/user.svg" />
                          </q-avatar>
                          <div class="text-subtitle1 q-mt-md q-mb-xs text-capitalize">{{ userInfo.name }}</div>
                          <!-- Todo Removed -->
                          <!--  <q-btn v-close-popup color="primary" label="Change Password" rounded unelevated size="sm" />-->
                        </div>
                      </div>
                    </q-menu>
                  </q-btn>
                </div>
                <div class="col-md-auto">
                  <q-btn color="primary" flat dense>
                    <audio ref="audioElm" src="ding.mp3" />
                    <span class="text-negative" :class="{ 'animate-blink': notificationCount > 0 }">{{
                      notificationCount > 0 ? notificationCount + '+' : notificationCount
                    }}</span>
                    <q-icon name="fas fa-bell" />
                  </q-btn>
                </div>
                <div class="col-md-auto">
                  <q-btn
                    dense
                    flat
                    :loading="isProcessingRefreshToken"
                    color="primary"
                    icon="fas fa-power-off fas fa-rotate-90"
                    @click="logoutHandler"
                  />
                </div>
                <div class="col-md-auto">
                  <q-icon class="pd-2" :color="websocket.connected ? 'positive' : 'negative'" name="lens" />
                </div>
                <div v-if="!websocket.connected" class="col-md-auto gt-sm">
                  <q-spinner-puff color="secondary" :size="20" />
                  <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
                    Re-connecting to live notification server ...
                  </q-tooltip>
                </div>
              </div>
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
      <!--Toolbar End-->
      <!--Info-->
      <q-banner
        v-if="config.toggles.notification.oldDashboard"
        class="bg-blue-2 text-dark text-subtitle1"
        dense
        inline-actions
      >
        We're updating the Backoffice UI, if you experiencing any bottleneck please use old view instead.
        <template slot="action">
          <q-btn
            size="sm"
            rounded
            outline
            unelevated
            color="primary-darkened"
            label="Bring me to old Dashboard"
            @click="openURL('https://backend-old.com')"
          />
        </template>
      </q-banner>
      <!--Info Ends-->
      <!--Update Alert-->
      <q-banner v-if="getIsUpdateAvailable" class="bg-amber-3 text-dark text-subtitle2" dense inline-actions>
        {{ $t('Common.UpdatesAvailable.Text') }}
        <span class="text-subtitle2 text-negative"
          >({{ $t('Common.AutoUpdateIn.Text', { time: getTimerMinuets }) }})</span
        >
        <template slot="action">
          <q-btn
            size="sm"
            rounded
            unelevated
            color="dark"
            :label="$t('Common.ClickHereToUpdate.Text')"
            @click="refreshApp"
          />
        </template>
      </q-banner>
      <!--Update Alert Ends-->
    </q-header>
    <!--Sidebar-->
    <StandardSideMenu v-model="leftDrawerOpen" :sidebar-navigations="getStandardMenu" />
    <!--Sidebar End-->
    <!--Content-->
    <q-page-container class="general-page" :class="{ 'no-scroll': $wait.any }">
      <q-page padding>
        <transition enter-active-class="animated fadeIn" :duration="500" @leave="resetScroll">
          <router-view :key="$route.fullPath" />
        </transition>
      </q-page>
    </q-page-container>
    <!--Content End-->
    <q-footer class="bg-transparent">
      <q-toolbar>
        <q-toolbar-title>
          <AppVersion classes="text-left q-ml-md q-mb-xs"></AppVersion>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
    <BasicModal refs="appHelperModal" title="Shortcuts" min-width="50vw">
      <template slot="modal-data" slot-scope="props">
        <div class="row">
          <div class="col-md-12">
            <div v-for="shortcut in appSettings.shortcuts" class="helper q-mb-md q-mt-md">
              <div class="text-h6">
                <q-chip square color="primary-darkened text-white">
                  {{ shortcut.module }}
                </q-chip>
              </div>
              <q-markup-table square dense bordered separator="cell" flat>
                <tr v-for="item in shortcut.items">
                  <td>{{ item.name }}</td>
                  <td>{{ item.desc }}</td>
                  <td>
                    <q-chip>{{ item.shortcut }}</q-chip>
                  </td>
                </tr>
              </q-markup-table>
            </div>
          </div>
        </div>
      </template>
    </BasicModal>
    <schema-manager />
    <!-- optional -->
  </q-layout>
</template>

<script>
import Store from 'src/services/navigationService'
import Translation from 'src/application/global/components/common/translations/translation'
import { QChip, QSpinnerPuff } from 'quasar'
import { DatesMixin, GeneralsMixin, AppUpdateMixin } from 'src/application/global/mixins/index'
import { BasicModal, StandardSideMenu } from 'src/application/global/components'
import simpleClock from 'src/application/global/components/common/clock/simple-clock'
import SchemaManager from '../pages/schemaManager.vue'
import VueOfflineMixin from 'vue-offline/mixin'
import acl from 'src/services/aclService'
import { openURL } from 'quasar'
import { AppVersion } from 'src/application/global/components'
import { debounce } from 'quasar'
import * as moment from 'moment'
import config from 'src/config'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Full',
  components: {
    SchemaManager,
    QChip,
    BasicModal,
    language: Translation,
    simpleClock,
    StandardSideMenu,
    AppVersion,
  },
  mixins: [GeneralsMixin, DatesMixin, VueOfflineMixin, AppUpdateMixin],
  computed: {
    ...mapState({
      isProcessingRefreshToken: state => state.globalCMP.isProcessingRefreshToken,
      errors: state => state.globalCMP.errors,
      userInfo: state => state.globalCMP.userInfo.data,
      appSettings: state => state.globalCMP.appSettings,
      selectedFilters: state => state.globalCMP.selectedFilters,
      countriesOptions: state => state.globalCMP.countriesOptions.data,
      websocket: state => state.globalCMP.websocket,
    }),
    ...mapGetters(['getSelectedFilters', 'getStandardMenu', 'isAnyModalActive']),
    getDiscontinueDate() {
      return moment('2020-12-31T00:00:00')
        .zone('Asia/Malaysia')
        .format('DD/MM/YYYY h:mm:ss a Z')
    },
  },
  watch: {
    /** Watch globalFilters countryID changes to re-apply permissions **/
    getSelectedFilters: {
      async handler(current) {
        if (!acl.disable && current.countryID !== acl.country) {
          await acl.aclRefresh({
            country: current.countryID,
          })
        }
      },
      deep: true,
    },
    '$wait.any'(to) {
      if (!this.isAnyModalActive) {
        this.processLoading(to)
      }
    },
  },
  async mounted() {
    await this.appInit()
  },
  async created() {
    // For smooth show/hide loading effect
    this.hideLoading = debounce(this.hideLoading, this.appSettings.mainLoadingDebounceDelay)
    this.processLoading = debounce(this.processLoading, this.appSettings.mainLoadingProcessDebounceDelay)
    this.$on('online', function() {
      this.$q.loading.hide()
    })
    this.$on('offline', function() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        message: this.$t('Common.NoInternet.Info'),
        messageColor: 'white',
        spinnerSize: 50, // in pixels
        spinnerColor: 'white',
        customClass: 'z-top',
      })
    })
  },
  data() {
    return {
      leftDrawerOpen: true,
      onlineState: navigator.onLine,
      sidebarSearch: '',
      searchData: {},
      store: Store.state,
      notificationCount: 0,
      version: '',
      companyName: '',
      openURL,
      config,
    }
  },
  methods: {
    ...mapActions(['getCountriesAction', 'isProcessingAction', 'getUserDetailsAction']),
    appInit() {
      this.getCountriesAction()
    },
    resetScroll(el, done) {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      done()
    },
    getCountryCode() {
      let code = ''
      if (this.countriesOptions.options.length > 0) {
        let item = this.countriesOptions.options.find(x => x.value === this.selectedFilters.countryID)
        if (item !== undefined) {
          code = item.code_iso_2
        }
      }
      return code
    },
    refreshNotification() {
      if (this.websocket.channels.length > 0) {
        this.notificationCount = this.websocket.channels.length
        this.$refs.audioElm.play()
      }
    },
    updateGlobalCountry(value, updateGlobal = true) {
      this.$q
        .dialog({
          title: 'Warning',
          message: this.$t('Common.UpdateGlobalCountryInfo.Text'),
          cancel: {
            glossy: true,
            color: 'negative',
            label: 'No',
          },
          ok: {
            glossy: true,
            color: 'positive',
            label: 'Yes',
          },
        })
        .onOk(() => {
          if (updateGlobal) {
            this.setFilterData({
              countryID: value,
            })
          }
          window.location.reload()
        })
    },
    processLoading(to) {
      if (to) {
        this.$q.loading.show({
          message: this.$wait.is('retryRequest') ? this.$t('Common.RetryRequest.Text') : '',
          messageColor: 'primary text-h6',
          spinnerSize: 80, // in pixels
          spinnerColor: 'primary-darkened',
          backgroundColor: 'white',
        })
      } else {
        this.hideLoading()
      }
    },
    hideLoading() {
      this.$q.loading.hide()
    },
  },
}
</script>
<style>
/*Skip css loader*/
@import '~intro.js/introjs.css';
</style>
