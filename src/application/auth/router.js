import Auth from 'src/containers/Auth'

function load(component) {
  return () => import(`src/${component}.vue`)
}

const MODULE_PATH = '/auth/'

export default [
  {
    path: MODULE_PATH,
    component: Auth,
    redirect: MODULE_PATH + 'connector',
    name: 'Auth',
    meta: {
      permission: 'public',
    },
    children: [
      {
        path: MODULE_PATH + 'connector',
        component: load('application/auth/components/Connector'),
        name: 'connector',
        props: true,
        meta: {
          permission: 'public',
        },
      },
      {
        path: MODULE_PATH + 'login/admin',
        component: load('application/auth/components/AdminLogin'),
        name: 'Admin',
        props: true,
        meta: {
          permission: 'public',
        },
      },
      {
        path: MODULE_PATH + 'update/link',
        component: load('application/auth/components/AdminLogin'),
        name: 'Update From Mail Link',
        props: true,
        meta: {
          permission: 'public',
        },
      },
      {
        path: MODULE_PATH + 'reset',
        component: load('application/auth/components/AdminLogin'),
        name: 'Reset',
        props: true,
        meta: {
          permission: 'public',
        },
      },
      {
        path: MODULE_PATH + 'logout',
        component: load('application/auth/components/Logout'),
        name: 'Logout',
        meta: {
          permission: 'public',
        },
      },
    ],
  },
]
