<template>
  <q-uploader
    ref="gUploader"
    :color="color"
    :align="align"
    :disable="disable"
    :url="getQualifiedUrl"
    :headers="headers"
    :method="method"
    :multiple="multiple"
    :no-thumbnails="noThumbnails"
    :send-raw="sendRaw"
    :readonly="readonly"
    :form-fields="getAdditionalFields"
    :accept="extensions"
    :hide-upload-btn="hideUploadButton"
    field-name="file"
    class="full-width"
    :label="label"
    flat
    bordered
    @added="added"
    @removed="removed"
    @uploaded="uploaded"
    @failed="failed"
    @start="emit('start')"
    @finish="emit('finish')"
  />
</template>
<script>
import { api } from 'src/application/global/api'
import { getAccessToken } from 'src/services/authService'
import { url } from 'src/config/urls'
import { mapActions, mapState } from 'vuex'
import config from 'src/config'
import helpers from 'src/helpers'

let endpointsRulesList = config.plugins.axios.endpointRules

export default {
  name: 'GeneralUploader',
  props: {
    label: {
      type: String,
      default: 'Uploader',
    },
    color: {
      type: String,
    },
    align: {
      type: String,
      default: 'left',
    },
    disable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    hideUploadButton: {
      type: Boolean,
      default: false,
    },
    hideUploadProgress: {
      type: Boolean,
      default: false,
    },
    noThumbnails: {
      type: Boolean,
      default: false,
    },
    autoExpand: {
      type: Boolean,
      default: true,
    },
    sendRaw: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      defalt: true,
    },

    types: {
      type: Array,
    },
    uploaderFileType: {
      type: String,
    },
    uploadCallback: {
      type: Function,
      required: true,
    },
    url: {
      type: String,
      default: api.fileUploadProcess,
    },
    callBackAdditionalData: {
      type: Object,
      default: () => {},
    },
    additionalFields: {
      type: Array,
      default: () => [],
    },
    failedCallback: {
      type: Function,
    },
    resetAfterUpload: {
      type: Boolean,
    },
  },
  data() {
    return {
      headers: [
        { name: 'Accept', value: 'application/json' },
        { name: 'Authorization', value: 'Bearer' + ' ' + getAccessToken() },
      ],
      method: 'POST',
      extensions: '',
      events: [],
      count: 0,
    }
  },
  watch: {
    count: {
      handler(val) {
        this.$emit('count', val)
      },
      immediate: true,
    },
  },
  mounted: function() {
    if (this.uploaderFileType) {
      let query = {
        file_type: this.uploaderFileType,
      }
      this.getUploaderFileUploadSetting(query).then(() => {
        this.extensions = this.uploaderFileUploadSetting.data.client_validate
      })
    }
  },
  computed: {
    ...mapState({
      uploaderFileUploadSetting: state => state.globalCMP.uploaderFileUploadSetting,
      getAdditionalFields() {
        return [
          ...this.additionalFields,
          ...[
            {
              name: 'file_type',
              value: this.uploaderFileUploadSetting.data.file_type,
            },
          ],
        ]
      },
    }),
    getQualifiedUrl() {
      let rule = false
      let baseURL = url.apiUrl
      endpointsRulesList.filter(item => {
        if (this.url.includes(item.url)) {
          rule = item
        }
      })
      let version = helpers.getValue(rule, 'version')

      if (version) {
        baseURL = url.apiUrl.replace('v1', version || 'v1')
      }
      return baseURL + this.url
    },
  },
  methods: {
    ...mapActions(['getUploaderFileUploadSetting', 'uploadErrorsAction', 'uploadSuccessAction', 'removeUploadImage']),
    added(files = []) {
      this.count = files.length
      this.events.push(`added ${files.length}`)
    },
    removed(files = []) {
      this.count = files.length
    },
    uploaded(info) {
      this.uploadCallback(info.files, info.xhr, this.callBackAdditionalData)
      if (this.resetAfterUpload) {
        this.reset()
      }
    },
    failed(file) {
      let errorResponse = JSON.parse(this.$helpers.getValue(file, 'xhr.response'))
      let errorMessage = this.$helpers.getValue(errorResponse, 'error', 'Unknown Error Occurred')
      this.uploadErrorsAction(errorMessage)
      if (this.failedCallback) {
        this.failedCallback()
      }
      if (this.resetAfterUpload) {
        this.reset()
      }
    },
    clear() {
      this.events = []
    },
    emit(evt) {
      this.events.push(evt)
    },
    reset() {
      this.count = 0
      this.$refs.gUploader.reset()
    },
    upload() {
      this.$refs.gUploader.upload()
    },
  },
}
</script>
