/* eslint-disable no-unused-vars */
import helpers from 'src/helpers'
import { ERROR, DENIED_ROUTE_NAME, NEXT_URL, RETURN_URL, PERMISSIONS } from 'src/store/localStorageKeys'
import { isAuthenticated } from 'src/services/authService'
import querystring from 'querystring'
import Wrapper from 'src/workers'

let globalCounter = 0

class Acl {
  async aclPropagationStatusCheck() {
    if (globalCounter === 0) {
      return new Promise(resolve => {
        let checkPropagationByInterval = setInterval(async () => {
          if (this.propagationCompleted === true) {
            clearInterval(checkPropagationByInterval)
            globalCounter = 0
            return resolve(true)
          }
        }, 100)
      })
    }
    globalCounter++
  }

  async aclRouterGuardBuilder() {
    const wrapper = new Wrapper()
    let data = {
      routes: this.localRouter.options.routes,
      disableAcl: this.disable,
      countryId: this.country,
      userPermissions: this.permissions,
    }
    await wrapper
      .oche(JSON.stringify(data))
      .then(async routes => {
        await this.aclUpdate(routes)
        await this.store.commit('SET_STANDARD_MENU', routes)
      })
      .catch(error => {
        return Promise.reject(error)
      })
  }

  aclRouterIntegration(router) {
    if (typeof router === 'object') {
      router.beforeEach(async (to, from, next) => {
        /** Developer config related paths allow if development env **/
        if (process.env.DEV && helpers.RouteHasPath(to.path, 'developer')) {
          return next()
        }
        if (to.path === this.denyPath && from.path === '/') {
          return next(this.initPath)
        }
        if (to.meta.permission === 'public' || to.meta.permission === 'root') {
          if (isAuthenticated() && (helpers.RouteHasPath(to.path, this.authPath) || to.path === '/')) {
            return next(this.homePath)
          } else if (!isAuthenticated() && (to.path === this.initPath || to.path === '/')) {
            return next(this.authPath)
          } else {
            if (localStorage.getItem(ERROR)) {
              localStorage.removeItem(ERROR)
              return next(this.initPath)
            }
            return next()
          }
        } else if (!this.propagationCompleted) {
          /** Set current url if route propagation not completed */
          let path = to.path + '?' + querystring.stringify(to.query)
          localStorage.setItem(NEXT_URL, path)
          return next(this.initPath)
        } else {
          let failPath = to.meta.fail || this.denyPath || from.fullPath
          if (!(await this.aclPermissionProcessor(to.meta.permission))) {
            localStorage.setItem(DENIED_ROUTE_NAME, to.meta.title)
            return next(failPath)
          }
        }

        /** Remove Storage URLs */
        localStorage.removeItem(RETURN_URL)
        localStorage.removeItem(NEXT_URL)
        localStorage.removeItem(DENIED_ROUTE_NAME)
        return next()
      })
    } else {
      console.error('Vue Router Plugin Missing')
    }
  }

  async aclPermissionProcessor(permission = false, request = false) {
    let pass = null
    if (request && !this.disable && globalCounter === 0) {
      await this.aclPropagationStatusCheck()
      let path = this.newRouter.resolve(helpers.getValue(this.localRouter, 'currentRoute.path', '/'))
      permission = helpers.getValue(path, 'route.meta.permission', [])
    }

    if (this.disable || permission === 'public' || permission === 'root') {
      pass = true
    } else if (!permission) {
      pass = false
    }

    if (pass === null) {
      const permissions = permission.indexOf('|') !== -1 ? permission.split('|') : [permission]
      pass = this.aclPermissionEvaluate(permissions) !== undefined
      if (request && !pass) {
        localStorage.setItem(
          DENIED_ROUTE_NAME,
          helpers.getValue(this.localRouter, 'currentRoute.meta.title', '--UNKNOWN--')
        )
        this.localRouter.replace(this.denyPath)
      }
    }
    return pass
  }

