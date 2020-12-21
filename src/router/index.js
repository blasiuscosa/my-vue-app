import Vue from 'vue'
import Router from 'vue-router'
import { merge } from 'lodash'
import store from 'src/store'

const requireComponent = require.context(
  // Look for files in the current directory
  '../application',
  // Look in  subdirectories
  true,
  // Only include "_base-" prefixed .vue files
  /router.js$/
)

let routes = []
// For each matching file name...
requireComponent.keys().forEach(fileName => {
  // Can use _ to turn route off
  if (fileName.indexOf('_') === -1) {
    routes = [...routes, ...requireComponent(fileName).default]
  }
})

Vue.use(Router)

const createRouter = (data = routes) =>
  new Router({
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
    linkActiveClass: 'open active in-view',
    routes: data,
  })

export let router = createRouter()

export let newRouter = {}

export async function resetRouter(data) {
  /** Merge guarded routes with original routes to get back functions **/
  data = merge(data, routes)
  newRouter = await createRouter(data)
  router.matcher = newRouter.matcher
}

function hasQueryParams(route) {
  return !!Object.keys(route.query).length
}

router.beforeEach((to, from, next) => {
  // Clear pending API calls
  Vue.prototype.$http.clear()
  // Clear form errors of previous route before move next route
  store.dispatch('resetErrorsAction')
  // if (!hasQueryParams(to) && hasQueryParams(from)) {
  //   next({ name: to.name, query: from.query })
  // } else {
  //   next()
  // }
  next()
})

router.afterEach((to, from) => {
  let body = document.querySelector('body')
  body.className = Vue.prototype.$customStore.getters.isLoggedIn ? 'dashboard-area' : 'auth-area'
})

export default router
