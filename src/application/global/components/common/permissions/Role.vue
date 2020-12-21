<template>
  <div class="col-12 q-card--bordered">
    <div class="row items-center">
      <div class="col-12" style="height: 50px">
        <div v-if="!$helpers.isSet(role, 'is_empty')" class="ellipsis-2-lines" :title="role.label">
          {{ role.label }}
        </div>
        <div v-else>&nbsp;{{ $t('Common.Modules.Text') }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'vuex'

export default {
  name: 'RoleCmp',
  props: {
    role: {
      type: Object,
      required: true,
    },
  },
  async mounted() {
    await this.setBuilderRolePermissions(this.role)
  },
  methods: {
    ...mapActions(['getOperationsAction', 'setBuilderRolePermissions']),
  },
}
</script>
