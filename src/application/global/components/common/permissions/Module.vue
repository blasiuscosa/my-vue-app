<template>
  <div class="col-12">
    <div class="parent-module-holder">
      <div
        v-if="isPlaceholder"
        class="border-bottom text-weight-medium q-mt-sm"
        :class="{ 'q-ml-sm text-primary': isChildModule }"
      >
        <q-icon v-if="isChildModule" name="subdirectory_arrow_right" />
        {{ module.label }}
      </div>
      <div v-else>
        <div class="row justify-start border-bottom">
          <div v-for="(permission, index) in module.permissions" class="col-4 height-25">
            <q-checkbox
              :key="`permission-${index}`"
              v-model="localPermissions"
              :label="permission.operation.name"
              color="primary"
              :val="permission.id"
              size="xs"
              @input="preRoleUpdate"
            />
            <q-tooltip :delay="500">
              {{ module.label }}
            </q-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div v-if="$helpers.getValue(module, 'childs', []).length > 0" class="child-module-holder">
      <module
        v-for="(childModule, index) in module.childs"
        :key="`child-module-${index}`"
        :role="role"
        :module="childModule"
        :is-child-module="true"
        :is-placeholder="$helpers.isSet(role, 'is_empty')"
        :permissions="permissions"
        :update-call-back="updateCallBack"
      />
    </div>
  </div>
</template>
<script>
import Module from 'src/application/global/components/common/permissions/Module'
import { extend } from 'quasar'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Module',
  components: {
    Module,
  },
  props: {
    role: {
      type: Object,
      required: false,
    },
    module: {
      type: Object,
      required: true,
    },
    permissions: {
      type: [Array, Boolean],
      default: false,
    },
    isPlaceholder: {
      type: Boolean,
      default: false,
    },
    isChildModule: {
      type: Boolean,
      default: false,
    },
    updateCallBack: {
      type: Function,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['getBuilderRolePermissionByID']),
    localPermissions: {
      set: function(value) {
        this.setBuilderRolePermissions({ id: this.role.id, permissions: { ids: value } })
      },
      get: function() {
        return this.getBuilderRolePermissionByID(this.role.id)
      },
    },
  },
  methods: {
    ...mapActions(['setBuilderRolePermissions']),
    preRoleUpdate() {
      let role = extend(true, {}, this.role)
      role.permissions.ids = [...this.localPermissions]
      this.updateCallBack(role)
    },
  },
}
</script>
