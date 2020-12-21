import constants from 'src/config/const'
import * as helpers from 'src/helpers/falsy-value-handler'
import Vue from 'vue'

export default actions => {
  let items = {}

  for (let [actionsKey, actionsEntry] of Object.entries(actions)) {
    let method, action, mappings
    if (actionsEntry === Object(actionsEntry)) {
      method = actionsKey
      action = actionsEntry.action || 'getMastersWithKey'
      mappings = actionsEntry.mappings || false
    }

    if (action && mappings && Object.keys(mappings).length > 0) {
      let payload = {
        keys: [],
      }
      for (let [mappingKey, mappingEntry] of Object.entries(mappings)) {
        let masterKeys = null
        if (helpers.isSet(constants, mappingKey)) {
          masterKeys = helpers.getValue(constants, mappingKey)
        } else {
          masterKeys = mappingKey
        }
        for (let [key, entry] of Object.entries(mappingEntry)) {
          items[key] = function() {
            let masterData = null
            if (typeof entry === 'string' && helpers.isSet(constants, entry)) {
              masterData = helpers.getValue(constants, entry)
            } else if (entry === 'options' || typeof entry === 'object') {
              let { uniqueOptions = [], customOptions = [], includeDefaultOptions = false, valueKey = 'id' } = entry
              return Vue.prototype.$customStore.getters.getMasterDataOptions(
                masterKeys,
                uniqueOptions,
                customOptions,
                includeDefaultOptions,
                valueKey
              )
            } else {
              masterData = key
            }
            return Vue.prototype.$customStore.getters.getMasterDataIdByKeyAndTitle(masterKeys, masterData)
          }
        }
        payload.keys.push(masterKeys)
      }
      items[method] = () => async (...args) => {
        await Vue.prototype.$customStore.dispatch(action, { ...payload, ...args[0] })
      }
    }
  }
  return items
}
