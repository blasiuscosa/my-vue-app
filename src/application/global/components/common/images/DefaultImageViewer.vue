<template>
  <div class="image-area">
    <div class="row">
      <div
        class="col-12 single-image image-block relative-position"
        :class="{ 'cursor-pointer': !imageHasError }"
        @click="openPreviewer"
      >
        <q-img :src="src" :ratio="4 / 3" class="q-mt-md" @error="imageHasError = !imageHasError">
          <template v-slot:error>
            <div class="absolute-full flex flex-center">
              <info
                stacked
                icon="broken_image"
                icon-size="3.5rem"
                icon-color="white"
                :message="$t('Common.BrokenImage.Text')"
              ></info>
            </div>
          </template>
        </q-img>
        <div v-if="!imageHasError" class="overlay absolute-center">
          <div class="row justify-center items-center fit q-pa-sm">
            <div class="col-auto">
              <h4>
                <q-icon color="white" name="zoom_in" />
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    <LayoutModal
      :refs="`imageModal-${unique}`"
      :no-esc-dismiss="false"
      :no-backdrop-dismiss="false"
      :footer-button-one="$t('Common.RotateImage.Btn')"
      :footer-button-two="$t('Common.Close.Btn')"
      :footer-button-one-action="makeImageRotation"
      :footer-button-one-action-modal-persistent="true"
      :before-close-action="resetImageRotation"
      :title="$t('Common.ImageViewer.Title')"
    >
      <template slot="modal-data" slot-scope="props">
        <!-- Todo Temp img plugin change after quasar v1 upgrade -->
        <div :class="`rotate-${degree}`">
          <div class="row">
            <div class="col-12 text-center">
              <q-img :src="src" contain :ratio="1">
                <template v-slot:error>
                  <div class="absolute-full flex flex-center">
                    <info
                      stacked
                      icon="broken_image"
                      icon-size="3.5rem"
                      icon-color="white"
                      :message="$t('Common.BrokenImage.Text')"
                    ></info>
                  </div>
                </template>
              </q-img>
            </div>
          </div>
        </div>
      </template>
    </LayoutModal>
  </div>
</template>
<script>
import { LayoutModal } from 'src/application/global/components/common/modal'
import { uid } from 'quasar'
import { mapMutations } from 'vuex'
import Info from '../elements/info'

export default {
  name: 'DefaultImageViewer',
  components: {
    Info,
    LayoutModal,
  },
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    unique: uid(),
    degree: 0,
    degrees: [90, 180, 275],
    noImage: require('assets/no-image.png'),
    imageHasError: false,
  }),
  methods: {
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    openPreviewer() {
      if (!this.imageHasError) {
        this.openCloseModal({ name: `imageModal-${this.unique}`, status: true })
      }
    },
    makeImageRotation() {
      let val = this.degree
      for (let degree of this.degrees) {
        if (degree > val) {
          this.degree = degree
          break
        } else {
          this.degree = 0
        }
      }
    },
    resetImageRotation() {
      this.degree = 0
    },
  },
}
</script>
