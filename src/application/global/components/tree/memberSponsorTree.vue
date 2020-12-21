<template>
  <div class="q-tree">
    <div v-if="tree" class="q-ml-sm">
      <tree-item v-for="(downlines, index) in tree.downlines" :key="index" :model="downlines" />
    </div>
  </div>
</template>
<script>
import TreeItem from 'src/application/global/components/tree/memberSponsorTreeItem'

export default {
  name: 'MemberSponsorTree',
  components: {
    TreeItem,
  },
  props: {
    tree: {
      type: Object,
    },
  },
}
</script>
<style lang="stylus">
.q-tree
    overflow hidden

.q-tree ul li
    width 900px
</style>
