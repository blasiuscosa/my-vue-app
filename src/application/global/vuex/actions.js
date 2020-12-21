import { lowerThenCapitalize } from 'src/helpers/filters'
import { get, post, getCancelToken } from 'src/helpers/api'
import { api } from '../api'
import {
  CLEAR_VALIDATION,
  CURRENT_UPDATE_ID,
  OPEN_CLOSE_MODAL_FORM,
  RESET_ERRORS,
  SET_ALL_COUNTRIES,
  SET_AREA,
  SET_BUILDER_ROLE_PERMISSIONS,
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
  SET_GIRO_TYPE,
  SET_IS_UPDATE_AVAILABLE,
  SET_LANGUAGES,
  SET_LOCATION_TYPES,
  SET_LOGIN_INFO,
  SET_MASTER_DATA,
  SET_MASTER_DATA_BY_KEY,
  SET_MEMBER_SEARCH_DATA,
  SET_SIMPLE_PAGINATION_DATA,
  SET_STOCK_LOCATIONS,
  SET_UPLOADER_FILE_UPLOAD_PROCESS,
  SET_UPLOADER_FILE_UPLOAD_SETTING,
  SET_USER_AUTHORIZED_REPORTS,
  SET_USER_FIELD_VALIDATION,
  SET_USER_INFO,
  SET_USER_TYPES,
  SHOW_NOTIFICATION,
  SET_SETTINGS_CONFIG,
  SET_CANCEL_TOKEN,
  SET_COUNTRIES_CALL_CODE_BY_COUNTRY_NAME,
  SET_STOCKIST_STATE_AND_CITIES,
  SET_LIST_ITEMS_DATA,
} from 'src/store/types'
import _ from 'lodash'
import Vue from 'vue'
import error from '../../../pages/error'

export const resetErrorsAction = ({ commit }) => {
  commit(RESET_ERRORS)
}

export const clearValidationAction = ({ commit }, name) => {
  commit(CLEAR_VALIDATION, name)
}

export const openCloseModalAction = ({ commit }, payload) => {
  commit(OPEN_CLOSE_MODAL_FORM, payload)
}

export const currentUpdateIdAction = ({ commit }, payload) => {
  commit(CURRENT_UPDATE_ID, payload)
}

export const getUserTypesAction = ({ commit }) => {
  return new Promise(resolve => {
    get(api.userTypes).then(response => {
      const json = response.data
      commit(SET_USER_TYPES, {
        options: json.map(opt => ({ label: lowerThenCapitalize(opt.name), value: opt.id })),
      })
      resolve(response.data)
    })
  })
}

export const setSimplePaginationAction = ({ commit }, payload) => {
  return new Promise(resolve => {
    commit(SET_SIMPLE_PAGINATION_DATA, payload)
    resolve(payload)
  })
}

