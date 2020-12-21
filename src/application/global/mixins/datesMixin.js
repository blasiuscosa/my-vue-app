import { date } from 'quasar'
import * as moment from 'moment'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      appSettings: state => state.globalCMP.appSettings,
    }),
  },
  methods: {
    getFirstDayOfCurrentYear(format) {
      let timeStamp = date.buildDate({ date: 1, month: 1 })
      return this.formatDate(timeStamp, format)
    },
    getCurrentDate(format) {
      let timeStamp = Date.now()
      return this.formatDate(timeStamp, format)
    },
    checkDateValidity(val) {
      if (val !== '') {
        let diff = date.getDateDiff(this.getCurrentDate(), val, 'days')
        if (diff > 0) {
          return true
        }
      }
      return false
    },
    getDateDiff(valFrom, valTo, unit, withUnit) {
      let appliedUnit = ''
      if (typeof unit === 'undefined' || unit === '' || unit === null) {
        appliedUnit = 'days'
      } else {
        appliedUnit = unit
      }
      if (valFrom === null) {
        valFrom = this.getCurrentDate()
      }
      if (valTo === null) {
        valTo = this.getCurrentDate()
      }
      if (valFrom !== '' && valTo !== '') {
        let diff = date.getDateDiff(valFrom, valTo, appliedUnit)
        if (withUnit) {
          return diff + ' (' + unit + ')'
        }
        return diff
      }
    },
    formatDate(val, format) {
      let appliedFormat = ''
      if (typeof format === 'undefined' || format === '' || format === null) {
        appliedFormat = 'YYYY-MM-DD'
      } else {
        appliedFormat = format
      }
      if (val !== null && val !== '') {
        return moment(val).format(appliedFormat)
      }
      return ''
    },
    humanizeDateTime(val) {
      return moment(val).fromNow()
    },
    getsubtractFromDate(fromDate = this.getCurrentDate(), days = 0, year = 0, format) {
      return this.formatDate(date.subtractFromDate(fromDate, { days: days, year: year }), format)
    },
    getGMTDateTime(date) {
      let d = date || new Date()
      let localTime = d.getTime()
      let localOffset = d.getTimezoneOffset() * 60000

      // obtain UTC time in msec
      let utc = localTime + localOffset
      // using supplied offset
      let nd = new Date(utc + 3600000 * 8)
      let format = this.appSettings.defaulted.date_time_zone_format
      return this.formatDate(nd, format)
    },
  },
}
