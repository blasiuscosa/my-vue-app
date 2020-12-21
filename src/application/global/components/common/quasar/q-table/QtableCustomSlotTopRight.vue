<template>
  <div class="row q-col-gutter-xs items-center justify-end">
    <div class="col-md-auto">
      <slot name="top-actions"></slot>
    </div>
    <div class="col-md-auto">
      <q-select
        hide-bottom-space
        options-dense
        dense
        emit-value
        map-options
        outlined
        color="primary"
        :value="visibleColumns"
        :options="columns"
        option-value="name"
        multiple
        :display-value="$q.lang.table.columns"
        option-disable="required"
        @input="value => $emit('update:visibleColumns', value)"
      />
    </div>
    <div class="col-md-auto">
      <q-select
        hide-bottom-space
        options-dense
        dense
        emit-value
        map-options
        outlined
        color="primary"
        :value="separator"
        :options="appSettings.defaulted.table_separators.options"
        @input="value => $emit('update:separator', value)"
      />
    </div>
    <div class="col-md-auto">
      <q-btn
        flat
        round
        dense
        :icon="slotProps.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="slotProps.toggleFullscreen"
      />
    </div>
    <div class="col-md-auto">
      <slot name="bottom-actions"></slot>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'QtableCustomSlotTopRight',
  props: {
    slotProps: {
      type: Object,
    },
    columns: {
      type: Array,
    },
    visibleColumns: {
      type: Array,
    },
    separator: {
      type: String,
    },
  },
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
  },
}
</script>
