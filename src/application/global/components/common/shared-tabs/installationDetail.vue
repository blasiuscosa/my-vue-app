<template>
  <div class="rental-card-detail-tab">
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input
              v-model="rental_installation_detail.installation_date"
              class="required"
              :label="$t('rental.installationDetail.installationDate')"
              :error="validation.rental_installation_detail.installation_date.$error"
              type="date"
              outlined
              dense
              :disable="lockData"
              stack-label
              hide-bottom-space
              @input="validation.rental_installation_detail.installation_date.$touch()"
            />
          </div>
          <div class="col-12">
            <q-select
              v-model="rental_installation_detail.installation_time_section_id"
              class="required"
              :label="$t('rental.installationDetail.installationTimeSlot')"
              hide-bottom-space
              options-dense
              dense
              emit-value
              map-options
              outlined
              :error="validation.rental_installation_detail.installation_time_section_id.$error"
              :error-message="$t('rental.installationDetail.errorLabel.invalidInstallationTimeSlot')"
              :disable="lockData"
              :options="masterDataOptionsCreator(this.$const.masterKey.RENTAL_INSTALLATION_TIME_SECTION)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GeneralsMixin, MasterDataTransformarMixin } from 'src/application/global/mixins/index'

export default {
  name: 'InstallationDetail',
  mixins: [MasterDataTransformarMixin, GeneralsMixin],
  props: {
    // eslint-disable-next-line vue/prop-name-casing
    rental_installation_detail: {
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
  mounted() {
    this.master.keys = [this.$const.masterKey.RENTAL_INSTALLATION_TIME_SECTION]
  },
}
</script>
