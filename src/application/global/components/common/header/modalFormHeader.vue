<template>
  <div class="row wrap items-center q-mb-md">
    <!--Left Action buttons-->
    <div class="col-md-6 col-xs-12">
      <div class="row" :class="placementLeft">
        <slot name="left-side" />
        <div class="text-h6">
          {{ formTitle }}
        </div>
      </div>
    </div>
    <!--Right action buttons-->
    <div class="col-md-6 col-xs-12">
      <div class="row" :class="placementRight">
        <slot name="right-side" />
        <div class="col-md-auto col-xs-auto">
          <!--submit(false) prevent form from redirect to listing-->
          <q-btn
            v-shortkey="['ctrl', 'alt', 's']"
            icon="done"
            glossy
            size="sm"
            color="positive"
            @shortkey.native="submit(autoClose)"
            @click="submit(autoClose)"
          >
            {{ buttonTitleCaption }}
          </q-btn>
        </div>
        <div class="col-md-auto col-xs-auto">
          <q-btn
            v-shortkey="['ctrl', 'alt', 'c']"
            icon="clear"
            glossy
            size="sm"
            color="negative"
            @shortkey.native="beforeClose()"
            @click="beforeClose()"
          >
            {{ $t('Common.Cancel.Btn') }}
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Platform } from 'quasar'

export default {
  name: 'ModalHeaderForm',
  props: {
    formTitle: {
      type: String,
    },
    formName: {
      type: String,
      required: true,
    },
    buttonTitleCaption: {
      type: String,
      required: true,
    },
    submit: {
      type: Function,
      required: true,
    },
    resetForm: {
      type: Function,
      required: true,
    },
    beforeClose: {
      type: Function,
      required: true,
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    placementLeft() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'gutter-sm justify-start items-baseline header-row-mb'
      } else {
        return 'gutter-sm justify-between header-row-mb'
      }
    },
    placementRight() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'gutter-sm justify-end items-baseline header-row-mb'
      } else {
        return 'justify-between header-row-mb'
      }
    },
  },
}
</script>

<style>
.header-row-mb {
  margin-bottom: 10px;
}
</style>
