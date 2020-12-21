<template>
  <div class="row">
    <div v-if="address && address.fields.length > 0" class="col-12">
      <p v-if="showTitle" class="q-subtitle">
        {{ address.title }}
      </p>
      <div class="row q-col-gutter-sm">
        <div v-for="(field, index) in address.fields" :key="field.label" class="col-12">
          <q-input
            v-if="field.type === 'input'"
            v-model.trim="field.value"
            hide-bottom-space
            dense
            outlined
            :label="field.label"
            :error="field.required ? $v.address.fields.$each[index].value.$invalid : false"
            :error-message="field.helper !== '' ? field.helper : 'Required Field'"
            class="text-capitalize,q-mb-sm"
            clearable
            @input="$v.address.fields.$each[index].value.$touch"
          />
          <q-select
            v-if="field.type === 'select' || (field.type === 'custom-select' && field.type !== 'masters-select')"
            v-model="field.value"
            class="required"
            :label="field.label"
            hide-bottom-space
            options-dense
            dense
            emit-value
            map-options
            outlined
            clearable
            :error="field.required ? $v.address.fields.$each[index].value.$invalid : false"
            :error-message="field.helper !== '' ? field.helper : 'Required Field'"
            :options="setDynamicFieldKeyOptionsData(address, field.key, optionFilters)"
            @input="fieldOnChange(address, field.key, field.value)"
          />
          <q-select
            v-if="field.type === 'masters-select'"
            v-model="field.value"
            class="required"
            :label="field.label"
            hide-bottom-space
            options-dense
            dense
            emit-value
            map-options
            outlined
            clearable
            :disable="true"
            :error="field.required ? $v.address.fields.$each[index].value.$invalid : false"
            :error-message="field.helper !== '' ? field.helper : 'Required Field'"
            :readonly="!address.title.includes('Custom')"
            :options="setDynamicFieldKeyOptionsData(address, field.key, optionFilters)"
            @input="$v.address.fields.$each[index].value.$touch"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import addressMixinNew from 'src/application/global/mixins/addressMixinNew'
export default {
  name: 'ShippingAddress',
  mixins: [addressMixinNew],
  props: {
    address: {
      type: [Object, Boolean],
    },
    showTitle: {
      type: Boolean,
      default: false,
    },
    optionFilters: {
      type: Object,
      default: () => ({}),
    },
  },
  validations: {
    address: {
      fields: {
        $each: {
          value: {
            check(val, elm) {
              if (elm.required || elm.min) {
                if (elm.value === '' || elm.value === null) {
                  return false
                }
              }
              return true
            },
          },
        },
      },
    },
  },
  methods: {
    async fieldOnChange(address, key, value) {
      this.$emit('fieldOnChange', { address: address, key: key, value: value })
    },
    async validate() {
      // Validating component
      return await new Promise(resolve => {
        this.$v.$touch()
        resolve(this.$v.$error)
      })
    },
  },
}
</script>
