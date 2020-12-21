import Vue from 'vue'
import Vuex from 'vuex'
import { vuex } from 'src/application/'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  namespaced: true,
  modules: vuex,
  strict: debug,
})

export default store
