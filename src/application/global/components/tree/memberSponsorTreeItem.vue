<template>
  <div class="q-tree-item tree-li q-ml-sm">
    <div class="member-info-holder row inline items-center" :class="{ 'q-tree-link': isExpandable }">
      <div class="q-tree-label relative-position row items-center" @click="tap">
        <span v-if="isExpandable" class="on-right">
          <q-icon :name="open ? 'remove' : 'add'"></q-icon>
        </span>
        <span v-else class="on-right">
          <q-icon class="text-transparent" name="arrow_right"></q-icon>
        </span>
        <span
          v-if="model.depth !== null && model.depth > 0"
          :title="model.sales_activity_status"
          class="text-white text-center status-rounded"
          :style="{
            backgroundColor:
              model.sales_activity_status === 'ACTIVE'
                ? '#57d816'
                : model.sales_activity_status === 'INACTIVE'
                ? '#e8373a'
                : '#726a63',
          }"
        >
          {{ model.depth !== '' || model.depth !== null ? model.depth : 0 }}</span
        >
        <span v-else class="text-white text-center status-rounded bg-blue-10"><q-icon name="person"/></span>
        <span>{{ model.ibo_id }}</span
        >&nbsp;<span>({{ model.ibo_name }})</span>
      </div>
      <div class="member-extra-info-holder">
        <div class="row text-white text-center" @click="tap">
          <div :title="colorCodes[0].title" :style="{ backgroundColor: colorCodes[0].color }" class="pd-5 col-auto">
            {{ typeof model.total_direct_downlines !== 'undefined' ? model.total_direct_downlines : 0 }}
          </div>
          <div :title="colorCodes[1].title" :style="{ backgroundColor: colorCodes[1].color }" class="pd-5 col-auto">
            {{ typeof model.total_downlines !== 'undefined' ? model.total_downlines : 0 }}
          </div>
          <div
            :title="colorCodes[2].title"
            :style="{ backgroundColor: colorCodes[2].color }"
            class="pd-5 text-uppercase"
          >
            {{ model.highest_rank !== null && model.highest_rank !== null ? model.highest_rank : '-- No Rank --' }}
          </div>
          <div :title="colorCodes[3].title" :style="{ backgroundColor: colorCodes[3].color }" class="pd-5 col-auto">
            {{ typeof model.expiry_date !== 'undefined' ? model.expiry_date : 'YYYY-MM-DD' }}
          </div>
          <div :title="colorCodes[4].title" :style="{ backgroundColor: colorCodes[4].color }" class="pd-5 col-auto">
            {{ typeof model.total_active_left_downlines !== 'undefined' ? model.total_active_left_downlines : 0 }}
          </div>
          <div :title="colorCodes[5].title" :style="{ backgroundColor: colorCodes[5].color }" class="pd-5 col-auto">
            {{ typeof model.total_active_right_downlines !== 'undefined' ? model.total_active_right_downlines : 0 }}
          </div>
        </div>
      </div>
    </div>
    <q-slide-transition>
      <div v-show="isExpandable && open" class="q-ml-sm">
        <q-virtual-scroll :items="model.children" scroll-target="body">
          <template v-slot="{ item, index }">
            <item :key="index" :model="item" />
          </template>
        </q-virtual-scroll>
      </div>
    </q-slide-transition>
  </div>
</template>
<script>
import { extend } from 'quasar'

export default {
  name: 'Item',
  props: {
    model: Object,
  },
  data() {
    return {
      item: extend(
        {
          expanded: false,
          children: [],
        },
        this.model
      ),
      open: true,
      colorCodes: [
        { color: '#f2528d', title: 'Number of Direct Downline' },
        { color: '#029dd6', title: 'Number of Total Downline' },
        { color: '#0892a0', title: 'Highest Rank' },
        { color: '#08b363', title: 'Expiry Date' },
        { color: '#ff7900', title: 'Total Active Left Downlines' },
        { color: '#726a63', title: 'Total Active Right Downlines' },
      ],
    }
  },
  computed: {
    isExpandable() {
      return this.item.children && this.item.children.length > 0
    },
  },
  watch: {
    model(value) {
      this.item = extend(
        {
          expanded: false,
          children: [],
        },
        value
      )
    },
  },
  methods: {
    tap() {
      this.toggle()
    },
    toggle() {
      this.open = !this.open
    },
  },
}
</script>
<style lang="stylus">
.status-rounded
    background-color inherit
    width 25px
    height 25px
    margin 5px
    border-radius 25px
    line-height 25px
    display inline-block

.tree-li
    cursor pointer !important
    padding 0 0 0 0 !important

.q-tree li:hover::before
    border-left 1px solid red

.q-tree li:hover::after
    border-top: 1px solid red
</style>
