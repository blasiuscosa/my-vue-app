<template>
  <div>{{ currentTimeStamp }}</div>
</template>
<script>
import { DatesMixin } from 'src/application/global/mixins/index'

export default {
  name: 'SimpleClock',
  mixins: [DatesMixin],
  data: () => ({
    currentTimeStamp: '',
  }),
  mounted() {
    setInterval(this.updateDateTime, 1000)
  },
  methods: {
    updateDateTime() {
      this.currentTimeStamp = this.getGMTDateTime()
    },
  },
}
</script>
