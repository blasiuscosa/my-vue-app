<template>
  <div>
    <!-- Playground for quasar-eslint upgrade -->
    {{ $t('Common.Text1') }}
    {{ $t('Common.Text2') }}
  </div>
</template>
<script>
export default {
  validations: {
    /** Test */
  },
  data: () => ({
    test: '',
  }),
  computed: {
    getTrans() {
      return this.$t('Common.Code.Test')
    },
  },
  methods: {
    /** Test */
    test() {
      return this.$t('Common.Method.1')
    },
    test2() {
      this.setNotification({
        title: this.$t('sale.order.detail.notification.salesConversionFailed.title'),
        message: this.$t('sale.order.detail.notification.salesConversionFailed.message'),
        type: 'negative',
      })
      return this.$t('Common.Method.2')
    },
  },
}
</script>
