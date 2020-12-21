<template>
  <div class="row q-col-gutter-xs items-baseline">
    <div class="col-auto">
      <q-btn color="positive" flat dense size="xs" icon="content_copy" @click="doCopy">
        <q-tooltip>{{ $t('Common.Copy.Text') }}</q-tooltip>
      </q-btn>
    </div>
    <div class="col-auto cursor-pointer">
      {{ text }}
    </div>
    <div v-if="copied" class="col-auto text-body-1 text-positive animated flash">
      {{ $t('Common.Copied.Text') }}
    </div>
  </div>
</template>
<script>
export default {
  name: 'CopyText',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    copied: false,
  }),
  methods: {
    doCopy: function() {
      this.$copyText(this.text).then(() => {
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 3000)
      })
    },
  },
}
</script>
