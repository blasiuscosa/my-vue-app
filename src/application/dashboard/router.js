import config from 'src/config'
import helpers from 'src/helpers'

function load(component) {
  return () => import(`src/${component}.vue`)
}

let path = name => helpers.makeStringConcatenation('modules.dashboard', name)

const MODULE_PATH = '/dashboard/'

export default [
  {
    path: MODULE_PATH,
    component: load('containers/Full'),
    redirect: MODULE_PATH + 'new',
    name: 'Home',
    meta: {
      title: path('home.title'),
      icon: 'home',
      menuItem: true,
      sorting: config.sidebar.menu.sorting.modules.dashboard,
      handicap: true,
    },
    children: [
      {
        path: MODULE_PATH + 'new',
        component: load('application/dashboard/components/v1'),
        name: 'Dashboard',
        meta: {
          title: path('dashboard.title'),
          icon: '',
          menuItem: false,
          sorting: 101,
        },
      },
    ],
  },
]
