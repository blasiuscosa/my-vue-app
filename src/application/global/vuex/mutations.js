import {
  CLEAR_VALIDATION,
  CURRENT_UPDATE_ID,
  IS_PROCESSING,
  IS_PROCESSING_CART,
  IS_PROCESSING_CROSS_VALIDATION,
  IS_PROCESSING_FORM,
  IS_PROCESSING_LIST,
  IS_PROCESSING_REDIRECT,
  IS_PROCESSING_REFRESH_TOKEN,
  IS_PROCESSING_SECTION,
  IS_PROCESSING_TABLE,
  IS_PROCESSING_VALIDATION,
  OPEN_CLOSE_MODAL_FORM,
  RESET_ERRORS,
  RESET_USER_FIELD_VALIDATIONS,
  SET_ADDITIONAL_REQUIREMENTS_QUANTITY,
  SET_ALL_COUNTRIES,
  SET_AREA,
  SET_BUILDER_ROLE_PERMISSIONS,
  SET_CANCEL_TOKEN,
  SET_CATEGORIES,
  SET_CLASSIC_CROSS_SPONSORING_CHECK,
  SET_COMMISSION_WEEK_SEARCH_DATA,
  SET_COUNTRIES,
  SET_COUNTRIES_BANKS,
  SET_COUNTRIES_CALL_CODE,
  SET_COUNTRIES_STATE_CITIES,
  SET_COUNTRIES_STATES,
  SET_COUNTRY_RELATION_DATA,
  SET_DONE,
  SET_DYNAMIC_CONTENT_DATA,
  SET_FILTER_DATA,
  SET_FORM_DATA,
  SET_GIRO_TYPE,
  SET_HEADER_SEARCH_BAR_FIELD,
  SET_IS_UPDATE_AVAILABLE,
  SET_LANGUAGES,
  SET_LOCATION_TYPES,
  SET_MASTER_DATA,
  SET_MASTER_DATA_BY_KEY,
  SET_MEMBER_SEARCH_DATA,
  SET_QUEUE_REQUEST_RESPONSE,
  SET_SIMPLE_PAGINATION_DATA,
  SET_STOCK_LOCATIONS,
  SET_TRASH_DATA,
  SET_UPLOADER_FILE_UPLOAD_SETTING,
  SET_USER_AUTHORIZED_REPORTS,
  SET_USER_FIELD_VALIDATION,
  SET_USER_INFO,
  SET_USER_TYPES,
  SET_WEBSOCKET_STATUS,
  SHOW_NOTIFICATION,
  SOCKET_CONNECT,
  SOCKET_DISCONNECT,
  UNSET_ADDITIONAL_REQUIREMENTS_QUANTITY,
  UNSET_CHANNEL_DATA,
  UNSET_FILTER_DATA,
  UNSET_SIMPLE_PAGINATION_DATA,
  VALIDATION_FAILED,
  WRITE_CHANNEL_DATA,
  SET_STANDARD_MENU,
  SET_ERROR_OCCURRED,
  SET_ROUTES,
  SET_COUNTRIES_CALL_CODE_BY_COUNTRY_NAME,
  SET_STOCKIST_STATE_AND_CITIES,
  SET_SETTINGS_CONFIG,
  SET_LIST_ITEMS_DATA,
} from 'src/store/types'
import { FILTER_DATA, ERROR } from 'src/store/localStorageKeys'
import Vue from 'vue'
import helpers from 'src/helpers'
import _ from 'lodash'

