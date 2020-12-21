// import something here
import { sync } from 'vuex-router-sync'
import store from 'src/store'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  sync(store, router)
}
