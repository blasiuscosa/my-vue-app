/**
 *
 * dev.conf.js developer configuration for development environment
 *
 */

export const proxys = [
  {
    label: 'MY-LOCAL',
    value: 'http://backend.local/api/v1',
    env: 'LOCAL',
  },
  {
    label: 'MY-DEV',
    value: 'https://dev-be.com/api/v1',
    env: 'DEV',
  },
  {
    label: 'MY-UAT',
    value: 'https://uat-be.com/api/v1',
    env: 'UAT',
  },
  {
    label: 'MY-LIVE',
    value: 'https://live-be.com/api/v1',
    env: 'PROD',
  },
]
