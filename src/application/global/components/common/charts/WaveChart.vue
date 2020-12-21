<script>
import { Line } from 'vue-chartjs'
import ChartMixin from 'src/application/global/mixins/chartMixin'

export default {
  name: 'WaveChart',
  extends: Line,
  mixins: [ChartMixin],
  props: ['labels', 'data'],
  watch: {
    data: function() {
      this.renderChart(
        {
          labels: this.$props.labels,
          datasets: this.processColors(this.$props.data),
        },
        this.chartOptions()
      )
    },
  },
  mounted() {
    this.renderChart(
      {
        labels: this.$props.labels,
        datasets: this.processColors(this.$props.data),
      },
      this.chartOptions()
    )
    this.postProcess()
  },
}
</script>