export const getCountriesAction = ({ commit }) => {
  return new Promise((resolve, reject) => {
    let query = {
      order: 'asc',
    }
    post(api.countries, query)
      .then(response => {
        const json = response.data.data
        const activeCountries = json.filter(x => x.active === 1)
        commit(SET_COUNTRIES, {
          options: activeCountries.map(opt => ({
            label: opt.eshop_name ? opt.eshop_name : opt.name,
            value: opt.id,
            code: opt.code,
            code_iso_2: opt.code_iso_2,
            name: opt.name,
          })),
        })
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const getAllCountriesAction = ({ commit }) => {
  return new Promise(resolve => {
    let query = {
      limit: 500,
      order: 'asc',
    }
    post(api.countriesAll, query).then(response => {
      const json = response.data.data
      commit(SET_ALL_COUNTRIES, {
        options: json.map(opt => ({
          label: opt.name,
          value: opt.id,
          code: opt.code,
          code_iso_2: opt.code_iso_2,
        })),
      })
      commit(SET_COUNTRIES_CALL_CODE, {
        options: json.map(opt => ({
          label: opt.code_iso_2 + ' +' + opt.call_code,
          value: opt.id,
          code: opt.call_code,
        })),
      })
      commit(SET_COUNTRIES_CALL_CODE_BY_COUNTRY_NAME, {
        options: json.map(opt => ({
          label: opt.name,
          value: opt.id,
          code: opt.call_code,
        })),
      })
      resolve(response.data)
    })
  })
}

export const getCategoriesAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.categories, query).then(response => {
      const json = response.data.data
      commit(SET_CATEGORIES, {
        options: json.map(opt => ({ label: lowerThenCapitalize(opt.name), value: opt.id })),
      })
      resolve(response.data)
    })
  })
}

export const getMastersWithKey = ({ state, commit, dispatch }, payload) => {
  commit(SET_DONE, false)
  if (payload && payload.identifier) {
    dispatch('wait/start', payload.identifier, { root: true })
  }
  return new Promise(resolve => {
    post(api.mastersKey, payload)
      .then(response => {
        let json = response.data
        // Merge with previous list to to avoid same keys duplication
        if (Object.keys(state.masterData.data.list).length > 0) {
          // Deep merge with filtering & get intersect of master data by comparing latest master data from response
          if (Object.keys(json).length > 0) {
            for (let key in json) {
              if (json[key] !== undefined) {
                let keyData = _.intersection(json[key], state.masterData.data.list[key])
                commit(SET_MASTER_DATA_BY_KEY, { key: key, data: keyData })
              }
            }
          }
          json = _.merge(json, state.masterData.data.list)
        }
        commit(SET_MASTER_DATA, {
          list: json,
        })
        commit(SET_DONE, true)
        if (payload.identifier) {
          dispatch('wait/end', payload.identifier, { root: true })
        }
        resolve(response.data)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

export const uploadSuccessAction = ({ commit }) => {
  commit(SHOW_NOTIFICATION, { title: 'Success :', message: 'Images uploaded.', type: 'positive' })
}

export const uploadErrorsAction = ({ commit }, payload) => {
  commit(SHOW_NOTIFICATION, { title: 'Upload Error :', message: payload, type: 'warning' })
}

export const getLanguagesAction = ({ commit }, query = {}) => {
  return new Promise((resolve, reject) => {
    post(api.languages, query)
      .then(response => {
        const json = response.data.data
        commit(SET_LANGUAGES, {
          options: json.map(opt => ({ label: lowerThenCapitalize(opt.name), value: opt.id, key: opt.key })),
        })
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const getDynamicContentAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.dynamicContent, query).then(response => {
      const json = response.data
      commit(SET_DYNAMIC_CONTENT_DATA, {
        data: json,
      })

      resolve(response.data)
    })
  })
}

export const getStateAction = ({ state, commit }, query) => {
  return new Promise(resolve => {
    post(api.countryRelation, query).then(response => {
      let json = response.data
      let newStates = []
      newStates = json.states.map(opt => ({
        label: lowerThenCapitalize(opt.name),
        value: opt.id,
        country_id: opt.country_id,
      }))
      if (Object.keys(state.statesOptions.data.options).length > 0) {
        // Merge options to avoid duplication retain list
        newStates = _.uniqBy([...newStates, ...state.statesOptions.data.options], 'value')
      }
      commit(SET_COUNTRIES_STATES, {
        options: newStates,
      })
      setTimeout(() => {
        resolve(response.data)
      }, 2000)
    })
  })
}

export const getCitiesAction = ({ state, commit }, query) => {
  return new Promise(resolve => {
    get(api.states + query.state_id).then(response => {
      let json = response.data
      let newCities = json.cities.map(opt => ({
        label: lowerThenCapitalize(opt.name),
        value: opt.id,
        state_id: opt.state_id,
      }))
      if (Object.keys(state.citiesOptions.data.options).length > 0) {
        // Merge options to avoid duplication retain list
        newCities = _.uniqBy([...newCities, ...state.citiesOptions.data.options], 'value')
      }
      commit(SET_COUNTRIES_STATE_CITIES, {
        options: newCities,
      })
      setTimeout(() => {
        resolve(response.data)
      }, 2000)
    })
  })
}

export const getCountriesBankAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.countryRelation, query).then(response => {
      let json = response.data
      commit(SET_COUNTRIES_BANKS, {
        options: json.banks.map(opt => ({
          label: lowerThenCapitalize(opt.name),
          value: opt.id,
          swift_code: opt.swift_code,
        })),
      })
      resolve(response.data)
    })
  })
}

export const getMemberSearchAction = async ({ commit, dispatch }, query) => {
  return new Promise(resolve => {
    post(api.searchMember, query).then(response => {
      const json = Vue.prototype.$helpers.getValue(response, 'data.data', [])
      commit(SET_MEMBER_SEARCH_DATA, {
        list: json.map(opt => ({
          label: opt.name,
          value: opt.user_id,
          userID: opt.user_id,
          sublabel: opt.user.old_member_id.toString(),
          icPassportNumber: opt.ic_passport_number,
        })),
      })

      resolve(response)
    })
  })
}

export const getCountryRelationAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.countryRelation, query).then(response => {
      let json = response.data
      commit(SET_COUNTRY_RELATION_DATA, {
        data: json,
      })

      resolve(response.data)
    })
  })
}

