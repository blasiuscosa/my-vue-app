import safeGuardRoutes from '../utils/security/safeGuardRoutes.js'

async function routeBuilder(data, cb) {
  let err = null,
    params = JSON.parse(data)
  let routes = params.routes
  let options = {
    disableAcl: params.disableAcl,
    countryId: params.countryId,
    userPermissions: params.userPermissions,
  }
  let result = await safeGuardRoutes(routes, options)
  cb(err, result)
}

// Handle incoming messages
self.onmessage = async function(msg) {
  const { id, payload } = msg.data
  await routeBuilder(payload, function(err, result) {
    const msg = {
      id,
      err,
      payload: result,
    }
    self.postMessage(msg)
  })
}
