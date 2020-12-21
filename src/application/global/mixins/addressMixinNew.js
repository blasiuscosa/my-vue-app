import _ from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      masterData: state => state.globalCMP.masterData.data.list,
      countriesOptions: state => state.globalCMP.allCountriesOptions.data,
      countriesActiveOptions: state => state.globalCMP.countriesOptions.data,
      fields: state => state.globalCMP.dynamicContentData.data,
      statesOptions: state => state.globalCMP.statesOptions.data,
      citiesOptions: state => state.globalCMP.citiesOptions.data,
      appSettings: state => state.globalCMP.appSettings,
    }),
    ...mapGetters(['crossBorderDeliveryCountriesByCountry']),
  },
  data: () => ({
    loadAddressFailed: false,
    addresses: [],
  }),
  methods: {
    ...mapActions(['getDynamicContentAction', 'getStateAction', 'getCitiesAction']),
    async initializeAddresses(addresses) {
      this.$wait.start('isAddressLoading')
      let statesRequested = []
      let citiesRequested = []
      let promises = []
      let response = []
      if (addresses.length > 0) {
        const addressArray = addresses.map(async obj => {
          for (const entry of Object.entries(obj)) {
            const [key, value] = entry
            if (key === 'fields') {
              for (const item of value) {
                if (item.key === 'countries') {
                  if (!statesRequested.includes(item.value)) {
                    if (item.value !== '' && item.value !== null) {
                      statesRequested.push(item.value)
                      promises.push(this.setStates(item.value))
                    }
                  }
                }
                if (item.key === 'states') {
                  if (!citiesRequested.includes(item.value)) {
                    if (item.value !== '' && item.value !== null) {
                      citiesRequested.push(item.value)
                      promises.push(this.setCities(item.value))
                    }
                  }
                }
              }
            }
          }
          return obj
        })
        await Promise.all(promises)
          .then(async () => {
            response = await Promise.all(addressArray)
          })
          .then(() => {
            this.$wait.end('isAddressLoading')
          })
      }
      return response
    },
    async setStates(id) {
      if (id !== null) {
        let query = {
          country_id: id,
          relations: ['states'],
        }
        await this.getStateAction(query)
      }
    },
    async setCities(id) {
      if (typeof id !== 'undefined' && id !== null && id !== '') {
        let query = {
          state_id: id,
        }
        await this.getCitiesAction(query)
      }
    },
    sortDynamicFields(fields) {
      return _.orderBy(fields, 'order', 'asc')
    },
    // Return back current index after sorting based on order to make sure inline with original array
    setDynamicFieldIndex(fields, index) {
      return fields.findIndex(x => x.index === index)
    },
    setDynamicFieldKeyOptionsData(address, key, optionsFilter) {
      let { countries } = optionsFilter
      let name = key + 'Options'
      let options = []
      if (typeof this[name] !== 'undefined') {
        if (key === 'states') {
          let country = address.fields.find(x => x.key === 'countries')
          options = this[name].options.filter(item => item.country_id === country.value)
        }
        if (key === 'cities') {
          let stateFieldIndex = address.fields.findIndex(x => x.key === 'states')
          options = this[name].options.filter(item => item.state_id === address.fields[stateFieldIndex].value)
        }
        if (key === 'countries') {
          let filteredCountries = this[name].options
          if (countries.length > 0) {
            filteredCountries = filteredCountries.filter(x => countries.includes(x.value))
          }
          options = filteredCountries
        }
      }
      return options
    },
    async setAddressFormat(address, countryId) {
      await this.getDynamicContentAction({
        country_id: countryId,
        types: ['address'],
      })
      let fields = JSON.parse(JSON.stringify(this.fields))
      if (fields.address && fields.address.length > 0) {
        JSON.parse(fields.address).forEach(items => {
          items.fields.map(field => {
            if (field.type === 'select') {
              this.setSelectDataValue(field.value, field.type)
            }
            if (field.key === 'countries') {
              field.value = countryId
              this.setStates(countryId)
            }
            this.loadAddressFailed = false
            return field
          })
          address.fields = items.fields
        })
      } else {
        this.loadAddressFailed = true
      }
      return address
    },
    setSelectDataValue(id, key) {
      let name = key + 'Options'
      if (typeof this[name] !== 'undefined') {
        if (typeof this[name].options !== 'undefined') {
          let value = this[name].options.find(x => x.value === id)
          if (typeof value !== 'undefined') {
            return value.label
          }
        }
      }
      return ''
    },
    removeLastComma(str) {
      return str.replace(/,(\s+)?$/, '')
    },
    getAddressString(address, html = false, titleOnly = false) {
      if (typeof address === 'string') {
        address = JSON.parse(address)
      }
      if (Array.isArray(address)) {
        address = this.$helpers.getValue(address, '[0]', {})
      }
      if (titleOnly) {
        if (Object.keys(address).length > 0) {
          return address.title
        } else {
          return ''
        }
      }
      let divider = ', '
      if (html) {
        divider = ', </br>'
      }
      let countriesOptions = this.countriesOptions.options
      let statesOptions = this.statesOptions
      let citiesOptions = this.citiesOptions
      if (address && Object.keys(address).length > 0 && countriesOptions.length > 0) {
        // Country Data
        let countryField = address.fields ? address.fields.find(x => x.key === 'countries') : false
        let country = false
        let state = false
        let city = false
        if (countryField) {
          country = countriesOptions.find(x => x.value === countryField.value)
        }
        // State Data
        if (statesOptions.options.length > 0) {
          let stateField = address.fields ? address.fields.find(x => x.key === 'states') : false
          if (stateField) {
            state = statesOptions.options.find(x => x.value === stateField.value)
          }
        }
        // Cities Data
        if (citiesOptions.options.length > 0) {
          let cityField = address.fields ? address.fields.find(x => x.key === 'cities') : false
          if (cityField) {
            city = citiesOptions.options.find(x => x.value === cityField.value)
          }
        }
        return this.removeLastComma(
          this.sortDynamicFields(address.fields)
            .reduce((addressString, field) => {
              if (field.value !== null && field.value !== '') {
                if (field.key === 'countries' && country) {
                  addressString.push(country.label)
                } else if (field.key === 'states' && state) {
                  addressString.push(state.label)
                } else if (field.key === 'cities' && city) {
                  addressString.push(city.label)
                } else {
                  addressString.push(field.value)
                }
              }
              return addressString
            }, [])
            .filter(item => {
              return (typeof item === 'string' && item.trim().length > 0) || true
            })
            .join(', ')
        )
          .trim()
          .replace(/,/g, divider) // replace divider globally
      } else {
        return ''
      }
    },
    sortDynamicFieldsCountryStateCityTop(fields) {
      let keyOrder = ['countries', 'states', 'cities']
      let keyLabelOrder = ['country', 'state', 'city']
      return _.chain(fields)
        .orderBy('order', 'asc')
        .sortBy(item => (keyOrder.indexOf(item.key) !== -1 ? keyOrder.indexOf(item.key) : keyOrder.length))
        .sortBy(item =>
          keyLabelOrder.indexOf(item.label.toLowerCase()) !== -1
            ? keyLabelOrder.indexOf(item.label.toLowerCase())
            : keyOrder.length
        )
        .value()
    },
    getValidAddresses(addresses) {
      return addresses.map(address => {
        let countryField = address.fields.find(x => x.key === 'countries')
        let unfilledRequired = address.fields.filter(x => {
          return (
            x.required === true &&
            (x.value === '' || x.value === null || (typeof x.value === 'string' && x.value.trim() === ''))
          )
        })
        address.exclude = address.isCustom
          ? false
          : typeof countryField === 'undefined' ||
            countryField.value === '' ||
            countryField.value === null ||
            unfilledRequired.length > 0
        return address
      })
    },
    getSelectedAddressCountryId(address) {
      return (country => (country ? country.value : null))(
        this.$helpers.getValue(address, 'fields', []).find(item => item.key === 'countries')
      )
    },
  },
}
