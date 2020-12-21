<template>
  <div class="sponsor-tree-uplines-tables">
    <q-markup-table v-if="reversedUplineTree" dense flat square bordered separator="cell">
      <thead>
        <tr>
          <th class="text-center">
            Level
          </th>
          <th class="text-left">
            {{ $t('common.words.iboId') }}
          </th>
          <th class="text-left">
            {{ $t('common.words.iboName') }}
          </th>
          <th class="text-left">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in reversedUplineTree"
          v-if="!item.root"
          :class="{ 'bg-green-2': $last(item, reversedUplineTree) }"
        >
          <td class="text-center">
            <q-icon color="blue" :name="$last(item, reversedUplineTree) ? 'arrow_forward' : ' '" />
            {{ index + 1 }}
          </td>
          <td class="text-left">
            {{ $helpers.getValue(item, 'ibo_id', '-N/A-') }}
          </td>
          <td class="text-left">
            {{ $helpers.getValue(item, 'ibo_name', '-N/A-') }}
          </td>
          <td class="text-left">
            {{ $helpers.getValue(item, 'sales_activity_status', '-N/A-') }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList'

export default {
  name: 'MemberSponsorTreeTable',
  components: {
    EmptyList,
  },
  props: {
    data: Object,
  },
  computed: {
    member() {
      return {
        ibo_name: this.$helpers.getValue(this.data, 'member_data.details.ibo_name', '-N/A-'),
        ibo_id: this.$helpers.getValue(this.data, 'member_data.details.ibo_id', '-N/A-'),
        sales_activity_status: this.$helpers.getValue(this.data, 'member_data.details.sales_activity_status', '-N/A-'),
      }
    },
    reversedUplineTree() {
      let reversed = []
      if (Array.isArray(this.data.uplines)) {
        reversed = [...this.data.uplines].reverse()
        reversed.shift()
        reversed.push(this.member)
      }
      return reversed
    },
  },
}
</script>
