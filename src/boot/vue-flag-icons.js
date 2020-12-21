// import something here
import CountryFlag from 'vue-country-flag'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.component('country-flag', CountryFlag)
}
