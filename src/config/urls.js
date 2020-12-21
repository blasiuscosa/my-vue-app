import { DEV_API_PROXY } from 'src/store/localStorageKeys'

const requireComponent = require.context(
  // Look for files in the current directory
  '../application',
  // Look in  subdirectories
  true,
  // Only include "_base-" prefixed .vue files
  /api.js$/
)

export let endPoints = {}
// For each matching file name...
requireComponent.keys().forEach(fileName => {
  // Can use _ to turn route off
  if (fileName.indexOf('_') === -1) {
    endPoints = {
      ...endPoints,
      ...requireComponent(fileName).api,
    }
  }
})

/**
 *
 * @type {string}
 */
let apiProxy = localStorage.getItem(DEV_API_PROXY)
if (!process.env.DEV || apiProxy == null) {
  apiProxy = process.env.BACKEND_URL
}

export const url = {
  appStorageUrl: process.env.APP_STORAGE_URL,
  apiUrl: apiProxy,
  ctxPath: '/dist',
}
