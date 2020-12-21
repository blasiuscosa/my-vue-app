import _ from 'lodash'
import { openURL } from 'quasar'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getMasterData', 'getMasterDataIdByKeyAndTitle', 'getOnBehalfToken']),
  },
  methods: {
    ...mapActions(['logoutAction', 'getMembersOnBehalfToken']),
    ...mapMutations({
      openCloseModal: 'OPEN_CLOSE_MODAL_FORM',
    }),
    // to make first letter caps - upper/lower cases
    capitalizeFirst: function(value) {
      if (!value) return ''
      value = value.toString().toLowerCase()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    optionsTransformars(data, label, value, sublabel) {
      if (data.length > 0) {
        return data.map(opt => ({
          label: label ? opt[label] : '',
          value: value ? opt[value] : '',
          sublabel: sublabel ? opt[sublabel] : '',
        }))
      }
      return []
    },
    keyValueObjectToOptionsGenerator(data) {
      let options = []
      if (data !== undefined && Object.keys(data).length > 0) {
        Object.keys(data).forEach(function(key) {
          let obj = {
            value: key,
            label: data[key],
          }
          options.push(obj)
        })
      }
      return options
    },
    removeFalsyValues(data) {
      return _(data)
        .omitBy(_.isUndefined)
        .omitBy(_.isNull)
        .value()
    },
    isFalsy(value) {
      return Boolean(value)
    },
    decodeJSON(json) {
      json = JSON.parse(json)
      return json
    },
    isDef(value) {
      return value !== undefined && value !== null
    },
    isUndef(value) {
      return value === undefined || value === null
    },
    logoutHandler(query = {}) {
      this.logoutAction(query)
    },
    getValue(obj, variable, defaultValue = false) {
      let isset = true
      if (typeof obj !== 'undefined') {
        let parts = variable.split('.')
        for (var i = 0; i < parts.length; i++) {
          if (isset !== false) {
            let variables = parts[i].match(/([a-zA-Z0-9-_]+)/g) || [parts[i]]
            variables.forEach(v => {
              if (isset !== false && typeof obj !== 'undefined' && obj !== null && typeof obj[v] !== 'undefined') {
                obj = obj[v]
              } else {
                isset = false
              }
            })
          }
        }
      } else {
        isset = false
      }
      return isset === true ? obj : defaultValue
    },
    async onBehalfRedirect(userID) {
      if (userID) {
        let query = {
          user_id: userID,
        }
        this.getMembersOnBehalfToken(query)
          .then(() => {
            let token = this.$helpers.getValue(this.getOnBehalfToken, 'access_token')
            if (token) {
              openURL(process.env.ESHOP_URL + '/on-behalf?token=' + token)
            }
          })
          .catch(error => {
            if (typeof error.response !== 'undefined' && error.response.status === 422) {
              this.openCloseModal({ name: 'errorsModal', status: true })
            }
          })
      }
    },
  },
}
