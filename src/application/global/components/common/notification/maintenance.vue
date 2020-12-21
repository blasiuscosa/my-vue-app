<template>
  <div class="maintenance light-dimmed">
    <div class="message absolute-center text-center z-max text-negative">
      <q-icon class="text-h1" name="feedback" />
      <p>{{ $t('Common.ModuleUnderMaintenance.Text') }}</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Maintenance',
}
</script>
