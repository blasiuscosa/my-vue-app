<template>
  <q-dialog v-model="open[refs]" :maximized="$q.screen.lt.md || maximize" no-refocus @hide="beforeClose()">
    <q-card :style="style">
      <q-toolbar>
        <q-toolbar-title>
          {{ title }}
        </q-toolbar-title>
        <q-btn
          v-if="!form || closable"
          flat
          rounded
          color="action-button-negative"
          class="on-right"
          dense
          icon="close"
          @click="beforeClose()"
        />
      </q-toolbar>
      <q-separator v-if="title"></q-separator>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div v-if="subTitle" class="col-12">
            <div class="text-grey text-caption">{{ subTitle }}</div>
          </div>
          <div class="col-12">
            <slot name="modal-data" :prop="$props" />
          </div>
        </div>
        <Loader :visible="$wait.any" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { OpenCloseFormMixin } from 'src/application/global/mixins'
import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  name: 'BasicModal',
  mixins: [OpenCloseFormMixin],
  props: {
    urlResetPathName: {
      type: String,
    },
    noBackdropDismiss: {
      type: Boolean,
      default: true,
    },
    noEscDismiss: {
      type: Boolean,
      default: false,
    },
    maximized: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: String,
      default: '30vw',
    },
    minHeight: {
      type: String,
      default: '30vw',
    },
    maxWidth: {
      type: String,
      default: '30vw',
    },
    beforeCloseAction: {
      type: Function,
      required: false,
    },
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    autogrow: {
      type: Boolean,
      default: false,
    },
    maximize: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // Assign form related data from vuex store state
    ...mapState({
      errors: state => state.globalCMP.errors.data,
      openCloseModalForm: state => state.globalCMP.openCloseModalForm.modalData,
    }),
    style() {
      return this.$q.screen.gt.sm
        ? `min-width:  ${this.minWidth}; min-height: ${this.minHeight}; max-width: ${
            this.autogrow ? this.maxWidth : this.minWidth
          };`
        : ''
    },
  },
  methods: {
    // Declare vuex actions
    ...mapActions(['openCloseModalAction']),
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    beforeClose() {
      this.openCloseModal({ name: this.refs, status: false })
      if (this.urlResetPathName) {
        this.$router.push({ name: this.urlResetPathName })
      }
      if (typeof this.beforeCloseAction === 'function') {
        this.beforeCloseAction()
      }
    },
  },
}
</script>
