<template>
  <basic-modal
    refs="websocketProgress"
    :closable="getQueueRequestResponse.closable"
    url-reset-path-name=""
    form
    no-esc-dismiss
  >
    <template slot="modal-data" slot-scope="props">
      <div class="row q-col-gutter-md q-pa-lg">
        <div class="col-12">
          <div class="message text-h5 text-weight-light text-grey-7">
            {{ getQueueRequestResponse.message }}
          </div>
        </div>
        <div class="col-12">
          <q-linear-progress indeterminate stripe />
        </div>
      </div>
    </template>
  </basic-modal>
</template>
<script>
import BasicModal from 'src/application/global/components/common/modal/basicModal'
import { mapGetters } from 'vuex'

export default {
  name: 'QWaiting',
  components: {
    BasicModal,
  },
  props: {
    closable: {
      type: Boolean,
      defalt: false,
    },
  },
  computed: {
    ...mapGetters(['getQueueRequestResponse']),
  },
}
</script>
