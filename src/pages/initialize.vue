<template>
  <div>
    <!--make it empty always-->
  </div>
</template>
<script>
import { Loading } from 'quasar'
import acl from 'src/services/aclService'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      userInfo: state => state.globalCMP.userInfo.data,
      acl: state => state.globalCMP.acl,
    }),
    ...mapGetters(['getSelectedFilters', 'isMember']),
    isRootUser() {
      return (
        this.$helpers.isSet(this.userInfo, 'user_type') && this.$helpers.getValue(this.userInfo, 'user_type') === 'root'
      )
    },
    aclModuleDisable() {
      return this.isRootUser
    },
    schemaManagerModuleEnable() {
      return this.isRootUser
    },
    getUserPermissions() {
      if (!this.isRootUser && this.$helpers.isSet(this.userInfo, 'permissions', ['notNull', 'notEmpty'])) {
        return this.userInfo.permissions
      }
      return []
    },
    getUserCountry() {
      if (this.$helpers.isSet(this.userInfo, 'staff')) {
        return this.userInfo.staff.country_id
      } else if (this.$helpers.isSet(this.userInfo, 'stockist')) {
        return this.userInfo.stockist.country_id
      } else if (this.$helpers.isSet(this.userInfo, 'member')) {
        return this.userInfo.member.country_id
      } else {
        // Root user will start with default country
        return 1
      }
    },
  },
  async mounted() {
    Loading.show({
      message: this.$t('common.message.info.appInitialize'),
      messageColor: 'primary text-h6',
      spinnerSize: 80, // in pixels
      spinnerColor: 'primary-darkened',
      backgroundColor: 'white',
    })
    try {
      await this.getUserDetailsAction()
      if (this.isMember) {
        await this.logoutAction()
        this.setNotification({
          title: this.$t('Common.Notification.Forbidden.Title'),
          message: this.$t('Common.Notification.Forbidden.Error.Message'),
          type: 'negative',
        })
      }
      await this.getAllCountriesAction()
      if (this.getSelectedFilters.countryID === null) {
        this.setFilterData({ countryID: this.getUserCountry })
      }
      await acl.aclRefresh({
        disable: this.aclModuleDisable,
        permissions: this.getUserPermissions,
        country: this.getSelectedFilters.countryID,
        schema: this.acl.schema,
        initial: true,
      })
      Loading.hide()
    } catch (error) {
      Loading.hide()
      await this.$router.push({ name: 'error' })
    }
    // Todo enable once implementation complete
    // this.schemaManagerEnable = this.schemaManagerModuleEnable
  },
  methods: {
    ...mapActions(['getUserDetailsAction', 'getAllCountriesAction', 'logoutAction']),
    ...mapMutations({
      setFilterData: 'SET_FILTER_DATA',
      setNotification: 'SHOW_NOTIFICATION',
    }),
  },
}
</script>
