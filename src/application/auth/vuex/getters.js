// import helpers from 'src/helpers'

export default {
  isLoggedIn: state => {
    return state.isLoggedIn
  },
  isMember: (state, getters, rootState, rootGetters) => {
    return rootGetters.getUserType === 'Member'
  },
}
