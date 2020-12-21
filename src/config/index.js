import { endPoints } from 'src/config/urls'

let config = {
  app: {
    scope: {
      evo: process.env.APP_SCOPE && process.env.APP_SCOPE.toLowerCase() === 'evo',
    },
    modules: {
      product: {
        default: {
          additionalFields: function() {
            return config.app.scope.evo
              ? [
                  {
                    cbp_point: '0.000',
                  },
                  {
                    sv: '0.000',
                  },
                ]
              : []
          },
        },
      },
    },
  },
  sidebar: {
    menu: {
      sorting: {
        modules: {
          dashboard: 0,
          products: 1,
          members: 2,
          sales: 3,
          autoship: 4,
          voucher: 5,
          bonus: 6,
          stockist: 7,
          procurements: 8,
          inventory: 9,
          ewallet: 10,
          campaign: 11,
          receipt: 12,
          library: 13,
          reports: 14,
          settings: 15,
        },
      },
    },
  },
  toggles: {
    modules: {
      generalReceipt: process.env.TOGGLES_MODULES_GENERAL_RECEIPT || true,
      settingsDepartment: process.env.TOGGLES_MODULES_SETTINGS_RECEIPT || true,
    },
    notification: {
      oldDashboard: process.env.NOTIFICATION_OLD_DASHBOARD_INFO || false,
    },
  },
  pwa: {
    updateIntervalCheck: process.env.PWA_NEW_UPDATE_CHECK_INTERVAL || 500,
    autoUpdateTimer: process.env.PWA_AUTO_UPDATE_TIMER || 900,
  },
  plugins: {
    axios: {
      /**
         *
         * Endpoint rules for axios plugin
         *
         * {
          url: String, :: API Endpoint
          skipCancelRequest: Boolean :: will skip cancel request,
          cancelRequestWithParams: Boolean :: if true will include all params and store for comparision
          skipLoading: Boolean :: Skip from showing loading screen to users,
          skipAcl: Boolean, :: Skip Rules & permission
          skipServerValidation: Boolean :: Skipping from displaying server return validation messages (422)
          version: String :: Change backend API version default version `v1`
        }
         *
         * */
      endpointRules: [
        {
          url: endPoints.states,
          skipCancelRequest: true,
        },
        {
          url: endPoints.cities,
          skipCancelRequest: true,
        },
        {
          url: endPoints.countryRelation,
          skipCancelRequest: true,
        },
        {
          url: endPoints.mastersKey,
          cancelRequestWithParams: true,
        },
        {
          url: endPoints.logout,
          skipCancelRequest: true,
          skipLoading: true,
        },
        {
          url: endPoints.userDetails,
          skipCancelRequest: false,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.countriesAll,
          skipCancelRequest: false,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.login,
          skipCancelRequest: false,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.refreshOauthToken,
          skipCancelRequest: true,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.reset,
          skipCancelRequest: true,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.resetPassword,
          skipCancelRequest: true,
          skipLoading: false,
          skipAcl: true,
        },
        {
          url: endPoints.getEnrollmentSalesTempData,
          skipCancelRequest: false,
          skipLoading: false,
          skipAcl: false,
          skipServerValidation: true,
        },
        {
          url: endPoints.fileUploadSetting,
          skipCancelRequest: true,
          skipLoading: false,
        },
        {
          url: endPoints.giroType,
          skipServerValidation: true,
        },
        {
          url: endPoints.languages,
          skipAcl: true,
        },
        {
          url: endPoints.downloadTemplate,
          version: 'v2',
        },
        {
          url: endPoints.uploadTemplate,
          version: 'v2',
        },
        {
          url: endPoints.processTemplate,
          version: 'v2',
        },
        {
          url: endPoints.verifyMobileNumber,
          skipServerValidation: true,
        },
        {
          url: endPoints.verifyEmail,
          skipServerValidation: true,
        },
        {
          url: endPoints.requestEmailValidation,
          skipServerValidation: true,
        },
        {
          url: endPoints.requestMobileNumberValidation,
          skipServerValidation: true,
        },
        {
          url: endPoints.taxInvoiceSearch,
          skipServerValidation: true,
        },
        {
          url: endPoints.kittingStatsById,
          skipServerValidation: true,
        },
        {
          url: endPoints.searchMember,
          skipLoading: true,
        },
      ],
    },
  },
}
export default config
