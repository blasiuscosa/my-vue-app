<template>
  <q-inner-loading :showing="visible">
    <q-spinner color="primary-darkened" size="80px" :class="{ 'fixed-center': fixedCenter }" />
    {{ message }}
  </q-inner-loading>
</template>
<script>
export default {
  name: 'Loader',
  props: {
    fixedCenter: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
}
</script>
