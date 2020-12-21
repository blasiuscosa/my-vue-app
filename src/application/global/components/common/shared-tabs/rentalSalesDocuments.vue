<template>
  <div class="image-tab">
    <div class="row justify-center q-col-gutter-md">
      <div class="col-12">
        <q-field class="required" hide-bottom-space borderless :error="validation.application_form.$error">
          <template slot="control">
            <q-table
              :color="appSettings.defaulted.table_color"
              :data="salesData.application_form"
              :columns="columns"
              row-key="id"
              class="fit"
              flat
              bordered
            >
              <q-tr slot="header" slot-scope="props" :props="props">
                <q-th
                  v-for="col in props.cols"
                  v-if="!lockData || col.name !== 'delete'"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
              <!-- Custom renderer for "action" column with button for custom action -->
              <q-tr slot="body" slot-scope="props" :props="props" class="cursor-pointer">
                <q-td key="name" width="76%" :props="props">
                  <q-input
                    v-model="props.row.name"
                    hide-bottom-space
                    dense
                    outlined
                    label="Please insert document description"
                    :readonly="lockData"
                  />
                </q-td>
                <q-td key="url" width="7%" :props="props">
                  <q-btn flat icon="open_in_new" @click="openDocument(props.row)" />
                </q-td>
                <q-td v-if="!lockData" key="delete" width="7%" :props="props">
                  <q-btn
                    v-if="!$helpers.isSet(props, 'row.id')"
                    flat
                    icon="delete"
                    @click="removeDocument(applicationFormType, props.row)"
                  />
                </q-td>
              </q-tr>
              <template v-if="!lockData" slot="top-right" slot-scope="props">
                <q-btn flat round dense icon="add" @click="uploadImage(applicationFormType)" />
              </template>
              <template slot="top-left" slot-scope="props">
                <span class="text-h6">Application form</span>
              </template>
            </q-table>
          </template>
        </q-field>
      </div>
      <div class="col-12">
        <q-field class="required" hide-bottom-space borderless :error="validation.credit_card_photocopy.$error">
          <template slot="control">
            <q-table
              :color="appSettings.defaulted.table_color"
              :data="salesData.credit_card_photocopy"
              :columns="columns"
              row-key="id"
              class="fit"
              flat
              bordered
            >
              <q-tr slot="header" slot-scope="props" :props="props">
                <q-th
                  v-for="col in props.cols"
                  v-if="!lockData || col.name !== 'delete'"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
              <!-- Custom renderer for "action" column with button for custom action -->
              <q-tr slot="body" slot-scope="props" :props="props" class="cursor-pointer">
                <q-td key="name" width="76%" :props="props">
                  <q-input
                    v-model="props.row.name"
                    hide-bottom-space
                    dense
                    outlined
                    label="Please insert document description"
                    :readonly="lockData"
                  />
                </q-td>
                <q-td key="url" width="7%" :props="props">
                  <q-btn flat icon="open_in_new" @click="openDocument(props.row)" />
                </q-td>
                <q-td v-if="!lockData" key="delete" width="7%" :props="props">
                  <q-btn
                    v-if="!$helpers.isSet(props, 'row.id')"
                    flat
                    icon="delete"
                    @click="removeDocument(creditCardType, props.row)"
                  />
                </q-td>
              </q-tr>
              <template v-if="!lockData" slot="top-right" slot-scope="props">
                <q-btn flat round dense icon="add" @click="uploadImage(creditCardType)" />
              </template>
              <template slot="top-left" slot-scope="props">
                <span class="text-h6">NRIC/Passport And Credit/ Debit Card</span>
              </template>
            </q-table>
          </template>
        </q-field>
      </div>
      <div class="col-12">
        <q-field class="required" hide-bottom-space borderless :error="validation.income_proof.$error">
          <template slot="control">
            <q-table
              :color="appSettings.defaulted.table_color"
              :data="salesData.income_proof"
              :columns="columns"
              row-key="id"
              class="fit"
              flat
              bordered
            >
              <q-tr slot="header" slot-scope="props" :props="props">
                <q-th
                  v-for="col in props.cols"
                  v-if="!lockData || col.name !== 'delete'"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
              <!-- Custom renderer for "action" column with button for custom action -->
              <q-tr slot="body" slot-scope="props" :props="props" class="cursor-pointer">
                <q-td key="name" width="76%" :props="props">
                  <q-input
                    v-model="props.row.name"
                    hide-bottom-space
                    dense
                    outlined
                    label="Please insert document description"
                    :readonly="lockData"
                  />
                </q-td>
                <q-td key="url" width="7%" :props="props">
                  <q-btn flat icon="open_in_new" @click="openDocument(props.row)" />
                </q-td>
                <q-td v-if="!lockData" key="delete" width="7%" :props="props">
                  <q-btn
                    v-if="!$helpers.isSet(props, 'row.id')"
                    flat
                    icon="delete"
                    @click="removeDocument(incomeDocumentType, props.row)"
                  />
                </q-td>
              </q-tr>
              <template v-if="!lockData" slot="top-right" slot-scope="props">
                <q-btn flat round dense icon="add" @click="uploadImage(incomeDocumentType)" />
              </template>
              <template slot="top-left" slot-scope="props">
                <span class="text-h6">Other document</span>
              </template>
            </q-table>
          </template>
        </q-field>
      </div>
    </div>
    <layout-modal
      refs="uploader"
      :title="uploaderLabel"
      min-width="50vw"
      min-height="80vh"
      footer-button-two="Close"
      classes="transparent text-black manager"
    >
      <template slot="modal-data" slot-scope="props">
        <generalUploader
          :float-label="$t('rental.cardDetail.uploadCards.label')"
          color="grey-7"
          :multiple="true"
          :upload-callback="processUploadedImages"
          uploader-file-type="rental_documents"
        />
      </template>
    </layout-modal>
    <!--    <q-menu ref="rentalDocumentImgModal">-->
    <!--      <div class="row q-col-gutter-sm justify-between">-->
    <!--        <div class="col-auto">-->
    <!--          <div>{{ uploaderLabel }}</div>-->
    <!--        </div>-->
    <!--        <div class="col-auto">-->
    <!--          <q-btn color="negative" @click="$refs.rentalDocumentImgModal.hide()">-->
    <!--            <i class="material-icons">close</i>-->
    <!--          </q-btn>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      <hr />-->
    <!--      <generalUploader-->
    <!--        ref="uploader"-->
    <!--        uploader-file-type="rental_documents"-->
    <!--        :float-label="uploaderLabel"-->
    <!--        :multiple="true"-->
    <!--        :upload-callback="processUploadedImages"-->
    <!--        :clearable="true"-->
    <!--      />-->
    <!--    </q-menu>-->
  </div>
