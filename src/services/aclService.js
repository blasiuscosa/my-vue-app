'use strict'
import Acl from 'src/utils/security/acl'
import { EventBus } from 'src/services/eventService'

let acl = new Acl()

acl.install = (
  Vue,
  { store, router, initPermissions, authPath, homePath, denyPath, initPath, save, directiveCustomText }
) => {
  directiveCustomText = window.il8n.t(directiveCustomText)
  acl.aclInitialize(Vue, store, router, initPermissions, authPath, homePath, denyPath, initPath, save)
  // Todo remove $can & $apply prototype after implement v-directive v-permission
  Vue.prototype.$can = permission => acl.aclPermissionProcessor(acl.aclLocalSchemaProcessor(permission))
  Vue.prototype.$apply = schemaKeys => acl.aclLocalSchemaProcessor(schemaKeys)
  /**
   * Permission directive
   * accepted arguments [none, text, callback]
   * none (no arguments) - act like core vue v-if directive hide element
   *                  e.g:
   *                  `<template>
   *                      <div v-permission="sales.management.list|order"></div>
   *                    </template>
   * text           - Hide original element and append text
   *                  e.g:
   *                  `<template>
   *                      <div v-permission:text="sales.management.list|order">
   *                        Original content or element will be hide
   *                      </div>
   *                      <span>[TEXT]</span>
   *                    </template>
   * callback       - Get callback value by passing method from parent component this case will be true if binding value is function
   *                  e.g:
   *                  `<template>
   *                    <div disable="newOrderPermission" v-permission:sales.management.list|order="(event) => hasPermissionToPerformNewOrder(event)"></div>
   *                    </template>
   *                    data: {
   *                      newOrderPermission: false
   *                    }
   *                  methods: {
   *                    hasPermissionToPerformNewOrder (result) {
   *                      this.newOrderPermission = result
   *                    }
   *                  }
   *                    `
   */
  Vue.directive('permission', {
    async bind(el, binding) {
      // Creating empty comment
      let removeChild = document.createComment(' ')
      // Arg === text attach custom text
      if (binding.arg === 'text') {
        el.style.display = 'none'
        let copyElementClasses = el.classList || ''
        removeChild = document.createElement('div')
        removeChild.innerHTML = `<div class="row items-baseline bg-white text-negative">
                                 <div class="col-auto">${directiveCustomText}</div></div>`
        removeChild.className = copyElementClasses
      }
      EventBus.$on('$updated', async () => {
        let hasPermission
        // If defined as callback
        if (typeof binding.value === 'function') {
          let modifiers = binding.modifiers
          modifiers = Object.keys(modifiers).join('.')
          hasPermission = await acl.aclPermissionProcessor(acl.aclLocalSchemaProcessor(modifiers))
          el.style.display = 'block'
          return binding.value(hasPermission)
        } else {
          // normal case
          hasPermission = await acl.aclPermissionProcessor(acl.aclLocalSchemaProcessor(binding.value))
          if (hasPermission === false) {
            if (el.parentNode) {
              el.parentNode.replaceChild(removeChild, el)
            }
          } else {
            if (removeChild.parentNode) {
              removeChild.parentNode.replaceChild(el, removeChild)
            }
          }
          el.style.display = 'block'
        }
      })
    },
    update() {
      EventBus.$emit('$updated')
    },
    unbind() {
      EventBus.$emit('$updated')
      EventBus.$destroy()
    },
  })
}

export default acl
