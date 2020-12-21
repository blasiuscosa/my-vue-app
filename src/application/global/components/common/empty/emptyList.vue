<template>
  <div class="row empty-list text-center justify-center items-center text-grey-5 bg-img-cube">
    <div class="col-md-auto">
      <slot />
      <div class="text-h2">
        <q-icon name="error_outline" :color="fontColor" />
      </div>
      <div class="q-pb-sm" :class="`text-${fontColor}`">{{ message || $t('general.noData.label') }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EmptyList',
  props: {
    message: {
      type: String,
    },
    fontColor: {
      type: String,
      default: '',
    },
  },
}
</script>
