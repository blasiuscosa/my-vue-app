<template>
  <div class="holder">
    <q-inner-loading dark>
      <q-spinner-tail :size="50" color="white" />
      <div class="q-pa-md text-white">
        {{ $t('operation.progress') }}
      </div>
    </q-inner-loading>
  </div>
</template>
<script>
export default {
  name: 'Connector',
  mounted() {
    setTimeout(() => {
      this.$router.push({ name: 'Admin' })
    }, 1500)
  },
}
</script>
