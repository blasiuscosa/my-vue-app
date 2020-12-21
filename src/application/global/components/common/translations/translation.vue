<template>
  <q-select
    v-model="lang"
    hide-bottom-space
    outlined
    dense
    :label="$t('Common.Language.Text')"
    :disable="languageOptions.options.length === 0"
    :options="languageOptions.options"
    :display-value="getLanguageKey"
    @input="changeLanguage"
  />
</template>

<script>
import { lowerCase, lowerThenCapitalize } from 'src/helpers/filters'
import { setApiLanguage } from 'src/boot/axios'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Translation',
  data() {
    return {
      lang: '',
    }
  },
  computed: {
    ...mapState({
      languageOptions: state => state.globalCMP.languagesOptions.data,
    }),
    getLanguageKey() {
      const setLang = `${this.$i18n.locale() ? this.$i18n.locale() : localStorage.getItem('Lang')}`
      return lowerThenCapitalize(setLang)
    },
  },
  mounted() {
    this.getLanguagesAction()
  },
  methods: {
    ...mapActions(['getLanguagesAction']),
    changeLanguage(item) {
      if (item) {
        let result = this.languageOptions.options.find(x => x.value === item)
        let locale = lowerCase(result.key)
        this.$i18n.set(locale)
        import(/* webpackChunkName: "lang-[request]" */ `src/resources/locales/locale-${locale}.json`).then(items => {
          this.$i18n.add(locale, items.default)
        })
        if (locale !== 'undefined' && locale !== '') {
          localStorage.setItem('Lang', locale)
        }
        setApiLanguage(locale)
      }
    },
  },
}
</script>
