import { LOGGED_IN_STOCKIST_ID, LOGGED_IN_TOKEN, LOGGED_IN_USER_ID } from 'src/store/localStorageKeys'
import helpers from 'src/helpers'
import Vue from 'vue'
import _ from 'lodash'

export default {
  pagination: state => {
    return {
      limit: state.simplePagination.limit,
      offset: state.simplePagination.offset,
    }
  },
  paginationQuery: state => uuid => {
    let query
    if (uuid !== undefined && state.simplePagination[uuid] !== undefined) {
      query =
        '?limit=' +
        state.simplePagination[uuid].limit +
        '&offset=' +
        state.simplePagination[uuid].offset +
        '&search=' +
        state.simplePagination[uuid].search
    } else {
      query =
        '?limit=' +
        state.simplePagination.limit +
        '&offset=' +
        state.simplePagination.offset +
        '&search=' +
        state.simplePagination.search
    }
    return query
  },
  currentUpdateId: state => {
    return state.currentUpdateId
  },
  commissionWeeks: state => {
    return state.commissionWeeks
  },
  locationsOptionsByCountry: state => {
    if (typeof state.countryRelation.data.entity !== 'undefined') {
      if (
        typeof state.countryRelation.data.entity.locations !== 'undefined' &&
        state.countryRelation.data.entity.locations.length > 0
      ) {
        return state.countryRelation.data.entity.locations.map(opt => ({
          label: opt.code + ' - ' + opt.name,
          value: opt.id,
          type_id: opt.location_types_id,
          country_id: state.countryRelation.data.entity.country_id,
          allowed_shipping_methods: opt.delivery_method_options_ids,
        }))
      }
    }
    return []
  },
  crossBorderDeliveryCountriesByCountry: state => {
    if (typeof state.countryRelation.data.cross_country !== 'undefined') {
      if (state.countryRelation.data.cross_country.length > 0) {
        return state.countryRelation.data.cross_country.map(opt => ({
          label: opt.code + ' - ' + opt.name,
          value: opt.id,
        }))
      }
    }
    return []
  },
  stocklocationsOptionsByCountry: state => {
    return state.stockLocations.list
  },
  getstocklocationsByID: state => {
    return state.stockLocations.list
  },
  currencyLabelByCountry: state => {
    if (typeof state.countryRelation.data !== 'undefined') {
      if (typeof state.countryRelation.data.currency !== 'undefined' && state.countryRelation.data.currency !== null) {
        if (
          typeof state.countryRelation.data.currency.code !== 'undefined' &&
          state.countryRelation.data.currency.code !== null
        ) {
          return state.countryRelation.data.currency.code
        }
      }
    }
    return ''
  },
  callCodeOptionsByCountry: state => {
    return state.countriesCallCodeOptions.data.options
  },
  callCodeOptionsByCountryName: state => {
    return state.countriesCallCodeByCountryNameOptions.data.options
  },
  stockLocationsOptionsByCountry: state => {
    if (typeof state.countryRelation.data.stock_location !== 'undefined') {
      return state.countryRelation.data.stock_location.map(opt => ({
        label: opt.code + ' - ' + opt.name,
        value: opt.id,
        sublabel: opt.name,
        country_id: state.countryRelation.data.entity.country_id,
      }))
    }
    return []
  },
  formData: state => {
    if (Object.keys(state.formData).length > 0) {
      return JSON.parse(JSON.stringify(state.formData.formData))
    }
  },
  giroTypeByCountry: state => {
    if (state.giroTypes.list.length > 0) {
      return state.giroTypes.list
    } else {
      return []
    }
  },
  getLocationTypes: state => {
    if (state.locationTypes.list.length > 0) {
      return state.locationTypes.list
    } else {
      return []
    }
  },
  getSelectedFilters: state => {
    return state.selectedFilters
  },
  getUserType: state => {
    let type = ''
    if (state.userInfo.data.user_type !== undefined) {
      type = state.userInfo.data.user_type
    }
    return type
  },
  compareCountry: state => (id, code) => {
    let isExist = state.countriesOptions.data.options.findIndex(x => x.value === id && x.code_iso_2 === code)
    return isExist !== -1
  },
  getMasterData: state => {
    return state.masterData.data.list
  },
  getMasterDataIdByKeyAndTitle: state => (key, title) => {
    let data = state.masterData.data.list[key]
    if (typeof data !== 'undefined' && data.length > 0) {
      let row = data.find(x => x.title === title)
      if (typeof row !== 'undefined' && Object.keys(row).length > 0) {
        return row.id
      }
    }
    return ''
  },
  getMasterDataIdByKeyAndId: state => (key, id) => {
    let data = state.masterData.data.list[key]
    if (typeof data !== 'undefined' && data.length > 0) {
      let row = data.find(x => x.id === id)
      if (typeof row !== 'undefined' && Object.keys(row).length > 0) {
        return row
      }
    }
    return null
  },
  getCancelToken: state => name => {
    if (typeof state.accessTokens[name] === 'undefined') {
      return []
    }
    return state.accessTokens[name]
  },
  getDone: state => {
    return state.done
  },
  getAdditionalRequirementQty: state => (productID, kittingID) => {
    let item = state.additional_requirements.find(x => x.kittingID === kittingID && x.productID === productID)
    if (item !== undefined) {
      return item
    }
    return null
  },
  getIsUpdateAvailable: state => {
    return state.isUpdateAvailable
  },
  getUserToken: state => {
    return localStorage.getItem(LOGGED_IN_TOKEN)
  },
  getUserID: state => {
    return helpers.decrypt(localStorage.getItem(LOGGED_IN_USER_ID))
  },
  getStockistID: state => {
    return helpers.decrypt(localStorage.getItem(LOGGED_IN_STOCKIST_ID))
  },
  getQueueRequestResponse: state => {
    return state.queue.response
  },
  getFormHasErrors: state => {
    return state.errors.data !== undefined && state.errors.data.errors !== undefined
      ? Object.keys(state.errors.data.errors).length > 0
      : false
  },
  getCountryOptionsWithCustomOptions: state => (customOptions = []) => {
    return [...state.countriesOptions.data.options, ...customOptions]
  },
  getPrivateChannelNameWithUserID: state => channel => {
    return channel + '.' + helpers.decrypt(localStorage.getItem(LOGGED_IN_USER_ID))
  },
  getArea: state => {
    return state.area
  },
  getIsUserFieldUnique: state => {
    let result = null
    if (state.userValidation.status !== undefined) {
      result = state.userValidation.status.exists
    }
    return result
  },
  getExternalApiClassicCrossSponsoringVerificationPass: state => {
    let result = null
    if (Object.keys(state.externalAPIs.classicCrossSponsoringVerification).length > 0) {
      result = !!(
        (state.externalAPIs.classicCrossSponsoringVerification.result &&
          !state.externalAPIs.classicCrossSponsoringVerification.api_error) ||
        (!state.externalAPIs.classicCrossSponsoringVerification.result &&
          state.externalAPIs.classicCrossSponsoringVerification.api_error)
      )
    }
    return result
  },
  getExternalApiClassicCrossSponsoringVerificationHasApiError: state => {
    return Object.keys(state.externalAPIs.classicCrossSponsoringVerification).length > 0
      ? !state.externalAPIs.classicCrossSponsoringVerification.result &&
          state.externalAPIs.classicCrossSponsoringVerification.api_error
      : false
  },
  getAuthorizedReportsOptions: state => {
    let reports = state.reports.data
    let result
    const reportYearsGroupBy = (items, parentKey, key) =>
      items.reduce(
        (acc, curr) => ({
          ...result,
          [key + '-' + parentKey]: [
            ...(acc[key + '-' + parentKey] || []),
            {
              value: curr.year,
              label: curr.year.toString(),
            },
          ],
        }),
        {}
      )
    result = reports.reduce(
      (acc, curr) => {
        let reportTypeOptions = {}
        if (acc.reportTypeOptions[curr.user_type_id]) {
          if (!acc.reportTypeOptions[curr.user_type_id].find(x => x.value === curr.report_master_data.id)) {
            acc.reportTypeOptions[curr.user_type_id].push({
              value: curr.report_master_data.id,
              label: curr.report_master_data.title,
            })
          }
        } else {
          reportTypeOptions = {
            [curr.user_type_id]: [
              {
                value: curr.report_master_data.id,
                label: curr.report_master_data.title,
              },
            ],
          }
        }
        let reportCountryOptions = {}
        let countryKey = curr.report_master_data.id + '-' + curr.user_type_id
        if (acc.reportCountryOptions[countryKey]) {
          if (!acc.reportCountryOptions[countryKey].find(x => x.value === curr.country.id)) {
            acc.reportCountryOptions[countryKey].push({
              value: curr.country.id,
              label: curr.country.name,
            })
          }
        } else {
          reportCountryOptions = {
            [countryKey]: [
              {
                value: curr.country.id,
                label: curr.country.name,
              },
              { value: null, label: window.il8n.t('Common.AllCountries.Text') },
            ],
          }
        }
        let reportsAvailableYearsOptions = []
        curr.report_years.forEach(year => {
          let findYears = acc.reportsAvailableYearsOptions.find(avbYear => avbYear.value === year.year)
          if (findYears === undefined) {
            reportsAvailableYearsOptions.push({
              value: year.year,
              label: year.year.toString(),
            })
          }
        })
        acc.reportTypeOptions = { ...reportTypeOptions, ...acc.reportTypeOptions }
        acc.reportCountryOptions = { ...reportCountryOptions, ...acc.reportCountryOptions }
        acc.reportYearsOptions = {
          ...reportYearsGroupBy(curr.report_years, curr.country.id, curr.report_master_data.id),
          ...acc.reportYearsOptions,
        }
        acc.reportsAvailableYearsOptions = [...reportsAvailableYearsOptions, ...acc.reportsAvailableYearsOptions]
        return acc
      },
      { reportTypeOptions: {}, reportYearsOptions: {}, reportCountryOptions: {}, reportsAvailableYearsOptions: [] }
    )
    return result
  },
  memberDependentConfigOptionsByCountry: state => {
    let data = helpers.getValue(state, 'countryRelation.data.member_dependent_config', [])
    return data.map(opt => ({
      label: opt.status_code.title + ' - ' + opt.status_description.title,
      value: opt.id,
    }))
  },
  getBuilderRolePermissionByID: state => id => {
    let permissions = []
    let storePermissions = state.builder.permissions.find(x => x.id === id)
    if (storePermissions !== undefined) {
      permissions = storePermissions.permissions
    }
    return permissions
  },
  getStandardMenu: state => {
    return state.standardMenu.routes
  },
  isErrorOccurred: state => {
    return state.isErrorOccurred
  },
  isAnyModalActive: state => {
    return state.openCloseModalForm.modalData.filter(x => x.status).length > 0
  },
  getBackendSetting: state => configKey => {
    return state.settingsConfig[configKey] || false
  },
  getBackendConfig: state => configKey => {
    let config = state.settingsConfig[configKey] || false
    if (config) {
      return _.map(config.model, 'value') || []
    }
    return []
  },
  getMasterDataOptions: state => (
    key,
    uniqueOptions = null,
    customOptions = [],
    includeDefaultOptions,
    valueKey = 'id'
  ) => {
    let masterData = state.masterData.data.list
    if (masterData[key] !== undefined) {
      // Special case used when need to compare master data value with user specified
      if (uniqueOptions && uniqueOptions.length > 0) {
        let union = masterData[key].filter(original => uniqueOptions.find(compare => original.id === compare))
        return union.map(opt => ({ label: opt.title, value: opt.id }))
      }
      // Change map value key if needed
      masterData = masterData[key].map(opt => ({
        label: opt.title,
        value: valueKey === 'title' ? opt[valueKey].toLowerCase().replace(/ /g, '_') : opt[valueKey],
      }))

      let defaultOptions = includeDefaultOptions ? [{ title: 'Please choose one', value: null }] : []

      return [...masterData, ...customOptions, ...defaultOptions]
    }
    return []
  },
  getStockistStatesByCountry: state => payload => {
    return Array.isArray(state.stockistStateAndCities[payload.countryId])
      ? state.stockistStateAndCities[payload.countryId]
          .filter(
            st =>
              typeof st.location_id !== 'undefined' &&
              st.location_id !== null &&
              (payload.id ? st.id === payload.id : true) &&
              (payload.location_id ? st.location_id === payload.location_id : true)
          )
          .map(item => {
            return {
              id: item.location_id,
              value: item.id,
              label: (item.state !== null && item.state !== undefined ? item.state.name + ' - ' : '') + item.area,
              address_data: JSON.parse(item.address_data),
              name: item.display_name,
              country_id: item.country_id,
              state_id: item.state_id,
              city_id: item.city_id,
              area: item.area,
              location_id: item.location_id,
              telephone_num: item.telephone_num,
              telephone_code_id: item.telephone_code_id,
              mobile_phone_num: item.mobile_phone_num,
              mobile_phone_code_id: item.mobile_phone_code_id,
            }
          })
      : []
  },
  getListItems: state => {
    return state.listItems
  },
}
