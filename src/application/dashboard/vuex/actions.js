import { post } from '../../../helpers/api'
import { api } from '../api'

export const dashboardAction = ({ commit }, data) => {
  return new Promise(resolve => {
    post(api.dashboard, data).then(response => {
      resolve(response.data)
    })
  })
}
