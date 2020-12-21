// import something here
import VueAcl from 'src/services/aclService'

// leave the export, even if you don't use it
export default ({ router, store, Vue }) => {
  Vue.use(VueAcl, {
    store: store,
    router: router,
    initPermissions: 'public',
    authPath: '/auth',
    homePath: '/dashboard',
    denyPath: '/deny/403',
    initPath: '/initializing',
    save: true,
    directiveCustomText: 'Common.PermissionRequired.Text',
  })
}
