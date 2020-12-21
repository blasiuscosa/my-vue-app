// Configuration for your app
const env = require('dotenv').config()
const Dotenv = require('dotenv-webpack')
const fs = require('fs')

module.exports = function(ctx) {
  return {
    css: ['app.styl'],
    extras: ['material-icons', 'material-icons-sharp', 'mdi-v5', 'ionicons-v4', 'fontawesome-v5'],
    supportIE: true,
    build: {
      sourceMap: true,
      scopeHoisting: true,
      analyze: false,
      vueCompiler: true,
      vueRouterMode: ctx.prod ? 'history' : 'history',
      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/,
        })
        // Load .env variables into node env
        cfg.plugins.push(
          new Dotenv({
            path: './.env', // Path to .env file (this is the default)
            safe: false, // load .env.example (defaults to "false" which does not use dotenv-safe)
          })
        )
      },
      chainWebpack(chain, { isServer, isClient }) {
        chain.output.globalObject('this')
        if (process.env.NODE_ENV === 'development') {
          chain.output
            .publicPath('/')
            .filename('[name].[hash].js')
            .end()
        }

        chain.module
          .rule('worker')
          .test(/w8\.js$/)
          .use('worker-loader')
          .loader('worker-loader')
          .options({ inline: true })
          .end()
      },
      webpackManifest: true,
    },
    boot: [
      'i18n',
      'developer-config',
      'axios',
      'helpers',
      'vuelidate',
      'vuex-router-sync',
      'vue-flag-icons',
      'schema-manager',
      'acl',
      'configs',
    ],
    devServer:
      env.parsed.HTTPS === 'true'
        ? {
            open: false,
            port: env.parsed.APP_PORT,
            https: {
              key: fs.readFileSync('certs/localhost.key', 'utf8'),
              cert: fs.readFileSync('certs/localhost.crt', 'utf8'),
            },
          }
        : {
            open: false,
            port: env.parsed.APP_PORT,
          },
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'en-us', // Quasar language pack
      config: {
        loadingBar: {
          'skip-hijack': true,
        },
      },

      // Possible values for "importStrategy":
      // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
      // * 'all'  - Manually specify what to import
      importStrategy: 'all',

      // Quasar plugins
      plugins: [],
    },
    animations: 'all',
    htmlVariables: { gtagUID: env.parsed.GOOGLE_TAG_UID },
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        maximumFileSizeToCacheInBytes: 3000000,
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        exclude: [/\.map$/, /manifest\.json$/, '.htaccess', '.gitkeep', 'gitignore'],
      },
      manifest: {
        name: 'IBS Backoffice',
        short_name: 'Backoffice',
        description: 'My Global Backend Portal',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#132364',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    },
  }
}
