import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import config from 'src/config'
import _ from 'lodash'
import { LANG } from 'src/store/localStorageKeys'

Vue.use(VueI18n)

const locale = localStorage.getItem(LANG) || 'en'

const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: 'en',
  formatFallbackMessages: true,
  silentFallbackWarn: true,
  messages: {},
})

export async function loadTranslations(locale) {
  try {
    let messages = await import(
      /* webpackChunkName: "lang-[request]" */ `src/resources/locales/default/locale-${locale}`
    )
    messages = messages.default
    if (config.app.scope.evo) {
      try {
        const evoMessages = await import(
          /* webpackChunkName: "lang-[request]" */ `src/resources/locales/evo/locale-${locale}`
        )
        messages = _.merge(messages, evoMessages.default)
      } catch (e) {
        console.error(e)
      }
    }
    i18n.setLocaleMessage(locale, messages)
    return Promise.resolve(locale)
  } catch (e) {
    console.error(e)
    await loadTranslations('en')
  }
}

// leave the export, even if you don't use it
export default async ({ app, router, Vue }) => {
  await loadTranslations(locale)
  app.i18n = i18n
  axios.defaults.headers.common['Accept-Language'] = app.i18n.locale
  document.querySelector('html').setAttribute('lang', app.i18n.locale)
}

export { i18n }
