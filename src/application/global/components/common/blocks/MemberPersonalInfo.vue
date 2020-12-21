<template>
  <div class="row q-col-gutter-sm">
    <div class="col-12">
      <q-card square flat>
        <div
          v-if="Object.keys(personalData).length > 0 && Object.keys(personalData.details).length > 0"
          class="row justify-end q-col-gutter-sm"
        >
          <div class="col-12">
            <q-markup-table :separator="separator" square dense :flat="flat" :bordered="bordered">
              <tbody>
                <tr>
                  <td>{{ $t('Member.IBOid.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.ibo_id',
                        $helpers.getValue(personalData, 'details.user.old_member_id', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.IBOName.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.ibo_name',
                        $helpers.getValue(personalData, 'details.user.name', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.JoinDate.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.joined_date',
                        $helpers.getValue(personalData, 'details.join_date', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.ExpiryDate.Text') }}</td>
                  <td class="text-uppercase" :class="isMembershipExpired ? 'text-negative' : 'text-positive'">
                    {{ $helpers.getValue(personalData, 'details.expiry_date', $t('Common.NotAvailable.Text')) }}
                    <q-icon
                      size="sm"
                      :name="isMembershipExpired ? 'sentiment_very_dissatisfied' : 'sentiment_very_satisfied'"
                    ></q-icon>
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.MemberCountry.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.country.name',
                        $helpers.getValue(personalData, 'details.country', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.MembershipType.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.enrollment_rank.rank_name',
                        $helpers.getValue(personalData, 'details.enrollment_rank', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.HighestRank.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.highest_rank.rank_name',
                        $helpers.getValue(personalData, 'details.highest_rank', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.EffectiveRank.Text') }}</td>
                  <td class="text-uppercase">
                    {{
                      $helpers.getValue(
                        personalData,
                        'details.effective_rank.rank_name',
                        $helpers.getValue(personalData, 'details.effective_rank', $t('Common.NotAvailable.Text'))
                      )
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('Member.CumulativePersonalSales.Text') }}</td>
                  <td class="text-uppercase">
                    {{ $helpers.getValue(personalData, 'details.personal_sales_cv', 0) }} |
                    {{ $helpers.getValue(personalData, 'details.personal_sales_cv_percentage', 0) }}
                    %
                  </td>
                </tr>
                <tr v-if="showEwalletInfo">
                  <td>{{ $t('wallet.adjustment.label.balance') }}</td>
                  <td class="text-uppercase">
                    {{ currencyLabelByCountry }}
                    {{ $helpers.getValue(personalData, 'ewallet.balance', 0) | formatPriceDouble }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
          <div class="col-auto">
            <slot></slot>
          </div>
        </div>
        <empty-list v-else :message="emptyMessage" />
      </q-card>
    </div>
  </div>
</template>
<script>
import EmptyList from 'src/application/global/components/common/empty/emptyList'
import { DatesMixin } from 'src/application/global/mixins'
import { mapGetters } from 'vuex'

export default {
  name: 'MemberPersonalInfo',
  components: {
    EmptyList,
  },
  mixins: [DatesMixin],
  props: {
    personalData: {
      type: Object,
    },
    separator: {
      type: String,
      default: 'horizontal',
    },
    bordered: {
      type: Boolean,
      default: false,
    },
    showEwalletInfo: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: true,
    },
    emptyMessage: {
      type: String,
    },
  },
  computed: {
    ...mapGetters(['currencyLabelByCountry']),
    isMembershipExpired() {
      return this.checkDateValidity(this.$helpers.getValue(this.personalData, 'details.expiry_date', ''))
    },
  },
}
</script>