  aclPermissionEvaluate(permissions) {
    return permissions.find(permission => {
      let allowedData = permission.indexOf('&') !== -1 ? permission.split('&') : permission
      let filterAllowedDataByCountry = allowedData.filter(allow => {
        /** return permission that allowed for user selected country */
        return allow.indexOf(this.country) !== -1
      })
      if (Array.isArray(filterAllowedDataByCountry)) {
        return filterAllowedDataByCountry.findIndex(allowed => this.permissions.includes(allowed)) !== -1
      }
      return this.permissions.indexOf(filterAllowedDataByCountry) !== -1
    })
  }

  aclPermissionDestructor(permissions) {
    if (permissions.indexOf('&') !== -1) {
      permissions = permissions.split('&')
    }
    return Array.isArray(permissions) ? permissions : [permissions]
  }

  aclPermissionUpdate() {
    if (this.save !== true) {
      return
    }
    let permissions = this.permissions
    if (Array.isArray(this.permissions)) {
      permissions = this.permissions.join('&')
    }
    if (permissions !== '') {
      /** Set permissions to Storage */
      localStorage.setItem('permissions', permissions)
    }
  }

  async aclRefresh(options) {
    /** Start routeGuard loader **/
    this.store.dispatch('wait/start', 'routerGuardBuilder', { root: true })
    this.propagationCompleted = false
    this.initial = options['initial'] || false
    this.disable = options['disable'] || this.disable
    this.permissions = this.aclPermissionDestructor(options['permissions'] || this.permissions)
    this.country = options['country'] || this.country
    this.schema = options['schema'] || this.schema
    await this.aclRouterGuardBuilder()
  }

  async aclUpdate(routes = []) {
    let router = require('src/router')
    this.propagationCompleted = true
    await router.resetRouter(routes)
    this.newRouter = router.newRouter
    this.aclPermissionUpdate()
    /** ReInit router */
    let nextURL = localStorage.getItem(NEXT_URL)
    let returnURL = localStorage.getItem(RETURN_URL)
    if (returnURL !== null && returnURL !== this.initPath) {
      this.localRouter.push(returnURL)
    } else {
      if (nextURL === null) {
        if (this.initial) {
          this.localRouter.push(this.homePath)
        }
      } else {
        this.localRouter.push(nextURL)
      }
    }
    /** End routeGuard loader **/
    this.store.dispatch('wait/end', 'routerGuardBuilder', { root: true })
  }

  aclInitialize(vue, store, router, initPermissions, authPath, homePath, denyPath, initPath, save) {
    /** Retrieve permission from Storage */
    let localStoragePermissions = localStorage.getItem(PERMISSIONS)
    this.store = store
    this.localRouter = router
    this.save = save
    this.country = 0
    this.propagationCompleted = false
    this.schema = []
    this.disable = false
    this.newRouter = {}

    this.aclRouterIntegration(router)

    if (localStoragePermissions !== null) {
      initPermissions = localStoragePermissions
    }

    this.permissions = this.aclPermissionDestructor(initPermissions)
    this.aclPermissionUpdate()
    /** Auth route path */
    this.authPath = authPath
    /** Home route path */
    this.homePath = homePath
    /** failed route path */
    this.denyPath = denyPath
    /** SaveGuard dynamic route paths */
    this.initPath = initPath
  }

  aclLocalSchemaProcessor(schemaKeys) {
    if (typeof schemaKeys === 'string') {
      let pathData = {}
      let actionData = {}
      let keys = schemaKeys.split('|')
      if (keys.length >= 2) {
        pathData = this.schema.find(x => x.path === keys[0])
        if (pathData !== undefined) {
          if (Object.keys(pathData).length > 0) {
            actionData = pathData.items.find(y => y.action === keys[1])
          }
          if (actionData !== undefined) {
            if (Object.keys(actionData).length > 0) {
              return actionData.allowed
            }
          }
        }
      } else {
        return schemaKeys
      }
    }
    return []
  }
}

export default Acl
