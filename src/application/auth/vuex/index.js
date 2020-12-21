import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
  auth: {},
  isLoggedIn: false,
  loggedInUser: {},
}

export default {
  state,
  actions,
  mutations,
  getters,
}
