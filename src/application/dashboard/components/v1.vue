<template>
  <div class="general-page-holder">
    <div class="filter-holder bg-white shadow-1">
      <div class="row items-center q-col-gutter-xs justify-between">
        <div class="col-md-6 col-12 gt-sm">
          <info :message="$t('Common.Period.Text', { filter: getDashboardDateString })"></info>
        </div>
        <div class="col-md-auto col-12">
          <q-select
            ref="transactionLocationIDSelector"
            v-model="transactionLocationID"
            hide-bottom-space
            options-dense
            dense
            emit-value
            map-options
            outlined
            clearable
            color="text-grey-6"
            :options="locationsOptionsByCountry"
            :label="$t('general.select.transactionLocation')"
            @input="getCharts"
          />
        </div>
      </div>
    </div>
    <div class="bg-white shadow-1">
      <div class="row">
        <div class="col-12 relative-position">
          <wave-chart
            class="chart q-pa-md"
            :labels="recentSales.labels"
            :legend="true"
            :title="true"
            :title-text="$t('Dashboard.Chart.RecentSales')"
            :data="recentSales.data"
            :chart-data="recentSales.data"
            :callback="recentSales.callback"
          />
        </div>
      </div>
    </div>
    <div v-if="showStockistChart" class="bg-white shadow-1 q-mt-md">
      <div class="row">
        <div class="col-12 relative-position">
          <bar-chart
            class="chart q-pa-md"
            :labels="totalSponsored.labels"
            :legend="true"
            :title="true"
            :title-text="$t('Dashboard.Chart.Commissions')"
            :data="totalSponsored.data"
            :callback="totalSponsored.callback"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { BarChart, WaveChart } from 'src/application/global/components/common/charts'
import { DatesMixin } from 'src/application/global/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
import Info from '../../global/components/common/elements/info'

export default {
  components: {
    Info,
    BarChart,
    WaveChart,
  },
  mixins: [DatesMixin],
  data() {
    return {
      recentSalesData: {
        label: this.$t('Dashboard.Chart.RecentSales'),
        data: [],
        borderColor: '--q-color-primary',
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '--q-color-primary',
      },
      todaySalesData: {
        label: this.$t('Dashboard.Chart.TodaySales'),
        data: [],
        borderDash: [5, 5],
        backgroundColor: 'rgba(0,0,0,0)',
        pointBackgroundColor: '--q-color-primary',
      },
      commisionsData: {
        label: this.$t('Dashboard.Chart.Commissions'),
        data: [],
        borderColor: [
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
        ],
        backgroundColor: [
          '--q-color-primary',
          '--q-color-primary',
          '--q-color-primary',
          '--q-color-primary',
          '--q-color-primary',
          '--q-color-primary',
          '--q-color-primary',
        ],
      },
      totalSponsored: {
        labels: [],
        legends: [],
        data: [],
        callback: function(value) {
          return value % 1 === 0 ? value : null
        },
      },
      recentSales: {
        labels: [],
        legends: [],
        data: [],
        callback: value => {
          return value % 1000 === 0 ? value / 1000 + this.$t('Dashboard.Chart.Thousands') : null
        },
      },
      showStockistChart: false,
      transactionLocationID: '',
      datesBeforeDays: 14,
    }
  },
  async mounted() {
    this.recentSales.data = [this.recentSalesData, this.todaySalesData]
    await this.getCountryRelationAction({
      country_id: this.selectedFilters.countryID,
      relations: ['entity.locations'],
    })
    await this.initDashboard()
  },
  computed: {
    ...mapState({
      selectedFilters: state => state.globalCMP.selectedFilters,
      userType: state => state.globalCMP.userInfo.data.user_type,
    }),
    ...mapGetters(['locationsOptionsByCountry']),
    getDashboardDateString() {
      return `[${this.getsubtractFromDate(
        this.getCurrentDate(),
        this.datesBeforeDays,
        0,
        'MMMM DD, YYYY'
      )}] - [${this.getCurrentDate('MMMM DD, YYYY')}]`
    },
  },
  methods: {
    ...mapActions(['getStockLocations', 'getCountryRelationAction', 'dashboardAction']),
    initDashboard() {
      // set default value for chart
      if (this.locationsOptionsByCountry.length > 0) {
        this.transactionLocationID = this.locationsOptionsByCountry[0].value
        this.getCharts(this.locationsOptionsByCountry[0].value)
      }
    },
    getCharts(locationID) {
      let locationData = this.locationsOptionsByCountry.find(x => x.value === locationID)
      if (locationID !== null) {
        this.updateRecentSalesChart(locationID)
        if (locationData.type_id === 3) {
          this.showStockistChart = true
          this.updateCommisionsChart(locationID)
        } else {
          this.showStockistChart = false
        }
      }
    },
    updateRecentSalesChart(locationId) {
      this.dashboardAction({
        location_id: locationId,
        request_type: 'recent_sales',
        start_date: this.getsubtractFromDate(this.getCurrentDate(), this.datesBeforeDays),
        end_date: this.getCurrentDate(),
      }).then(resp => {
        // Processing new label
        let newLabels = []
        let newData = []
        let todayData = []
        if (typeof resp.recent_sales.dates !== 'undefined' && resp.recent_sales.dates.length > 0) {
          resp.recent_sales.dates.forEach(item => {
            let temp = item.split(' ')
            newLabels.push(temp[0] + ' ' + temp[1])
            newData.push(resp.recent_sales.values[item])
            todayData.push(resp.recent_sales.values[item])
          })
          this.recentSales.labels = newLabels
        }
        // Update new sales data
        this.recentSalesData.data = newData.fill(null, newData.length - 1)
        this.todaySalesData.data = todayData.fill(null, 0, newData.length - 2)
        this.recentSales.data = [this.recentSalesData, this.todaySalesData]
      })
    },
    updateCommisionsChart(locationId) {
      this.dashboardAction({
        location_id: locationId,
        request_type: 'commissions',
        start_date: this.getsubtractFromDate(this.getCurrentDate(), this.datesBeforeDays),
        end_date: this.getCurrentDate(),
      }).then(resp => {
        // Processing new label
        let newLabels = []
        let newData = []
        if (typeof resp.commissions !== 'undefined') {
          resp.commissions.cw_names.forEach(item => {
            newLabels.push(item)
            newData.push(resp.commissions.values[item])
          })
          this.totalSponsored.labels = newLabels
        }
        // Update new commisions data
        this.commisionsData.data = newData
        this.totalSponsored.data = [this.commisionsData]
      })
    },
  },
}
</script>
