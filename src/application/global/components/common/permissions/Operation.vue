<template>
  <div v-if="showAllOperationList" class="operation">
    {{ operation.label }}
  </div>
</template>
<script>
export default {
  name: 'Operation',
  props: {
    operation: {
      type: Object,
      required: true,
    },
    showAllOperationList: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
