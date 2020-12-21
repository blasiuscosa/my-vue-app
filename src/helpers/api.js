import Vue from 'vue'
import axios from 'axios'

export function get(url, params, responseType = 'json') {
  return Vue.prototype.$http({
    method: 'GET',
    url: url,
    params: params,
    withCredentials: false,
    responseType: responseType,
    maxRedirects: 5,
  })
}

export function post(url, payload) {
  return Vue.prototype.$http({
    method: 'POST',
    url: url,
    data: payload,
    withCredentials: false,
    responseType: 'json',
    maxRedirects: 5,
  })
}

export function put(url, payload) {
  return Vue.prototype.$http({
    method: 'PUT',
    url: url,
    data: payload,
    withCredentials: false,
    responseType: 'json',
    maxRedirects: 5,
  })
}

export function patch(url, payload) {
  return Vue.prototype.$http({
    method: 'PATCH',
    url: url,
    data: payload,
    withCredentials: false,
    responseType: 'json',
    maxRedirects: 5,
  })
}

export function del(url) {
  return Vue.prototype.$http({
    method: 'DELETE',
    url: url,
    withCredentials: false,
    responseType: 'json',
    maxRedirects: 5,
  })
}

export function getCancelToken() {
  let CancelToken = axios.CancelToken
  return CancelToken.source()
}
