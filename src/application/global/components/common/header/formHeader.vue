<template>
  <div class="row wrap items-center justify-between">
    <!--Left Action buttons-->
    <div class="col-md-auto col-12">
      <div class="row q-mb-sm" :class="placementLeft">
        <slot name="left-side" />
        <standard-breadcrumb />
      </div>
    </div>
    <!--Right action buttons-->
    <div v-if="!isLoading" class="col-md-auto col-12">
      <div class="row q-col-gutter-sm q-mb-sm" :class="placementRight">
        <slot name="right-side" />
        <div v-if="buttonCustomActionActions && showCustomActionButton" class="col-auto">
          <q-btn
            v-shortkey="['ctrl', 'alt', 'd']"
            :label="buttonCustomActionCaption ? buttonCustomActionCaption : $t('common.button.delete')"
            class="fit"
            :icon="buttonCustomActionIcon"
            color="action-button-warning"
            unelevated
            rounded
            @shortkey.native="performCustomAction"
            @click="performCustomAction"
          />
        </div>
        <div v-show="!hideSubmit && buttonOneVisibility" class="col-auto">
          <!--submit(false) prevent form from redirect to listing-->
          <q-btn
            v-shortkey="['ctrl', 'alt', 's']"
            :label="buttonOneCaption"
            class="fit"
            :icon="buttonOneIcon"
            :disable="disableSubmit"
            color="action-button-success"
            unelevated
            rounded
            @shortkey.native="submit(false)"
            @click="submit(false)"
          />
        </div>
        <div v-show="!hideSubmit && buttonTwoVisibility" class="col-auto">
          <!--submit(true) allow form redirect to listing-->
          <q-btn
            v-shortkey="['ctrl', 'alt', 'q']"
            :label="buttonTwoCaption"
            class="fit"
            :icon="buttonTwoIcon"
            :disable="disableSubmit"
            color="action-button-success"
            unelevated
            rounded
            @shortkey.native="submit(true)"
            @click="typeof buttonTwoAction == 'function' ? buttonTwoAction() : submit(true)"
          />
        </div>
        <div v-show="buttonThreeVisibility" class="col-auto">
          <q-btn
            v-shortkey="['ctrl', 'alt', 'c']"
            :label="buttonThreeCaption"
            class="fit"
            :icon="buttonThreeIcon"
            color="action-button-negative"
            unelevated
            rounded
            @shortkey.native="beforeClose()"
            @click="beforeClose()"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Platform } from 'quasar'
import StandardBreadcrumb from 'src/application/global/components/common/breadcrumbs/standardBreadcrumb'
import { FormCustomActionMixin } from 'src/application/global/mixins'
import { mapState } from 'vuex'

export default {
  name: 'HeaderForm',
  components: {
    StandardBreadcrumb,
  },
  mixins: [FormCustomActionMixin],
  computed: {
    ...mapState({
      route: state => state.route,
    }),
    placementLeft() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'gutter-sm justify-start items-baseline'
      } else {
        return 'gutter-sm justify-between'
      }
    },
    placementRight() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'gutter-sm justify-end items-baseline'
      } else {
        return 'justify-start'
      }
    },
    showCustomActionButton() {
      return this.$helpers.getValue(this.buttonCustomActionActions, 'show')
    },
  },
  props: {
    formTitle: {
      type: String,
    },
    formName: {
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
    disableSubmit: {
      type: Boolean,
      default: false,
    },
    hideSubmit: {
      type: Boolean,
      default: false,
    },
    buttonOneCaption: {
      type: String,
    },
    buttonOneIcon: {
      type: String,
    },
    buttonOneVisibility: {
      type: Boolean,
    },
    buttonTwoCaption: {
      type: String,
    },
    buttonTwoIcon: {
      type: String,
    },
    buttonTwoVisibility: {
      type: Boolean,
    },
    buttonTwoAction: {
      type: Function,
    },
    buttonThreeCaption: {
      type: String,
    },
    buttonThreeIcon: {
      type: String,
    },
    buttonThreeVisibility: {
      type: Boolean,
    },
    buttonCustomActionCaption: {
      type: String,
    },
    buttonCustomActionIcon: {
      type: String,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    buttonCustomActionActions: {
      type: Object,
    },
  },
  methods: {
    async performCustomAction() {
      await this.customAction(this.buttonCustomActionActions)
    },
  },
}
</script>
