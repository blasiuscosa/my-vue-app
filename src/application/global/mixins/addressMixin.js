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
      storeAddresses: state => state.salesCMP.salesAddresses,
      appSettings: state => state.globalCMP.appSettings,
    }),
    ...mapGetters(['crossBorderDeliveryCountriesByCountry']),
  },
  data: () => ({
    selectedAddress: null,
    selectedCountry: null,
    selectedCountryByIndex: [],
    loadAddressFailed: false,
    // Enable or disable preload states and city on load
    enableMixinInitCheck: false,
    addresses: [],
  }),
  created() {
    if (this.storeAddresses.length > 0) {
      this.$set(this.addresses, this.storeAddresses)
    }
  },
  methods: {
    ...mapActions(['getDynamicContentAction', 'getStateAction', 'getCitiesAction']),
    initMixin(status) {
      let statesRequested = []
      let citiesRequested = []
      if (this.addresses.length > 0 && status) {
        this.addresses.forEach(obj => {
          Object.entries(obj).forEach(entry => {
            const [key, value] = entry
            if (key === 'fields') {
              value.forEach(item => {
                if (item.key === 'countries') {
                  if (!statesRequested.includes(item.value)) {
                    if (item.value !== '' && item.value !== null) {
                      statesRequested.push(item.value)
                      this.setStates(item.value)
                    }
                  }
                }
                if (item.key === 'states') {
                  if (!citiesRequested.includes(item.value)) {
                    if (item.value !== '' && item.value !== null) {
                      citiesRequested.push(item.value)
                      this.setCities(item.value)
                    }
                  }
                }
              })
            }
          })
        })
      }
    },
    setSelectedAddress(index) {
      this.selectedAddress = index
      this.selectedCountry = ''
    },
    sortDynamicFields(fields) {
      return _.orderBy(fields, 'order', 'asc')
    },
    // Return back current index after sorting based on order to make sure inline with original array
    setDynamicFieldIndex(fields, index) {
      return fields.findIndex(x => x.index === index)
    },
    setDynamicFieldKeyOptionsData(key, identifier, index1, index2, allCountries = false) {
      let name = key + 'Options'
      if (typeof this[name] !== 'undefined') {
        if (key === 'states') {
          let country = this.addresses[this.selectedAddress].fields.find(x => x.key === 'countries')
          return this[name].options.filter(item => item.country_id === country.value)
        }
        if (key === 'cities') {
          let stateFieldIndex = this.addresses[index1].fields.findIndex(x => x.key === 'states')
          return this[name].options.filter(
            item => item.state_id === this.addresses[index1].fields[stateFieldIndex].value
          )
        }
        if (key === 'countries') {
          return allCountries ? this[name].options : this.countriesActiveOptions.options
        }
      }
      return []
    },
    setAddressFormat() {
      if (this.addresses[this.selectedAddress].fields.length < 1) {
        let query = {
          country_id: this.getSelectedAddressCountryId(),
          types: ['address'],
        }
        this.getDynamicContentAction(query).then(res => {
          let fields = JSON.parse(JSON.stringify(this.fields))
          if (typeof fields.address !== 'undefined' && fields.address.length > 0) {
            JSON.parse(fields.address).forEach(items => {
              items.fields.forEach(field => {
                if (field.type === 'select') {
                  this.setSelectDataValue(field.value, field.type)
                }
                if (field.key === 'countries') {
                  field.value = this.selectedCountry
                  this.setStates(this.selectedCountry)
                }
                this.addresses[this.selectedAddress].fields.push(field)
                this.loadAddressFailed = false
              })
            })
          } else {
            this.loadAddressFailed = true
          }
        })
      }
    },
    setSelectDataValue(id, key, type) {
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
    setCountrySelectionOnSelectedAddress() {
      let selectedIndex = this.selectedCountryByIndex.findIndex(item => item.index === this.selectedAddress)
      if (selectedIndex !== -1) {
        this.selectedCountryByIndex.pop(selectedIndex)
      }
      this.selectedCountryByIndex.push({ index: this.selectedAddress, country_id: this.selectedCountry })
      this.setAddressFormat()
    },
    getSelectedAddressCountryId() {
      if (typeof this.selectedCountryByIndex !== 'undefined') {
        let id = this.selectedCountryByIndex.filter(item => item.index === this.selectedAddress)
        if (id.length > 0) {
          return id[0].country_id
        }
      }
      return 0
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
    async setCities(id, index1) {
      if (index1 !== undefined) {
        let fieldIndex = this.addresses[index1].fields.findIndex(x => x.key === 'cities')
        if (fieldIndex !== -1) {
          this.addresses[index1].fields[fieldIndex].value = ''
        }
      }
      if (typeof id !== 'undefined' && id !== null && id !== '') {
        let query = {
          state_id: id,
        }
        await this.getCitiesAction(query)
      }
    },
    setAddressFields(copyFrom, copyTo) {
      let copyFromData = this.addresses[copyFrom].fields
      if (copyFromData.length > 0) {
        this.addresses[copyTo].fields = JSON.parse(JSON.stringify(copyFromData))
        this.$q.notify({
          type: 'positive',
          timeout: this.appSettings.notifications.timeout,
          message: this.$t('Common.AddressCopied.Text'),
          icon: 'file_copy',
        })
      }
    },
    removeLastComma(str) {
      return str.replace(/,(\s+)?$/, '')
    },
    isShippingAddressCrossCountryDeliveryEligible(index, countryID) {
      if ((countryID !== null || countryID !== '') && this.enableCrossCountry) {
        if (this.addresses[index].fields.length > 0) {
          if (index > 3 && !this.isCustomAddressLimitCountry) {
            return true
          }
          let findFieldIndex = this.addresses[index].fields.findIndex(x => x.key === 'countries')
          if (findFieldIndex !== -1) {
            let eligible = false
            let allowedCrossCountryDeliveryCountries = this.crossBorderDeliveryCountriesByCountry
            if (allowedCrossCountryDeliveryCountries.length > 0) {
              let eligibleCountriesList = allowedCrossCountryDeliveryCountries.filter(
                x => x.value === this.addresses[index].fields[findFieldIndex].value
              )
              if (eligibleCountriesList.length > 0) {
                eligible = true
              }
            }
            return this.addresses[index].fields[findFieldIndex].value === countryID || eligible
          }
        } else {
          // Unknown country
          return true
        }
      }
      return false
    },
    getAddressString: vue => (address, html = false, titleOnly = false) => {
      if (titleOnly) {
        if (address !== undefined && Object.keys(address).length > 0) {
          return address.title
        } else {
          return ''
        }
      }
      let divider = ', '
      if (html) {
        divider = ', </br>'
      }
      let countriesOptions = vue.countriesOptions
      let statesOptions = vue.statesOptions
      let citiesOptions = vue.citiesOptions
      if (Object.keys(address).length > 0 && countriesOptions.length > 0) {
        // Country Data
        let countryField = address.fields.find(x => x.key === 'countries')
        let country = false
        let state = false
        let city = false
        if (countryField) {
          country = countriesOptions.find(x => x.id === countryField.value)
        }
        // State Data
        if (statesOptions.options.length > 0) {
          let stateField = address.fields.find(x => x.key === 'states')
          if (stateField) {
            state = statesOptions.options.find(x => x.value === stateField.value)
          }
        }
        // Cities Data
        if (citiesOptions.options.length > 0) {
          let cityField = address.fields.find(x => x.key === 'cities')
          if (cityField) {
            city = citiesOptions.options.find(x => x.value === cityField.value)
          }
        }
        return vue
          .removeLastComma(
            vue
              .sortDynamicFields(address.fields)
              .reduce((addressString, field) => {
                if (field.value !== null && field.value !== '') {
                  if (field.key === 'countries' && country) {
                    addressString.push(country.name)
                  } else if (field.key === 'states' && state) {
                    addressString.push(state.text)
                  } else if (field.key === 'cities' && city) {
                    addressString.push(city.text)
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
  },
}
