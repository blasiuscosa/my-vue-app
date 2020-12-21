// import something here
import configs from 'src/config'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  configs.install = function() {
    Vue.configs = configs
    Vue.prototype.$configs = configs
  }

  Vue.use(configs)
}
