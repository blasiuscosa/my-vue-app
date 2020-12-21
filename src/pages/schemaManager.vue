<template>
  <layout-modal
    refs="showSchemaManagerModal"
    title="Assign Roles To Elements"
    header-search-bar
    :search="true"
    :shadow="false"
    min-width="70vw"
    min-height="90vh"
    maximized
    footer-button-one="Close"
    classes="transparent text-black manager"
  >
    <template slot="modal-data" slot-scope="props">
      <div v-if="typeof $schemaData !== 'undefined'" class="row q-ma-md group">
        <div class="col-12">
          <div v-if="search !== ''" class="element-header">
            {{ $t('Common.search.label') }} :
            <q-chip color="primary" @hide="clearSearch()">
              {{ search }}
            </q-chip>
          </div>
        </div>
        <div class="col-6">
          <div class="elements-body">
            <q-list separator>
              <q-expansion-item
                v-for="(schema, index) in filterSchema"
                :key="`schema-${index}`"
                icon="verified_user"
                :label="schema.path.replace(/[.]/g, '/')"
              >
                <div class="q-pa-xs">
                  <q-scroll-area style="height: 60vh; max-height: 65vh;">
                    <q-list
                      v-for="(item, index) in schema.items"
                      :key="index"
                      dense
                      separator
                      class="no-padding no-margin"
                    >
                      <q-item-label class="bg-black text-white">
                        <q-btn round color="positive" icon="add" class="on-left" />
                        {{ item.action }}
                      </q-item-label>
                      <q-item v-for="(opt, index) in item.allowed" :key="index" :class="{ 'bg-green-1': true }">
                        <q-item-label :label="opt" />
                        <q-item-section :icon="true ? 'check' : 'check_box_outline_blank'" />
                      </q-item>
                    </q-list>
                  </q-scroll-area>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
        <div class="col-6" />
      </div>
    </template>
  </layout-modal>
</template>
<script>
import LayoutModal from 'src/application/global/components/common/modal/layoutModal.vue'
import { mapState } from 'vuex'
import { EventBus } from 'src/services/eventService'

export default {
  name: 'SchemaManager',
  components: { LayoutModal },
  computed: {
    ...mapState({
      headerSearchBarField: state => state.globalCMP.headerSearchBarField,
    }),
    filterSchema() {
      if (this.search !== '') {
        let explode = this.search.split('|')
        return this.$schemaData.filter(x => x.path.match(explode[0]) && x.items.filter(y => y.action.match(explode[1])))
      } else {
        return this.$schemaData
      }
    },
  },
  watch: {
    headerSearchBarField: {
      handler(val) {
        this.search = val
      },
    },
  },
  mounted() {
    EventBus.$on('showSchemaManager', data => {
      this.search = data
      this.openCloseModal({ name: 'showSchemaManagerModal', status: true })
    })
  },
  data: () => ({
    open: false,
    search: '',
  }),
  methods: {
    clearSearch() {
      this.search = ''
    },
  },
}
</script>
