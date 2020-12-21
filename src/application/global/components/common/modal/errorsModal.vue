<template>
  <q-dialog v-model="open[refs]" @escape-key="beforeClose" @hide="beforeClose">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>Attention Required</q-toolbar-title>
        <q-btn
          v-if="!disableClose"
          flat
          rounded
          color="negative"
          class="on-right"
          dense
          icon="close"
          @click="beforeClose"
        />
      </q-toolbar>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <div class="row q-col-gutter-sm">
              <div class="col-md-12">
                <div v-if="customErrorMessageText" class="row">
                  <div class="col-12 text-center">
                    {{ customErrorMessageText }}
                  </div>
                </div>
              </div>
              <div class="col-md-12">
                <div v-for="error in errors">
                  <div v-if="typeof error === 'object'" class="object">
                    <div v-for="(item, key) in error">
                      <div v-if="key !== 'file' && key !== 'line'" class="row items-baseline q-col-gutter-sm no-wrap">
                        <div class="col-auto error-icon">
                          <q-icon size="25px" color="negative" name="error_outline" />
                        </div>
                        <div class="col-auto error-msg">
                          {{ item }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="typeof error === 'string'" class="string">
                    <div class="row items-baseline q-col-gutter-sm no-wrap">
                      <div class="col-auto error-icon">
                        <q-icon size="25px" color="negative" name="error_outline" />
                      </div>
                      <div class="col-auto error-msg">
                        {{ error }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { OpenCloseFormMixin } from 'src/application/global/mixins'
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'ErrorsModal',
  mixins: [OpenCloseFormMixin],
  props: {
    maxWidth: {
      type: String,
      default: '65vw',
    },
    minWidth: {
      type: String,
      default: '50vw',
    },
    minHeight: {
      type: String,
      default: '30vw',
    },
    backdropDismiss: {
      type: Boolean,
      default: false,
    },
    maximized: {
      type: Boolean,
      default: false,
    },
    urlResetPathName: {
      type: String,
    },
    customErrorMessageText: {
      type: String,
    },
    disableClose: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      errors: state => state.globalCMP.errors.data.errors,
    }),
  },
  methods: {
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    async beforeClose() {
      this.openCloseModal({ name: this.refs, status: false })
      if (this.callback) {
        this.$emit('callback', this.callback)
      }
      if (this.urlResetPathName) {
        await this.$router.push({ name: this.urlResetPathName })
      }
    },
  },
}
</script>
