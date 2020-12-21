<template>
  <div class="text-weight-light text-caption text-grey-5" :class="classes">
    {{ getProductName }} {{ $t('Common.Veriosn.Text') }} :: {{ version }}
  </div>
</template>
<script>
import { productName, version } from '../../../../../../package.json'
export default {
  name: 'AppVersion',
  props: {
    classes: {
      type: String,
    },
    hideProductName: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    version,
    productName,
  }),
  computed: {
    getProductName() {
      return !this.hideProductName ? `${productName} :: ` : ''
    },
  },
}
</script>
