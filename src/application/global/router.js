import Full from 'src/containers/Full'

function load(component) {
  return () => import(`src/${component}.vue`)
}

export default [
  {
    path: '/',
    name: 'default',
    meta: {
      menuItem: false,
      permission: 'public',
    },
  },
  {
    path: '/initializing',
    component: load('pages/initialize'),
    name: 'initialize',
    meta: {
      menuItem: false,
      permission: 'public',
    },
  },
  {
    path: '/deny',
    component: Full,
    name: 'deny',
    redirect: '/deny/403',
    meta: {
      menuItem: false,
      permission: 'public',
    },
    children: [
      {
        path: '403',
        component: load('pages/deny'),
        name: 'deny inline',
        meta: {
          menuItem: false,
          permission: 'public',
        },
      },
    ],
  },
  {
    path: '/error',
    component: load('pages/error'),
    name: 'error',
    meta: {
      menuItem: false,
      permission: 'public',
    },
  },
  {
    path: '/developer',
    component: load('application/global/components/developer/ApiConfig'),
    name: 'Developer Setup',
    redirect: '/developer/api/config',
    meta: {
      title: 'Setting.DeveloperConfigSetup.Route.Api',
      menuItem: false,
    },
    children: [
      {
        path: 'api/config',
        component: load('application/global/components/developer/ApiConfig'),
        name: 'Developer Api Config Setup',
        meta: {
          menuItem: false,
        },
      },
    ],
  },
  {
    path: '*',
    component: load('pages/notFound'),
    name: '404',
    meta: {
      menuItem: false,
      permission: 'public',
    },
  },
]
