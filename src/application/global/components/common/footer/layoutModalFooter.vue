<template>
  <q-toolbar-title>
    <div class="col-md-12">
      <div class="row q-col-gutter-xs justify-end">
        <div class="col-md-auto col-xs-auto">
          <slot name="more-buttons-one" />
        </div>
        <div class="col-md-auto col-xs-auto">
          <slot name="more-buttons-two" />
        </div>
        <div v-if="buttonOne !== ''" class="col-md-auto col-xs-auto">
          <q-btn rounded unelevated color="primary" :loading="isLoading" @click="footerButtonOneAction">
            {{ buttonOne }}
          </q-btn>
        </div>
        <div v-if="buttonTwo !== ''" class="col-md-auto col-xs-auto">
          <q-btn rounded unelevated color="action-button-negative" @click="beforeClose">
            {{ buttonTwo }}
          </q-btn>
        </div>
      </div>
    </div>
  </q-toolbar-title>
</template>
<script>
export default {
  name: 'LayoutModalFooter',
  props: {
    buttonOne: {
      type: String,
      default: '',
    },
    buttonTwo: {
      type: String,
      default: '',
    },
    footerButtonOneAction: {
      type: Function,
      required: false,
    },
    beforeClose: {
      type: Function,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
