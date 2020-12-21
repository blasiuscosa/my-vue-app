<template>
  <div class="builder-holder relative-positions" style="overflow: scroll;">
    <q-resize-observer :debounce="600" @resize="updateStickStyleData" />
    <div class="row no-wrap" style="position: relative;" :style="stickyStyle">
      <div
        v-for="(role, index) in getUpdatedRoles"
        :key="`main-${index}`"
        class="q-card--bordered"
        :class="[
          $helpers.isSet(role, 'is_empty') ? 'col-md-2 col-6 full-height' : 'col-md-3 col-12',
          index === 0 ? 'sticky-horizontal-div-left' : '',
        ]"
      >
        <div class="roles-holder">
          <div class="row no-wrap justify-between">
            <role class="bg-grey-1 text-primary-darkened text-subtitle2" :role="role" />
          </div>
        </div>
        <div class="module-holder bg-white relative-positions fit">
          <div class="row q-pa-sm fit">
            <module
              v-for="(module, index) in modules"
              :key="`module-${index}`"
              :role="role"
              :module="module"
              :is-placeholder="$helpers.isSet(role, 'is_empty')"
              :permissions="getBuilderRolePermissionByID(role.id)"
              :update-call-back="updateCallBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Role from 'src/application/global/components/common/permissions/Role'
import Module from 'src/application/global/components/common/permissions/Module'
import Operation from 'src/application/global/components/common/permissions/Operation'
import { gLoader } from 'src/application/global/components'
import { dom } from 'quasar'
import { mapGetters, mapState } from 'vuex'

const { height, width } = dom

export default {
  name: 'Builder',
  components: {
    Role,
    Module,
    Operation,
    gLoader,
  },
  props: {
    roles: {
      type: Array,
      required: true,
    },
    modules: {
      type: Array,
      required: true,
    },
    operations: {
      type: Array,
      default: () => [],
    },
    showAllOperationList: {
      type: Boolean,
      default: false,
    },
    updateCallBack: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    stickyStyle: {
      paddingLeft: 0,
    },
    localRoles: [],
  }),
  updated() {
    this.updateStickStyleData()
    $('.builder-holder').scroll(function() {
      $(this)
        .find('.sticky-horizontal-div-left')
        .css('left', $(this).scrollLeft())
    })
  },
  computed: {
    ...mapGetters(['getBuilderRolePermissionByID']),
    ...mapState({
      isProcessingForm: state => state.globalCMP.isProcessingForm,
    }),
    getUpdatedRoles() {
      /** Add empty role to create empty module placeholders **/
      if (this.roles.length > 0) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.localRoles = [...this.roles]
        let emptyRole = {
          is_empty: true,
        }
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.localRoles.unshift(emptyRole)
      }
      return this.localRoles
    },
  },
  methods: {
    updateStickStyleData() {
      this.$nextTick(() => {
        this.stickyStyle.paddingLeft = width(this.$el.querySelector('.sticky-horizontal-div-left')) + 'px'
      })
    },
  },
}
</script>
