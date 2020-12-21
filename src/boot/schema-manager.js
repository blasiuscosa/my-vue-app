// import something here
import VueSchemaManager from 'src/services/schemaService'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.use(VueSchemaManager, { router: router, templatePath: 'src/pages/schemaManager' })
}
