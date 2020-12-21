<template>
  <div class="breadcrumb-holder col-auto">
    <q-breadcrumbs class="text-primary-darkened" active-color="grey-6" separator="❯">
      <q-breadcrumbs-el
        v-for="(route, index) in $route.matched"
        :key="`breadcrumb-${index}`"
        :label="
          route.name === 'default'
            ? 'Dashboard'
            : $t(route.meta.title, route.meta.translationParam ? route.meta.translationParam : {})
        "
        :to="index > 0 ? (route.name === 'default' ? route.redirect : route.path) : ''"
        exact
      />
    </q-breadcrumbs>
    <div class="q-mt-sm rounded-borders breadcrumbs-first-border-bottom" />
  </div>
</template>
<script>
export default {
  name: 'StandardBreadcrumb',
}
</script>