export const getCommissionWeekSearchAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.commissionWeek, query).then(response => {
      const json = response.data.data
      commit(SET_COMMISSION_WEEK_SEARCH_DATA, {
        list: json.map(opt => ({ label: opt.cw_name, value: opt.id })),
      })

      resolve(response.data)
    })
  })
}

export const getUserDetailsAction = ({ commit }) => {
  return new Promise((resolve, reject) => {
    get(api.userDetails)
      .then(response => {
        const json = response.data
        commit(SET_USER_INFO, {
          data: json,
        })
        commit(SET_LOGIN_INFO, json)
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const updateWorkflowAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.workflowUpdate, query).then(response => {
      resolve(response.data)
    })
  })
}

export const getUploaderFileUploadSetting = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.fileUploadSetting, query).then(response => {
      commit(SET_UPLOADER_FILE_UPLOAD_SETTING, response.data)
      resolve(response.data)
    })
  })
}

export const getUploaderFileUploadProcess = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.fileUploadSetting, query).then(response => {
      commit(SET_UPLOADER_FILE_UPLOAD_PROCESS, response.data)
      resolve(response.data)
    })
  })
}

export const getGiroTypeAction = ({ commit }, query) => {
  return new Promise((resolve, reject) => {
    get(api.giroType + '/' + query.country_id)
      .then(response => {
        const json = response.data.giro_types
        commit(SET_GIRO_TYPE, {
          list: json.map(opt => ({ label: opt, value: opt })),
        })

        resolve(response.data)
      })
      .catch(error => {
        commit(SET_GIRO_TYPE, {
          list: [],
        })
        reject(error)
      })
  })
}

export const getInventoryProcurementSystemAccessTokenAction = ({ commit }, query = {}) => {
  return new Promise(resolve => {
    post(api.inventoryProcurementAccessToken, query).then(response => {
      setTimeout(() => {
        resolve(response.data)
      }, 1000)
    })
  })
}

export const getStockLocations = ({ commit }, query) => {
  return new Promise(resolve => {
    if (query.location_id !== '' && query.location_id !== undefined && query.location_id !== null) {
      get(api.stockLocations + '/' + query.location_id).then(response => {
        const json = response.data.stock_locations
        commit(SET_STOCK_LOCATIONS, {
          list: json.map(opt => ({ label: opt.code, sublabel: opt.name, value: opt.id })),
        })

        resolve(response.data)
      })
    } else {
      // Return empty if no trans location
      commit(SET_STOCK_LOCATIONS, { list: [] })
    }
  })
}

export const getLocationTypeList = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.getLocationTypes, query).then(response => {
      const json = response.data.data
      commit(SET_LOCATION_TYPES, {
        list: json.map(opt => ({ label: opt.name, value: opt.id })),
      })

      resolve(response.data)
    })
  })
}

