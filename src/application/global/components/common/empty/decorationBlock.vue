<template>
  <div class="col-6 desktop-only gt-sm">
    <div class="empty-list text-center text-grey-3 bg-img-cube full-height">
      <div class="row content-center full-height">
        <slot />
        <div class="col-12 content vertical-bottom">
          <div class="text-h1">
            <q-icon :name="iconName" :color="fontColor" />
          </div>
          <small :class="`text-${fontColor}`">{{ message || $t('general.noData.label') }}</small>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DecorationBlock',
  props: {
    message: {
      type: String,
      default: 'Report Area',
    },
    iconName: {
      type: String,
      default: 'print',
    },
    fontColor: {
      type: String,
      default: 'grey-2',
    },
  },
}
</script>
