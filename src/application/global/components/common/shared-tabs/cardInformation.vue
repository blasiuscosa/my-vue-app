<template>
  <div class="rental-card-detail-tab">
    <div
      v-if="
        rental_card_detail.rental_card_data !== '' &&
          rental_card_detail.rental_card_data.recurring_info !== undefined &&
          rental_card_detail.rental_card_data.recurring_info.length > 0
      "
      class="row q-col-gutter-sm"
    >
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-btn-group outline color="grey-7">
              <template v-for="(type, index) in rental_card_detail.rental_card_data.recurring_info">
                <q-btn
                  :key="`btn-${index}`"
                  color="primary"
                  size=".9rem"
                  rounded
                  unelevated
                  :label="type.title"
                  :icon-right="
                    rental_card_detail.rental_card_data.selected === type.id ? 'check_circle' : 'radio_button_unchecked'
                  "
                  @click="setCardType(type.id)"
                />
              </template>
            </q-btn-group>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-12">
        <div class="row">
          <template v-for="(row, rowIndex) in rental_card_detail.rental_card_data.recurring_info">
            <div v-show="row.id === rental_card_detail.rental_card_data.selected" class="col-12">
              <div class="row q-col-gutter-sm">
                <template v-for="(field, fieldIndex) in sortDynamicFields(row.fields)">
                  <div class="dynamic-field col-12">
                    <q-input
                      v-if="field.type === 'input'"
                      v-model.trim="
                        field.autofill !== undefined &&
                        rental_card_detail.rental_card_data.recurring_info[rowIndex].fields[
                          setDynamicFieldIndex(
                            rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                            field.index
                          )
                        ].value === '' &&
                        !isFieldInEditState(field.index)
                          ? getAutoFill(field.autofill, rowIndex, field.index)
                          : rental_card_detail.rental_card_data.recurring_info[rowIndex].fields[
                              setDynamicFieldIndex(
                                rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                                field.index
                              )
                            ].value
                      "
                      hide-bottom-space
                      dense
                      outlined
                      :label="field.label"
                      :error="
                        field.required
                          ? validation.rental_card_detail.rental_card_data.recurring_info.$each[rowIndex].fields.$each[
                              setDynamicFieldIndex(
                                rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                                field.index
                              )
                            ].$error
                          : false
                      "
                      class=""
                      :readonly="lockData"
                      :type="field.input_type ? field.input_type : 'text'"
                      @input="
                        validation.rental_card_detail.rental_card_data.recurring_info.$each[rowIndex].fields.$each[
                          setDynamicFieldIndex(
                            rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                            field.index
                          )
                        ].$touch
                      "
                    />
                    <q-btn
                      v-if="field.autofill !== undefined && !field.readonly"
                      class="q-mt-xs"
                      color="amber"
                      outline
                      :label="isFieldInEditState(field.index) ? 'Done' : 'Edit'"
                      @click="setEditAutoFill(field.index)"
                    />
                    <q-select
                      v-if="
                        field.type === 'select' || (field.type === 'custom-select' && field.type !== 'masters-select')
                      "
                      v-model="
                        rental_card_detail.rental_card_data.recurring_info[rowIndex].fields[
                          setDynamicFieldIndex(
                            rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                            field.index
                          )
                        ].value
                      "
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      :readonly="lockData"
                      :label="field.label"
                      :options="
                        field.options
                          ? field.options
                          : setDynamicFieldKeyOptionsData(field.key, field.identifier, rowIndex, fieldIndex)
                      "
                      @input="
                        field.required
                          ? validation.rental_card_detail.rental_card_data.recurring_info.$each[rowIndex].fields.$each[
                              setDynamicFieldIndex(
                                rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                                field.index
                              )
                            ].$touch
                          : false
                      "
                    />
                    <q-select
                      v-if="field.type === 'master-select'"
                      v-model="
                        rental_card_detail.rental_card_data.recurring_info[rowIndex].fields[
                          setDynamicFieldIndex(
                            rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                            field.index
                          )
                        ].value
                      "
                      :label="field.label"
                      hide-bottom-space
                      options-dense
                      dense
                      emit-value
                      map-options
                      outlined
                      :readonly="lockData"
                      :options="field.options ? field.options : masterDataOptionsCreator(field.identifier)"
                      @input="
                        validation.rental_card_detail.rental_card_data.recurring_info.$each[rowIndex].fields.$each[
                          setDynamicFieldIndex(
                            rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                            field.index
                          )
                        ].$touch
                      "
                    />
                    <div v-if="field.type === 'file-input'">
                      <div class="row justify-start q-col-gutter-sm">
                        <div
                          v-for="(image, imageIndex) in rental_card_detail.rental_card_data.recurring_info[rowIndex]
                            .fields[
                            setDynamicFieldIndex(
                              rental_card_detail.rental_card_data.recurring_info[rowIndex].fields,
                              field.index
                            )
                          ].value"
                          :key="imageIndex"
                          class="col-4"
                        >
                          <div class="wrap shadow-1">
                            <div class="row justify-end bg-grey-1">
                              <div class="col-auto">
                                <q-btn
                                  :disable="lockData"
                                  color="grey-4"
                                  flat
                                  @click="removeUploadedImage(image, imageIndex, rowIndex, field.index)"
                                >
                                  <q-icon name="delete" />
                                </q-btn>
                              </div>
                            </div>
                            <div class="row">
                              <div class="col-12">
                                <default-image-viewer :src="image.url ? image.url : image.link" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-4">
                          <q-card
                            v-if="!lockData"
                            flat
                            class="bigger q-ma-xs fit cursor-pointer"
                            @click.native="showImageUploader(field.index, rowIndex)"
                          >
                            <q-card-section class="fit">
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
                            </q-card-section>
                          </q-card>
                        </div>
                        <layout-modal
                          :refs="`cardImageUploader-${rowIndex}`"
                          :title="$t('members.imageUploader.label')"
                          min-width="50vw"
                          min-height="80vh"
                          footer-button-two="Close"
                          classes="transparent text-black manager"
                        >
                          <template slot="modal-data" slot-scope="props">
                            <generalUploader
                              v-model="
                                rental_card_detail.rental_card_data.recurring_info[selectedIndex].fields[
                                  setDynamicFieldIndex(
                                    rental_card_detail.rental_card_data.recurring_info[selectedIndex].fields,
                                    field.index
                                  )
                                ].value
                              "
                              :types="types"
                              :float-label="$t('rental.cardDetail.uploadCards.label')"
                              color="grey-7"
                              :multiple="true"
                              :call-back-additional-data="{ index: rowIndex }"
                              :upload-callback="uploadImages"
                              uploader-file-type="rental_card"
                            />
                          </template>
                        </layout-modal>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <empty-list v-else :message="$t('general.noData.label')" />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import layoutModal from 'src/application/global/components/common/modal/layoutModal'