export const requestMobileNumberValidationAction = ({ commit }, query) => {
  return new Promise((resolve, reject) => {
    post(api.requestMobileNumberValidation, query)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const performMobileNumberValidationAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.verifyMobileNumber, query).then(response => {
      resolve(response.data)
    })
  })
}

export const requestEmailValidationAction = ({ commit }, query) => {
  return new Promise((resolve, reject) => {
    post(api.requestEmailValidation, query)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export const performEmailValidationAction = ({ commit }, query) => {
  return new Promise(resolve => {
    post(api.verifyEmail, query).then(response => {
      resolve(response.data)
    })
  })
}

export const setIsUpdateAvailableAction = ({ commit }, status) => {
  commit(SET_IS_UPDATE_AVAILABLE, status)
}

export const userFieldUniqueCheck = async ({ commit, dispatch }, query) => {
  await commit(SET_USER_FIELD_VALIDATION, {})

  return new Promise((resolve, reject) => {
    post(api.userFieldVerification, query)
      .then(response => {
        if (response !== undefined) {
          commit(SET_USER_FIELD_VALIDATION, response.data)
        }
        resolve(response)
      })
      .catch(error => {
        commit(SET_USER_FIELD_VALIDATION, {})
        reject(error)
      })
  })
}

export const setArea = async ({ commit }, payload) => {
  await commit(SET_AREA, payload)
}

export const userFieldClassicCrossSponsoringCheck = async ({ commit, dispatch }, query) => {
  commit(SET_CLASSIC_CROSS_SPONSORING_CHECK, {})

  return new Promise((resolve, reject) => {
    post(api.userFieldClassicCrossSponsoringCheck, query)
      .then(response => {
        if (response !== undefined) {
          commit(SET_CLASSIC_CROSS_SPONSORING_CHECK, response.data)
        }
        resolve(response)
      })
      .catch(error => {
        commit(SET_CLASSIC_CROSS_SPONSORING_CHECK, {})
        reject(error)
      })
  })
}

export const getUserAuthorizedReports = ({ commit }) => {
  return new Promise(resolve => {
    get(api.userAuthorizedReports).then(response => {
      const json = response.data
      commit(SET_USER_AUTHORIZED_REPORTS, {
        data: json,
      })

      resolve(response.data)
    })
  })
}

export const setBuilderRolePermissions = ({ commit }, payload) => {
  if (payload.id !== undefined) {
    let finalPayload = {
      id: payload.id,
      permissions: [...payload.permissions.ids],
    }
    commit(SET_BUILDER_ROLE_PERMISSIONS, finalPayload)
  }
}

export const setBackendSetting = async ({ commit, dispatch }, payload = []) => {
  return new Promise(resolve => {
    post(api.settings, { keys: payload }).then(response => {
      commit(SET_SETTINGS_CONFIG, response.data)
      resolve(response.data)
    })
  })
}

export const setBackendConfig = async ({ commit, dispatch }, payload = []) => {
  return new Promise(resolve => {
    get(api.config + payload).then(response => {
      let { value } = response.data
      commit(SET_SETTINGS_CONFIG, { [value]: response.data })
      resolve(response.data)
    })
  })
}

export const generateCancelToken = async ({ state, commit, getters }, name) => {
  getters.getCancelToken(name).forEach((token, index, object) => {
    object.splice(index, 1)
    token.cancel('System cancel duplicate request => ' + name)
  })
  let cancelToken = getCancelToken()
  commit(SET_CANCEL_TOKEN, { name: name, token: cancelToken })
  return cancelToken
}

export const loadStockistStateAndCities = ({ commit, dispatch, getters }, countryId) => {
  let query = {
    country_id: countryId,
    relations: ['state'],
  }
  return post(api.locationsAddresses, query).then(response => {
    commit(SET_STOCKIST_STATE_AND_CITIES, {
      country_id: countryId,
      data: response.data.data,
    })
  })
}

export const getListItemAction = async ({ commit, dispatch }, query = []) => {
  return new Promise(resolve => {
    get(api.listItems + query).then(response => {
      commit(SET_LIST_ITEMS_DATA, response.data.data)
      resolve(response.data)
    })
  })
}
