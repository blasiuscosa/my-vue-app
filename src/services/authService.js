import axios from 'axios'

import {
  ACCESS_TOKEN,
  DEV_API_PROXY,
  EXPIRES_IN,
  EXPIRES_ON,
  LANG,
  META,
  PERMISSIONS,
  REFRESH_TOKEN,
  RETURN_URL,
} from 'src/store/localStorageKeys'

export function logout() {
  let localStorageApiProxy = localStorage.getItem(DEV_API_PROXY)
  localStorage.clear()
  if (localStorageApiProxy !== null) {
    localStorage.setItem(DEV_API_PROXY, localStorageApiProxy)
  }
  // Reset axios default Authorization
  axios.defaults.headers.common['Authorization'] = `Bearer null`
}

export function isAuthenticated() {
  return isLoggedIn()
}

export function getExpiresIn() {
  return localStorage.getItem(EXPIRES_IN)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN)
}

export function getReturnURL() {
  return localStorage.getItem(RETURN_URL)
}

export function getExpiresOn() {
  return localStorage.getItem(EXPIRES_ON)
}

export function clearExpiresIn() {
  localStorage.removeItem(EXPIRES_IN)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN)
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN)
}

export function clearReturnURL() {
  localStorage.removeItem(RETURN_URL)
}

export function clearExpiresOn() {
  localStorage.removeItem(EXPIRES_ON)
}

export function clearPermissions() {
  localStorage.removeItem(PERMISSIONS)
  localStorage.removeItem(META)
}

export function setAuth(auth) {
  const currentDateTime = new Date()
  let expiry = currentDateTime.setUTCSeconds(auth.expiresIn)
  localStorage.setItem(ACCESS_TOKEN, auth.accessToken)
  localStorage.setItem(REFRESH_TOKEN, auth.refreshToken)
  localStorage.setItem(EXPIRES_IN, auth.expiresIn)
  localStorage.setItem(EXPIRES_ON, expiry)
  axios.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`
}

export function setReturnURL(to) {
  localStorage.setItem(RETURN_URL, to)
}

export function isLoggedIn() {
  const accessToken = getAccessToken()
  if (accessToken !== null) {
    return true
  }
  return false
}

export function isTokenExpired() {
  const expirationDate = getExpiresOn()
  const currentDateTime = new Date()
  return expirationDate < currentDateTime
}

export function getLang() {
  return localStorage.getItem(LANG) !== null ? localStorage.getItem(LANG) : 'en'
}
