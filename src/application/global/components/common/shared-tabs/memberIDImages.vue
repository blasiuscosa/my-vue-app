<template>
  <div class="image-tab">
    <div class="row justify-center">
      <div v-for="(image, index) in memberData.verification" :key="index" class="col-md-3 col-xs-12 shadow-1 q-ma-md">
        <div class="row justify-end bg-grey-1">
          <div class="col-auto">
            <q-btn :disable="lockMemberData" color="negative" flat @click="removeUploadedImage(image, index)">
              <q-icon name="delete" />
            </q-btn>
          </div>
          <div class="col-auto fit">
            <default-image-viewer :src="image.image_link" />
          </div>
        </div>
      </div>
      <div
        class="col-md-12 col-xs-12 cursor-pointer"
        @click="!lockMemberData ? openCloseModal({ name: 'memberImageUploader', status: true }) : ''"
      >
        <q-card flat class="bigger q-ma-xs fit">
          <q-card-section class="fit">
            <q-field
              hide-bottom-space
              borderless
              class="q-mb-md"
              :error="$helpers.getValue(validation, 'verification.$error')"
            >
              <template slot="control">
                <div class="row fit justify-center">
                  <div class="text-grey-4 self-center">
                    <span class="text-h2">
                      <q-icon name="add" />
                    </span>
                    <div class="text-caption text-center">
                      Upload
                    </div>
                  </div>
                </div>
              </template>
            </q-field>
          </q-card-section>
        </q-card>
      </div>
      <div v-show="false" class="col-md-12 col-xs-12 mt-20">
        <div class="row">
          <div class="col-md-4">
            <span>Uploaded Date: {{ memberData.verification.uploaded_date }}</span>
          </div>
          <div class="col-md-4">
            <span>Last Verified Date: {{ memberData.verification.latest_verified_date }}</span>
          </div>
          <div v-if="memberData.verification.latest_verified_by" class="col-md-4">
            <span>Last Verified By: {{ memberData.verification.latest_verified_by.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <basic-modal refs="memberImageUploader" :title="$t('members.imageUploader.label')">
      <template slot="modal-data" slot-scope="props">
        <generalUploader
          v-model="memberData.images"
          :types="types"
          :float-label="$t('members.uploadVerificationDocs.label')"
          :multiple="true"
          :upload-callback="uploadImages"
          uploader-file-type="member_ic_passport"
        />
      </template>
    </basic-modal>
  </div>
</template>
<script>
import DefaultImageViewer from '../images/DefaultImageViewer'
import GeneralUploader from '../uploads/uploader'
import basicModal from 'src/application/global/components/common/modal/basicModal'
import { mapMutations } from 'vuex'

export default {
  name: 'ImageTab',
  components: {
    GeneralUploader,
    DefaultImageViewer,
    basicModal,
  },
  props: {
    memberData: {
      type: Object,
      required: true,
    },
    lockMemberData: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
    },
  },
  data: () => ({
    color: 'dark',
    types: [
      {
        label: 'Upload Photo',
        ref: 'memberImageUploader',
      },
    ],
    defaultText: 'Default',
    defaultImgColor: 'faded',
    defaultImg: false,
    showUpload: false,
    imageData: [],
  }),
  methods: {
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    uploadImages: function(file, res) {
      let imgStr = JSON.parse(res.response)
      if (imgStr) {
        this.memberData.verification.push({
          type: 'IC',
          user_id: this.memberData.details.user_id,
          image_path: imgStr.name,
          image_link: imgStr.link,
        })
      }
    },
    removeUploadedImage(img, index) {
      this.memberData.verification.splice(index, 1)
    },
  },
}
</script>
