export default {
  props: {
    callback: {
      type: Function,
    },
    max: {
      type: Number,
    },
    postCallback: {
      type: Function,
    },
    title: {
      type: Boolean,
      default: false,
    },
    titleText: {
      type: String,
    },
    titlePos: {
      type: String,
      default: 'top',
    },
    legend: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    labelColor() {
      let style = getComputedStyle(document.body)
      return style.getPropertyValue('--gray').trim()
    },
    fontFamily() {
      let style = getComputedStyle(document.body)
      return style.getPropertyValue('font-family').trim()
    },
    chartOptions() {
      let chart = {
        responsive: true,
        maintainAspectRatio: false,
        scaleOverride: true,
        elements: {
          rectangle: {
            borderWidth: 3,
          },
        },
        legend: {
          display: this.$props.legend,
        },
        title: {
          display: this.$props.title,
          position: this.$props.titlePos,
          text: this.$props.titleText,
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                tickMarkLength: 4,
              },
              ticks: {
                fontSize: 12,
                padding: 10,
                fontColor: this.labelColor(),
                fontFamily: this.fontFamily(),
                offset: true,
              },
              beforeBuildTicks: chart => {
                if (typeof this.$props.max !== 'undefined' && chart.max < this.$props.max) {
                  chart.max = this.$props.max
                } else {
                  chart.max = chart.max * 1.1
                }
              },
            },
          ],
          xAxes: [
            {
              barPercentage: 0.8,
              categoryPercentage: 0.6,
              gridLines: {
                tickMarkLength: 4,
              },
              ticks: {
                fontSize: 12,
                fontColor: this.labelColor(),
                fontFamily: this.fontFamily(),
                offset: true,
              },
            },
          ],
        },
      }
      if (typeof this.$props.callback !== 'undefined') {
        chart.scales.yAxes[0].ticks.callback = this.$props.callback
      }
      return chart
    },
    processColors(data) {
      return data.map((data, index) => {
        if (typeof data.backgroundColor !== 'undefined') {
          data.backgroundColor = this.processColor(data.backgroundColor)
        }
        if (typeof data.borderColor !== 'undefined') {
          data.borderColor = this.processColor(data.borderColor)
        }
        if (typeof data.pointBackgroundColor !== 'undefined') {
          data.pointBackgroundColor = this.processColor(data.pointBackgroundColor)
        }
        return data
      })
    },
    processColor(color) {
      if (Array.isArray(color)) {
        for (var i = 0; i < color.length; i++) {
          color[i] = this.processColor(color[i])
        }
        return color
      } else {
        if (color.charAt(0) !== '-') {
          return color
        } else {
          let style = getComputedStyle(document.body)
          return style.getPropertyValue(color).trim()
        }
      }
    },
    postProcess() {
      if (typeof this.$props.postCallback === 'function') {
        this.$props.postCallback(this.$data._chart, this)
      }
    },
  },
}
