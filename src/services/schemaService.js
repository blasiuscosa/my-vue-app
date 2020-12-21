let introJs = require('intro.js')
import jquery from 'jquery'
import { EventBus } from 'src/services/eventService'

class Schema {
  set router(router) {
    router.afterEach(async () => {
      if (this.enable) {
        await this.constructHints()
      }
    })
  }

  init(router) {
    this.router = router
    this.enable = false
  }

  async constructHints() {
    let rolesHints = introJs()
    rolesHints.removeHints()
    rolesHints._options.hints = []
    // Delay by 5sec
    await setTimeout(() => {
      jquery(function() {
        jquery('[data-schema]').each(function(index) {
          jquery(this).addClass('guarded-' + index)
          rolesHints._options.hints.push({
            hint: 'Role & Permissions Applied Element',
            element: document.querySelector('.guarded-' + index),
          })
          setTimeout(() => {
            rolesHints.addHints()
            rolesHints.showHints()
          }, 1000)
          rolesHints.onhintclick(element => {
            let identifier = this.getAttribute('data-schema')
            EventBus.$emit('showSchemaManager', identifier)
          })
        })
      })
    }, 10000)
  }
}

let schema = new Schema()

Schema.install = (Vue, { router, templatePath }) => {
  schema.init(router)
  let managerTemplate = () => import(`src/${templatePath}.vue`)
  Vue.component(managerTemplate.name, managerTemplate)
  Vue.mixin({
    data: () => ({
      schemaMap: {},
      schemaManagerEnable: false,
    }),
    watch: {
      schemaMap(newValue) {
        Vue.prototype.$schemaData = newValue
      },
      schemaManagerEnable(newValue) {
        schema.enable = newValue
      },
    },
  })
}
export default Schema
