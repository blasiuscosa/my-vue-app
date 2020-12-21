<template>
  <div class="row q-col-gutter-sm">
    <div v-for="(field, index) in fields" :key="`field-${index}`" class="col-12">
      <q-input readonly :value="field.value" :label="field.label" hide-bottom-space dense outlined clearable />
    </div>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  name: 'RepopulatedReadonlyFields',
  props: {
    objects: {
      type: Object,
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    valueKey: {
      type: String,
      default: 'name',
    },
    appendLabelByKeys: {
      type: Array,
      default: () => ['code'],
    },
  },
  data() {
    return {
      fields: [],
    }
  },
  watch: {
    objects: {
      handler(items) {
        let regex = new RegExp(this.pattern, 'gi')
        _.reduce(items, (result, value, key) => this.processObject(result, value, key, regex), {})
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    processObject(result, value, key, regex) {
      if (key.match(regex)) {
        let replacedKey = key.replace(this.pattern, '')
        if (this.objects[replacedKey]) {
          let keyIndex = this.fields.findIndex(x => x.key === key)
          if (keyIndex === -1) {
            let appendLabel = []
            for (let appendKey of this.appendLabelByKeys) {
              if (this.$helpers.isSet(this.objects[replacedKey], appendKey, ['notNull', 'notEmpty'])) {
                appendLabel.push(this.$helpers.getValue(this.objects[replacedKey], appendKey, '') + '-')
              }
            }
            this.fields.push({
              key: key,
              label: this.$helpers.capitalize(replacedKey.replaceAll('_', ' ')),
              value:
                appendLabel.join('-') +
                this.$helpers.getValue(
                  this.objects[replacedKey],
                  this.valueKey,
                  this.$t('common.words.notAvailableShort')
                ),
            })
          }
        }
      }
    },
  },
}
</script>
