<template>
  <q-transition appear enter="fadeInUpBig" leave="fadeOutDownBig">
    <slot />
  </q-transition>
</template>
<script>
export default {
  name: 'Transition',
}
</script>