export default {
  [SHOW_NOTIFICATION](state, action) {
    state.notification = { ...action }
  },
  [VALIDATION_FAILED](state, errors) {
    Vue.set(state.errors, 'data', errors)
  },
  [CLEAR_VALIDATION](state, name = false) {
    if (name && state.errors.data.errors !== undefined) {
      if (state.errors.data.errors[name] !== undefined) {
        Vue.delete(state.errors.data.errors, name)
      }
    } else {
      state.errors.data = {}
    }
  },
  [RESET_ERRORS](state) {
    Vue.set(state.errors, 'data', {})
  },
  [SET_FORM_DATA](state, payload) {
    Vue.set(state.formData, 'formData', payload.formData)
  },
  [IS_PROCESSING](state, status) {
    state.isProcessing = status
  },
  [IS_PROCESSING_FORM](state, status) {
    state.isProcessingForm = status
  },
  [IS_PROCESSING_TABLE](state, status) {
    state.isProcessingTable = status
  },
  [IS_PROCESSING_LIST](state, status) {
    state.isProcessingList = status
  },
  [IS_PROCESSING_SECTION](state, status) {
    state.isProcessingSection = status
  },
  [IS_PROCESSING_CART](state, status) {
    state.isProcessingCart = status
  },
  [IS_PROCESSING_VALIDATION](state, status) {
    state.isProcessingValidation = status
  },
  [IS_PROCESSING_CROSS_VALIDATION](state, status) {
    state.isProcessingCrossValidation = status
  },
  [IS_PROCESSING_REDIRECT](state, status) {
    state.isProcessingRedirect = status
  },
  [OPEN_CLOSE_MODAL_FORM](state, payload) {
    let data = [...state.openCloseModalForm.modalData]
    let modalIndex = data.findIndex(x => x.name === payload.name)
    if (modalIndex === -1) {
      data = [...data, ...[payload]]
    } else {
      data[modalIndex].status = payload.status
    }
    Vue.set(state.openCloseModalForm, 'modalData', data)
  },
  [CURRENT_UPDATE_ID](state, id) {
    state.currentUpdateId = id
  },
  [SET_USER_TYPES](state, options) {
    Vue.set(state.userTypes, 'data', options)
  },
  [SET_SIMPLE_PAGINATION_DATA](state, payload) {
    // foreach loop set key value using lodash
    // Vue.set used to maintain object reactivity
    if (!payload.unique) {
      _.forOwn(payload, function(value, key) {
        if (key === 'search' && key.value !== '') {
          Vue.set(state.simplePagination, 'offset', 0)
          Vue.set(state.simplePagination, 'search', payload.search)
        } else if (key === 'limit' || key.value === 0) {
          Vue.set(state.simplePagination, 'limit', payload.limit)
        } else if (key === 'currentPage' || key.value === 0) {
          Vue.set(state.simplePagination, 'currentPage', payload.currentPage)
        } else if (key === 'offset' || key.value === 0) {
          Vue.set(state.simplePagination, 'offset', payload.offset)
        }
      })
    } else {
      // custom unique pagination
      let key = Object.keys(payload)[1]
      state.simplePagination[key] = payload[key]
    }
  },
  [UNSET_SIMPLE_PAGINATION_DATA](state) {
    state.simplePagination = {
      currentPage: 1,
      limit: 10,
      offset: 0,
      search: '',
    }
  },
  [SET_COUNTRIES](state, options) {
    // state.roles.country
    Vue.set(state.countriesOptions, 'data', options)
  },
  [SET_ALL_COUNTRIES](state, options) {
    // state.roles.country
    Vue.set(state.allCountriesOptions, 'data', options)
  },
  [SET_CATEGORIES](state, options) {
    Vue.set(state.categoriesOptions, 'data', options)
  },
  [SET_MASTER_DATA](state, payload) {
    Vue.set(state.masterData, 'data', payload)
  },
  [SET_LANGUAGES](state, options) {
    Vue.set(state.languagesOptions, 'data', options)
  },
  [SET_DYNAMIC_CONTENT_DATA](state, payload) {
    Vue.set(state.dynamicContentData, 'data', payload.data)
  },
  [SET_COUNTRIES_STATES](state, payload) {
    Vue.set(state.statesOptions, 'data', payload)
  },
  [SET_COUNTRIES_STATE_CITIES](state, payload) {
    Vue.set(state.citiesOptions, 'data', payload)
  },
  [SET_TRASH_DATA](state, payload) {
    state.trashData.data.push(payload)
  },
  [SET_COUNTRIES_BANKS](state, payload) {
    Vue.set(state.banksOptions, 'data', payload)
  },
  [SET_DONE](state, status) {
    state.done = status
  },
  [SET_MEMBER_SEARCH_DATA](state, payload) {
    Vue.set(state.memberSearchDataGlobal, 'list', payload.list)
  },
  [SET_COUNTRY_RELATION_DATA](state, payload) {
    Vue.set(state.countryRelation, 'data', { ...state.countryRelation.data, ...payload.data })
  },
  [SET_HEADER_SEARCH_BAR_FIELD](state, value) {
    state.headerSearchBarField = value
  },
  [SET_COMMISSION_WEEK_SEARCH_DATA](state, payload) {
    Vue.set(state.commissionWeeks, 'list', payload.list)
  },
  [SET_USER_INFO](state, payload) {
    Vue.set(state.userInfo, 'data', payload.data)
  },
  [SET_WEBSOCKET_STATUS](state, status) {
    Vue.set(state.websocket, 'connected', status)
  },
  [WRITE_CHANNEL_DATA](state, payload) {
    state.websocket.channels.push(payload)
  },
  [SET_COUNTRIES_CALL_CODE](state, options) {
    Vue.set(state.countriesCallCodeOptions, 'data', options)
  },
  [SET_COUNTRIES_CALL_CODE_BY_COUNTRY_NAME](state, options) {
    Vue.set(state.countriesCallCodeByCountryNameOptions, 'data', options)
  },
  [UNSET_CHANNEL_DATA](state, payload) {
    let channelIndex = state.websocket.channels.findIndex(x => x.channel === payload)
    state.websocket.channels.splice(channelIndex, 1)
  },
  [SET_UPLOADER_FILE_UPLOAD_SETTING](state, payload) {
    Vue.set(state.uploaderFileUploadSetting, 'data', payload)
  },
  [IS_PROCESSING_REFRESH_TOKEN](state, status) {
    if (status) {
      state.errors = {}
    }
    state.isProcessingRefreshToken = status
  },
  [SET_FILTER_DATA](state, payload) {
    localStorage.setItem(FILTER_DATA, JSON.stringify(payload))
    Object.keys(payload).forEach(function(key) {
      let value = payload[key]
      Vue.set(state.selectedFilters, key, value)
    })
  },
  [UNSET_FILTER_DATA](state, payload) {
    Object.keys(payload).forEach(function(key) {
      Vue.delete(state.selectedFilters, key)
    })
  },
  [SET_GIRO_TYPE](state, payload) {
    Vue.set(state.giroTypes, 'list', payload.list)
  },
  [SET_STOCK_LOCATIONS](state, payload) {
    Vue.set(state.stockLocations, 'list', payload.list)
  },
  [SET_LOCATION_TYPES](state, payload) {
    Vue.set(state.locationTypes, 'list', payload.list)
  },
  [SET_CANCEL_TOKEN]: (state, payload) => {
    if (typeof state.accessTokens[payload.name] === 'undefined') {
      state.accessTokens[payload.name] = []
    }
    state.accessTokens[payload.name].push(payload.token)
  },
  [SET_MASTER_DATA_BY_KEY](state, payload) {
    Vue.set(state.masterData.data.list, payload.key, payload.data)
  },
  [SET_ADDITIONAL_REQUIREMENTS_QUANTITY](state, payload) {
    let index = state.additional_requirements.findIndex(
      x => x.kittingID === payload.kittingID && x.productID === payload.productID
    )
    if (index !== -1) {
      state.additional_requirements.splice(index, 1)
    }
    state.additional_requirements.push(payload)
  },
  [UNSET_ADDITIONAL_REQUIREMENTS_QUANTITY](state, payload) {
    if (payload !== undefined) {
      let index = state.additional_requirements.findIndex(
        x => x.kittingID === payload.kittingID && x.productID === payload.productID
      )
      if (index !== -1) {
        state.additional_requirements.splice(index, 1)
      }
    } else {
      state.additional_requirements.splice(0, state.additional_requirements.length)
    }
  },
  [SOCKET_CONNECT](state) {
    state.websocket.connected = true
  },
  [SET_IS_UPDATE_AVAILABLE](state, status) {
    state.isUpdateAvailable = status
  },
  [SOCKET_DISCONNECT](state) {
    state.websocket.connected = false
  },
  [SET_QUEUE_REQUEST_RESPONSE](state, payload) {
    // Todo remove after backend attach closable variable
    // Reset to default
    state.queue.response.closable = false
    state.queue.response = Object.assign({}, state.queue.response, payload)
  },
  [SET_USER_FIELD_VALIDATION](state, payload) {
    Vue.set(state.userValidation, 'status', payload)
  },
  [SET_AREA](state, payload) {
    Vue.set(state, 'area', payload)
  },
  [SET_CLASSIC_CROSS_SPONSORING_CHECK](state, payload) {
    Vue.set(state.externalAPIs, 'classicCrossSponsoringVerification', payload)
  },
  [RESET_USER_FIELD_VALIDATIONS](state, key) {
    if (key === 'userUniqueValidation') {
      Vue.set(state.userValidation, 'status', {})
    } else {
      Vue.set(state.externalAPIs, 'classicCrossSponsoringVerification', {})
    }
  },
  [SET_USER_AUTHORIZED_REPORTS](state, payload) {
    Vue.set(state.reports, 'data', payload.data)
  },
  [SET_BUILDER_ROLE_PERMISSIONS](state, payload) {
    let getExistingPermissionIndex = state.builder.permissions.findIndex(x => x.id === payload.id)
    if (getExistingPermissionIndex !== -1) {
      state.builder.permissions[getExistingPermissionIndex].permissions = [...payload.permissions]
    } else {
      state.builder.permissions.push(payload)
    }
  },
  [SET_STANDARD_MENU](state, payload) {
    payload = JSON.parse(JSON.stringify(payload))
    Vue.set(state.standardMenu, 'routes', helpers.sortMenu(payload))
  },
  [SET_ERROR_OCCURRED](state, payload = true) {
    localStorage.setItem(ERROR, payload)
  },
  [SET_ROUTES](state, payload) {
    Vue.set(state.routes, 'data', payload)
  },
  [SET_SETTINGS_CONFIG]: (state, data) => {
    state.settingsConfig = { ...state.settingsConfig, ...data }
  },
  [SET_STOCKIST_STATE_AND_CITIES](state, payload) {
    state.stockistStateAndCities[payload.country_id] = payload.data
  },
  [SET_LIST_ITEMS_DATA](state, payload) {
    state.listItems = [...payload]
  },
}
