// import something here
import helpers from 'src/helpers'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  helpers.install = function() {
    Vue.helpers = helpers
    Vue.prototype.$helpers = helpers
  }

  Vue.use(helpers)
}