</template>

<script>
import generalUploader from 'src/application/global/components/common/uploads/uploader'
import basicModal from 'src/application/global/components/common/modal/basicModal'
import { openURL } from 'quasar'
import { GeneralsMixin, MasterDataTransformarMixin } from 'src/application/global/mixins/index'
import { mapState } from 'vuex'

const CREDIT_CARD = 'CREDIT_CARD'
const INCOME_DOCUMENT = 'INCOME_DOCUMENT'
const APPLICATION_FORM = 'APPLICATION_FORM'

export default {
  name: 'RentalSalesDocuments',
  components: {
    generalUploader,
    basicModal,
  },
  mixins: [MasterDataTransformarMixin, GeneralsMixin],
  props: {
    salesData: {
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
  },
  data: () => ({
    uploaderLabel: '',
    uploadDocumentType: '',
    creditCardUploadQueue: [],
    incomeDocumentUploadQueue: [],
    applicationFormUploadQueue: [],
    creditCardType: CREDIT_CARD,
    incomeDocumentType: INCOME_DOCUMENT,
    applicationFormType: APPLICATION_FORM,
    columns: [
      {
        name: 'name',
        label: 'Document Description',
        field: 'name',
        sortable: true,
        align: 'left',
      },
      {
        name: 'url',
        label: 'Open Document',
        field: 'url',
        sortable: true,
        type: 'date',
        align: 'center',
      },
      {
        name: 'delete',
        label: 'Delete',
        field: 'delete',
        sortable: true,
        align: 'center',
      },
    ],
  }),
  mounted() {
    this.master.keys = [this.$const.masterKey.FILE_TYPE]
  },
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
  },
  methods: {
    removeDocument(type, document) {
      if (this.uploadDocumentType === CREDIT_CARD) {
        this.salesData.credit_card_photocopy.splice(this.salesData.credit_card_photocopy.indexOf(document), 1)
      } else if (this.uploadDocumentType === APPLICATION_FORM) {
        this.salesData.application_form.splice(this.salesData.credit_card_photocopy.indexOf(document), 1)
      } else if (this.uploadDocumentType === INCOME_DOCUMENT) {
        this.salesData.income_proof.splice(this.salesData.credit_card_photocopy.indexOf(document), 1)
      }
    },
    processUploadedImages: function(file, res) {
      let imgStr = JSON.parse(res.response)
      if (imgStr) {
        let uploadedDocument = this.getNewDocumentInstance()
        uploadedDocument.url = imgStr.link
        if (this.uploadDocumentType === CREDIT_CARD) {
          let documentType = this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.FILE_TYPE,
            this.$const.masterData.IMAGE
          )
          if (documentType !== null && documentType !== undefined) {
            uploadedDocument.file_type_id = documentType
          }
          uploadedDocument.name =
            'NRIC/Passport And Credit/ Debit Card - ' + (this.salesData.credit_card_photocopy.length + 1)
          this.salesData.credit_card_photocopy.push(uploadedDocument)
        } else if (this.uploadDocumentType === APPLICATION_FORM) {
          let documentType = this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.FILE_TYPE,
            this.$const.masterData.IMAGE
          )
          if (documentType !== null && documentType !== undefined) {
            uploadedDocument.file_type_id = documentType
          }
          uploadedDocument.name = 'Application form - ' + (this.salesData.application_form.length + 1)
          this.salesData.application_form.push(uploadedDocument)
        } else if (this.uploadDocumentType === INCOME_DOCUMENT) {
          let documentType = this.getMasterDataIdByKeyAndTitle(
            this.$const.masterKey.FILE_TYPE,
            this.$const.masterData.IMAGE
          )
          if (documentType !== null && documentType !== undefined) {
            uploadedDocument.file_type_id = documentType
          }
          uploadedDocument.name = 'Other document - ' + (this.salesData.income_proof.length + 1)
          this.salesData.income_proof.push(uploadedDocument)
        }
      }
    },
    uploadImage(type) {
      this.uploadDocumentType = type
      this.setUploaderLabel()
      this.openCloseModal({ name: 'uploader', status: true })
    },
    setUploaderLabel() {
      if (this.uploadDocumentType === CREDIT_CARD) {
        this.uploaderLabel = 'Upload NRIC/Passport And Credit/ Debit Card'
      } else if (this.uploadDocumentType === APPLICATION_FORM) {
        this.uploaderLabel = 'Upload Application form'
      } else if (this.uploadDocumentType === INCOME_DOCUMENT) {
        this.uploaderLabel = 'Upload Other document'
      }
    },
    getNewDocumentInstance() {
      return {
        name: '',
        url: '',
        document_type: '',
        file_type_id: '',
      }
    },
    openDocument(document) {
      if (document.url !== null && document.url !== undefined && document.url !== '') {
        openURL(document.url)
      }
    },
  },
}
</script>
