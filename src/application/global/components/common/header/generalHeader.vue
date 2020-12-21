<template>
  <div v-if="!hideHeader" class="row wrap items-center justify-between q-mb-md q-col-gutter-sm">
    <!--Left Action bar-->
    <div class="col-md-auto col-sm-12 col-xs-12">
      <div class="row" :class="placementLeft">
        <slot name="left-side" />
        <standard-breadcrumb />
      </div>
    </div>
    <!--Right action bar -->
    <div class="col-md-auto col-sm-12 col-xs-12">
      <div class="row" :class="placementRight">
        <slot name="right-side" />
        <div class="col-md-auto col-sm-auto col-xs-auto">
          <q-btn
            v-go-back.single="store.backRoute"
            :label="$t('Common.Back.Btn')"
            icon="reply"
            color="action-button-dark"
            unelevated
            rounded
          >
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Store from 'src/services/navigationService'
import StandardBreadcrumb from 'src/application/global/components/common/breadcrumbs/standardBreadcrumb'
import { mapState } from 'vuex'
import { Platform } from 'quasar'

export default {
  name: 'GeneralHeader',
  components: {
    StandardBreadcrumb,
  },
  computed: {
    ...mapState({
      route: state => state.route,
    }),
    placementLeft() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'q-col-gutter-xs justify-start items-center'
      } else {
        return 'justify-between'
      }
    },
    placementRight() {
      if (Platform.is.desktop || Platform.is.electron) {
        return 'q-col-gutter-xs justify-end items-center content-center'
      } else {
        return 'justify-between'
      }
    },
  },
  props: {
    genaralTitle: {
      type: String,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    store: Store.state,
  }),
}
</script>
