// Do not change import url
import { filter, includes } from '../../../node_modules/lodash/lodash.js'

/**
 * Initiate route safeGuard
 * @param data
 * @param options
 * @returns {*}
 */
async function safeGuardRoutes(data, options) {
  let { disableAcl = false, countryId = null, userPermissions = [] } = options
  let i = 0
  let permissions = [...userPermissions]
  permissions = filter(permissions, x => includes(x, countryId))
  while (i < data.length) {
    if (!disableAcl) {
      let filteredPermission = permissions.filter(x => {
        // Break permission by country eg.sales.management.list.[1].backoffice.view, replace 1 with #
        const breakIndex = x
          .split(/[0-9]/)
          .join('!')
          .indexOf('!')
        // Break permission by # index
        const comparePath = x
          .substring(0, breakIndex - 1)
          .split('.')
          .join('/')
        // Remove url placeholders eg.sales/management/view/[:saleID] replace [:saleID] to /* from routes [] as identifier
        let path = data[i].modulePath ? data[i].modulePath : data[i].path
        const routeReplacePlaceholders = path.replace(/\s*([:[0-9a-zA-z?]+])\s*/g, '*')
        // Remove url placeholders eg.sales/management/view/[:saleID] => /management/view/*  remove /* => /management/view
        const routeFilterPlaceholders = routeReplacePlaceholders.replace(/\/\*/g, '')
        // Remove / from string to match /sales/management/view/[1] => sales/management/view/[1]
        const routeRoutePath = routeFilterPlaceholders.substring(1, routeFilterPlaceholders.length - 1)

        if (comparePath === routeRoutePath) {
          return x
        }
      })
      if (filteredPermission.length > 0) {
        if (data[i].meta !== undefined) {
          data[i].meta.permission = filteredPermission
        } else {
          console.error('Route R001:Meta.Missing')
        }
      } else {
        if (!['public', 'root'].includes(data[i].meta.permission)) {
          delete data[i].meta.permission
        }
      }
    } else {
      data[i].meta.permission = 'root'
    }
    if (typeof data[i].children !== 'undefined') {
      await safeGuardSubRoutes(data[i].children, 0, permissions, disableAcl)
    }
    i++
  }
  return [...data]
}

/**
 * Assign route safeGuard
 * @param current
 * @param depth
 * @param permissions
 * @param disableAcl
 */
async function safeGuardSubRoutes(current, depth, permissions, disableAcl) {
  let routes = current
  let j = 0
  while (j < routes.length) {
    await safeGuardSubRoutes(routes[j], depth + 1)
    if (!disableAcl) {
      let filteredPermission = permissions.filter(x => {
        // Break permission by country eg.sales.management.list.[1].backoffice.view, replace 1 with #
        const breakIndex = x
          .split(/[0-9]/)
          .join('!')
          .indexOf('!')
        // Break permission by # index
        const comparePath = x
          .substring(0, breakIndex - 1)
          .split('.')
          .join('/')
        // Remove url placeholders eg.sales/management/view/[:saleID] replace [:saleID] to /* from routes [] as identifier
        let path = routes[j].modulePath ? routes[j].modulePath : routes[j].path
        const routeReplacePlaceholders = path.replace(/\s*([:[0-9a-zA-z?]+])\s*/g, '*')
        // Remove url placeholders eg.sales/management/view/[:saleID] => /management/view/*  remove /* => /management/view
        const routeFilterPlaceholders = routeReplacePlaceholders.replace(/\/\*/g, '')
        // Remove / from string to match /sales/management/view/[1] => sales/management/view/[1]
        const routeRoutePath =
          routeFilterPlaceholders[0] === '/'
            ? routeFilterPlaceholders.substring(1, routeFilterPlaceholders.length)
            : routeFilterPlaceholders

        if (comparePath === routeRoutePath) {
          return x
        }
      })
      if (filteredPermission.length > 0) {
        if (routes[j].meta !== undefined) {
          routes[j].meta.permission = filteredPermission
        } else {
          console.error('Route R001:Meta.Missing')
        }
      } else {
        if (!['public', 'root'].includes(routes[j].meta.permission)) {
          delete routes[j].meta.permission
        }
      }
    } else {
      if (routes[j].meta !== undefined) {
        routes[j].meta.permission = 'root'
      } else {
        console.error('Route R001:Meta.Missing')
      }
    }
    if (typeof routes[j].children !== 'undefined') {
      await safeGuardSubRoutes(routes[j].children, 0, permissions, disableAcl)
    }
    j++
  }
  return Promise.resolve(true)
}

export default safeGuardRoutes
