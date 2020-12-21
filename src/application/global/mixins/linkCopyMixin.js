import { Dialog } from 'quasar'
export default {
  methods: {
    isSafari() {
      let safariReg = /^((?!chrome|android|crios|fxios).)*safari/i
      return safariReg.test(navigator.userAgent)
    },
    copyLink(link) {
      link = this.qrCodeLink
      let ret = null
      if (this.isSafari()) {
        const el = document.createElement('input')
        el.value = link
        el.style.opacity = '0'
        el.id = 'i-device'
        document.body.appendChild(el)
        // const editable = el.contentEditable
        // const readOnly = el.readOnly
        el.contentEditable = true
        el.readOnly = false
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        el.setSelectionRange(0, 99999)
        // el.contentEditable = editable
        // el.readOnly = readOnly
        ret = document.execCommand('copy')
        if (document.getElementById('i-device')) {
          document.body.removeChild(el)
        }
      } else {
        let copy = function(e) {
          e.preventDefault()
          if (e.clipboardData) {
            e.clipboardData.setData('text/plain', link)
          } else if (window.clipboardData) {
            window.clipboardData.setData('Text', link)
          }
        }
        window.addEventListener('copy', copy)
        ret = document.execCommand('copy')
        window.removeEventListener('copy', copy)
      }
      if (ret) {
        Dialog.create({ message: this.$t('Common.Copied.Text') })
      } else {
        Dialog.create({ message: this.$t('Common.Copy.Fail') })
      }
    },
  },
}
