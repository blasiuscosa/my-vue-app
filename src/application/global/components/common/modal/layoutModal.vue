<template>
  <q-dialog
    v-model="open[refs]"
    no-refocus
    :maximized="$q.screen.lt.md || maximize"
    :persistent="persistent"
    :no-backdrop-dismiss="noBackdropDismiss"
    :no-esc-dismiss="noEscDismiss"
    @escape-key="beforeClose"
  >
    <q-layout view="Lhh lpR fff" container class="bg-white" :style="style">
      <q-header class="bg-white" bordered>
        <q-toolbar :class="classes" class="q-pa-md">
          <layout-modal-header
            :before-close="beforeClose"
            :title="title"
            :header-search-bar="headerSearchBar"
            :sub-title="subTitle"
          />
        </q-toolbar>
      </q-header>
      <q-footer class="bg-white q-py-md" bordered>
        <q-toolbar :class="classes" class="border-top q-pb-sm">
          <layout-modal-footer
            :before-close="beforeClose"
            :is-loading="isLoading"
            :footer-button-one-action="footerButtonOneTrigger"
            :button-one="footerButtonOne"
            :button-two="footerButtonTwo"
          />
        </q-toolbar>
      </q-footer>
      <q-page-container class="q-ma-md">
        <slot slot-scope="props" name="modal-data" />
      </q-page-container>
      <Loader :visible="$wait.any" />
    </q-layout>
  </q-dialog>
</template>
<script>
import layoutModalHeader from 'src/application/global/components/common/header/layoutModalHeader'
import layoutModalFooter from 'src/application/global/components/common/footer/layoutModalFooter'
import { OpenCloseFormMixin } from 'src/application/global/mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'LayoutModal',
  components: {
    layoutModalHeader,
    layoutModalFooter,
  },
  mixins: [OpenCloseFormMixin],
  props: {
    urlResetPathName: {
      type: String,
    },
    maximize: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: String,
      default: '50vw',
    },
    maxWidth: {
      type: String,
      default: 'unset',
    },
    minHeight: {
      type: String,
      default: '30vw',
    },
    maxHeight: {
      type: String,
    },
    noBackdropDismiss: {
      type: Boolean,
      default: true,
    },
    noEscDismiss: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: String,
      default: 'transparent text-black',
    },
    headerLine: {
      type: Boolean,
      default: true,
    },
    headerSearchBar: {
      type: Boolean,
      default: false,
    },
    footerButtonOne: {
      type: String,
    },
    footerButtonTwo: {
      type: String,
    },
    footerButtonOneAction: {
      type: Function,
      required: false,
    },
    footerButtonOneActionModalPersistent: {
      type: Boolean,
      default: false,
    },
    autogrow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    beforeCloseAction: {
      type: Function,
      required: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['getFormHasErrors']),
    style() {
      return this.$q.screen.gt.sm
        ? `min-width:  ${this.minWidth}; min-height: ${this.minHeight}; max-height: ${
            this.autogrow ? this.maxHeight : this.minHeight
          }; max-width: ${this.autogrow ? this.maxWidth : this.minWidth}`
        : ''
    },
    isPersistModal() {
      return this.footerButtonOneActionModalPersistent
    },
  },
  methods: {
    async footerButtonOneTrigger() {
      if (typeof this.footerButtonOneAction === 'function') {
        await this.footerButtonOneAction()
        if (!this.isPersistModal && !this.getFormHasErrors) {
          await this.openCloseModal({ name: this.refs, status: false })
        }
      } else {
        await this.beforeClose()
      }
    },
    async beforeClose() {
      this.openCloseModal({ name: this.refs, status: false })
      if (this.urlResetPathName) {
        await this.$router.replace({ name: this.urlResetPathName })
      }
      if (typeof this.beforeCloseAction === 'function') {
        await this.beforeCloseAction()
      }
    },
  },
}
</script>
