import EscapeStringRegex from 'escape-string-regexp'
import Store from '../store'

export const RouteHasPath = function(route, path, parentOnly = false) {
  let regEx = new RegExp(EscapeStringRegex(path))
  if (typeof route === 'string') {
    // route is a path
    let result = false
    if (parentOnly) {
      let routes = route.split('/')
      let paths = path.split('/')
      if (routes.length > 0 && paths.length > 0) {
        let parentRegEx = new RegExp(EscapeStringRegex(paths[1]))
        result = parentRegEx.test(routes[1])
      }
    } else {
      result = regEx.test(route)
    }
    return result
  } else {
    return route.matched.some(route => {
      return regEx.test(route.path)
    })
  }
}

export const CurrentRouteHasPath = function(path, parentOnly = false) {
  return RouteHasPath(Store.state.route.path, path, parentOnly)
}