import generalUploader from 'src/application/global/components/common/uploads/uploader'
import emptyList from 'src/application/global/components/common/empty/emptyList'
import { GeneralsMixin, MasterDataTransformarMixin } from 'src/application/global/mixins/index'
import { DefaultImageViewer } from 'src/application/global/components'

export default {
  name: 'CardInformation',
  components: {
    layoutModal,
    generalUploader,
    emptyList,
    DefaultImageViewer,
  },
  mixins: [MasterDataTransformarMixin, GeneralsMixin],
  props: {
    // eslint-disable-next-line vue/prop-name-casing
    rental_card_detail: {
      type: Object,
      required: true,
    },
    lockData: {
      type: Boolean,
      required: true,
    },
    validation: {
      type: Object,
      required: true,
    },
    countryID: {
      required: true,
    },
  },
  data: () => ({
    color: 'dark',
    types: [
      {
        label: 'Upload Photo',
        ref: 'cardImageUploader',
      },
    ],
    editAutoFill: [],
    defaultText: 'Default',
    defaultImgColor: 'faded',
    defaultImg: false,
    showUpload: false,
    imageData: [],
    selectedIndex: 0,
    fieldIndex: 0,
  }),
  computed: {
    ...mapState({
      masterOptions: state => state.globalCMP.masterData.data.list,
      banksOptions: state => state.globalCMP.banksOptions.data,
    }),
  },
  mounted() {
    this.master.keys = [
      this.$const.masterKey.CARD_TYPE,
      this.$const.masterKey.CARD_COMPANY,
      this.$const.masterKey.RENTAL_CARD_STATUS,
    ]
    this.master.country_id = this.countryID
  },
  methods: {
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    sortDynamicFields(fields) {
      return _.orderBy(fields, 'order', 'asc')
    },
    // Return back current index after sorting based on order to make sure inline with original array
    setDynamicFieldIndex(fields, index) {
      return fields.findIndex(x => x.index === index)
    },
    setDynamicFieldKeyOptionsData(key, identifier, rowIndex, fieldIndex) {
      let name = key + 'Options'
      if (this[name] !== undefined) {
        return this[name].options
      } else {
        return []
      }
    },
    setInheritFieldValue(index, triggerIndex, key, value) {
      let data = []
      let field = this.rental_card_detail.rental_card_data.recurring_info[index].fields.find(
        x => x.index === triggerIndex
      )
      if (Object.keys(field).length > 0) {
        data = this.setDynamicFieldKeyOptionsData(key).filter(x => x.value === value)
      }
      if (data.length > 0) {
        let triggeredFieldIndex = this.rental_card_detail.rental_card_data.recurring_info[index].fields.findIndex(
          x => x.index === triggerIndex
        )
        if (triggeredFieldIndex !== -1) {
          this.rental_card_detail.rental_card_data.recurring_info[index].fields[triggeredFieldIndex].value =
            data[0][field.inherit_column]
        }
      }
      return ''
    },
    triggerInherit(index, triggerIndex, key, value) {
      this.setInheritFieldValue(index, triggerIndex, key, value)
    },
    getAutoFill(key, index, fieldIndex) {
      var value = key.split('.').reduce((a, b) => a[b], this.rental_card_detail)
      if (value !== '' || value !== null) {
        this.rental_card_detail.rental_card_data.recurring_info[index].fields[
          this.setDynamicFieldIndex(this.rental_card_detail.rental_card_data.recurring_info[index].fields, fieldIndex)
        ].value = value
      }
    },
    setEditAutoFill(index) {
      let editIndex = this.editAutoFill.findIndex(x => x === index)
      if (editIndex !== -1) {
        this.editAutoFill.splice(editIndex, 1)
      } else {
        this.editAutoFill.push(index)
      }
    },
    isFieldInEditState(index) {
      if (this.editAutoFill !== undefined) {
        let editIndex = this.editAutoFill.findIndex(x => x === index)
        if (editIndex !== -1) {
          return true
        }
      }
      return false
    },
    clearData() {
      let empty = {
        rental_card_data: {
          selected: '',
          recurring_info: [],
        },
      }
      this.rental_card_detail.rental_card_data = Object.assign(this.rental_card_detail.rental_card_data, empty)
    },
    showImageUploader(fieldIndex, index) {
      this.fieldIndex = fieldIndex
      this.selectedIndex = index
      this.openCloseModal({ name: 'cardImageUploader-' + index, status: true })
    },
    uploadImages: function(file, res, data) {
      let imgStr = JSON.parse(res.response)
      let images = []
      if (
        this.rental_card_detail.rental_card_data.recurring_info[this.selectedIndex].fields[
          this.setDynamicFieldIndex(
            this.rental_card_detail.rental_card_data.recurring_info[data.index].fields,
            this.fieldIndex
          )
        ].value !== ''
      ) {
        images = this.rental_card_detail.rental_card_data.recurring_info[this.selectedIndex].fields[
          this.setDynamicFieldIndex(
            this.rental_card_detail.rental_card_data.recurring_info[data.index].fields,
            this.fieldIndex
          )
        ].value
      }
      if (this.$helpers.getValue(imgStr, 'files', false)) {
        images.push({
          type: 'rental_card',
          user_id: '',
          image_path: imgStr.name,
          url: imgStr.link,
        })
      }
      this.rental_card_detail.rental_card_data.recurring_info[this.selectedIndex].fields[
        this.setDynamicFieldIndex(
          this.rental_card_detail.rental_card_data.recurring_info[data.index].fields,
          this.fieldIndex
        )
      ].value = images
    },
    removeUploadedImage(img, imgIndex, rowIndex, fieldIndex) {
      this.rental_card_detail.rental_card_data.recurring_info[this.selectedIndex].fields[
        this.setDynamicFieldIndex(this.rental_card_detail.rental_card_data.recurring_info[rowIndex].fields, fieldIndex)
      ].value.splice(imgIndex, 1)
    },
    setCardType(id) {
      this.rental_card_detail.rental_card_data.selected = id
    },
  },
}
</script>
