<template>
  <div class="row full-width items-center q-col-gutter-sm">
    <div class="col-md-8 col-12">
      <q-toolbar-title class="no-padding">
        {{ title }}
        <br />
      </q-toolbar-title>
      <small class="text-grey-6">{{ subTitle }}</small>
    </div>
    <div class="col-md-4 col-12">
      <q-input
        v-if="headerSearchBar"
        ref="headerSearchBarField"
        v-model.trim="headerSearchBarField"
        hide-bottom-space
        dense
        outlined
        :autofocus="true"
        :debounce="appSettings.debounceDelay"
        clearable
        :label="$t('Common.search.placeholder')"
        @input="setHeaderSearchBarFieldMutation"
      />
    </div>
    <slot slot-scope="props" name="header-data" />
  </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'LayoutModalHeader',
  props: {
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    headerSearchBar: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    headerSearchBarField: '',
  }),
  computed: {
    // Assign form related data from vuex store state
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
  },
  methods: {
    ...mapMutations({
      setHeaderSearchBarField: 'SET_HEADER_SEARCH_BAR_FIELD',
    }),
    setHeaderSearchBarFieldMutation() {
      this.setHeaderSearchBarField(this.headerSearchBarField)
    },
  },
  destroyed() {
    this.setHeaderSearchBarField('')
  },
}
</script>
