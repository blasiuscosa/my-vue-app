<template>
  <q-drawer
    v-model="leftDrawerOpen"
    :width="300"
    show-if-above
    content-class="bg-primary-darkened text-white"
    :mini="miniState"
    @input="$emit('input', leftDrawerOpen)"
  >
    <!--Sidebar-->
    <q-scroll-area class="fit">
      <div class="sidebar">
        <div class="row q-mt-xs" :class="miniState ? 'flex-center ' : 'absolute'">
          <div class="col-auto"></div>
        </div>
        <q-list class="sidebar-menu" :class="{ 'acl-loading': $wait.is(['routerGuardBuilder']) }">
          <q-item v-if="$q.screen.gt.sm" clickable @click="miniState = !miniState">
            <q-item-section avatar>
              <q-icon :name="miniState ? 'switch_left' : 'switch_right'">
                <q-tooltip v-if="!leftDrawerOpen">
                  {{ $t('Common.CollapseMenu.Text') }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label :lines="2">
                {{ $t('Common.CollapseMenu.Text') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <template v-for="(menu, navigationIndex) in menus" v-if="menu.meta.menuItem && parentHasChild(menu.children)">
            <q-item
              :key="'main-' + navigationIndex"
              :to="menu.meta.handicap ? menu.path : ''"
              clickable
              exact
              :active="isParentActiveLink(menu.path)"
              :class="{
                'expand-less': currentMenuIndex === navigationIndex,
                'expand-more': currentMenuIndex !== navigationIndex,
                'bg-primary text-white': miniState && !menu.meta.handicap && hoverIndex === navigationIndex,
              }"
              @mouseover="hoverIndex = navigationIndex"
              @click.native="trackCurrentMenu(navigationIndex)"
            >
              <q-item-section avatar>
                <q-icon size="md" :name="menu.meta.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label :lines="2">
                  {{ $t(menu.meta.title, menu.meta.translationParam ? menu.meta.translationParam : {}) }}
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="parentHasChild(menu.children) && !menu.meta.handicap" side>
                <q-btn
                  flat
                  class="no-pointer-events"
                  :icon="currentMenuIndex === navigationIndex ? 'expand_less' : 'expand_more'"
                />
              </q-item-section>
              <q-menu
                v-if="$q.screen.gt.sm && miniState && !menu.meta.handicap"
                auto-close
                :offset="[-57, -48]"
                transition-show="jump-down"
                transition-hide="jump-up"
                square
                :value="hoverIndex === navigationIndex"
                @before-hide="hoverIndex = null"
              >
                <q-list>
                  <q-item class="bg-primary-darkened text-white">
                    <q-item-section no-wrap>
                      <q-item-label :lines="2">
                        {{ $t(menu.meta.title, menu.meta.translationParam ? menu.meta.translationParam : {}) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator></q-separator>
                  <q-item
                    v-for="(child, childIndex) in menu.children"
                    v-if="child.meta.menuItem && child.meta.permission"
                    :key="'sub-' + childIndex"
                    v-close-popup
                    exact
                    :class="{ 'active-sub': currentSubMenuIndex === childIndex }"
                    :to="`${child.path}`"
                    clickable
                    @click.native="trackCurrentSubMenu(childIndex)"
                  >
                    <q-item-section no-wrap>
                      {{ $t(child.meta.title, child.meta.translationParam ? child.meta.translationParam : {}) }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <transition-group :key="`transition-${navigationIndex}`" appear enter-active-class="animated fadeIn">
              <q-item
                v-for="(child, childIndex) in menu.children"
                v-if="
                  ($q.screen.lt.md || !miniState) &&
                    child.meta.menuItem &&
                    currentMenuIndex === navigationIndex &&
                    child.meta.permission
                "
                :key="'sub-' + childIndex"
                class="q-ml-lg"
                exact
                :class="{ 'active-sub': currentSubMenuIndex === childIndex }"
                :to="`${child.path}`"
                @click.native="trackCurrentSubMenu(childIndex)"
              >
                <q-item-section avatar>
                  <q-icon size="xs" class="q-mr-xs" name="fas fa-caret-right" />
                </q-item-section>
                <q-item-section>
                  <q-item-label :lines="2">
                    {{ $t(child.meta.title, child.meta.translationParam ? child.meta.translationParam : {}) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </transition-group>
          </template>
        </q-list>
      </div>
    </q-scroll-area>
    <!--Sidebar End-->
  </q-drawer>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'StandardSideMenu',
  props: {
    value: {
      Type: Boolean,
    },
    sidebarNavigations: {
      Type: Array,
      default: function() {
        return []
      },
    },
  },
  data: function() {
    return {
      miniState: true,
      leftDrawerOpen: true,
      currentMenuIndex: '',
      currentSubMenuIndex: '',
      hoverIndex: null,
    }
  },
  watch: {
    value: {
      handler(to) {
        this.leftDrawerOpen = to
      },
    },
  },
  computed: {
    ...mapState({
      currentRoute: state => state.route,
    }),
    menus: {
      get() {
        return this.sidebarNavigations
      },
    },
  },
  methods: {
    parentHasChild(children) {
      let count = children.filter(
        x => x.meta !== undefined && x.meta.permission !== undefined && x.meta.permission.length > 0
      ).length
      return count > 0
    },
    isParentActiveLink(menuPath) {
      return this.$helpers.CurrentRouteHasPath(menuPath, true)
    },
    trackCurrentMenu(selectedIndex) {
      if (this.currentMenuIndex === selectedIndex) {
        this.currentMenuIndex = ''
      } else {
        this.currentMenuIndex = selectedIndex
      }
    },
    trackCurrentSubMenu(selectedIndex) {
      if (this.currentSubMenuIndex !== selectedIndex) {
        this.currentSubMenuIndex = selectedIndex
      }
    },
  },
}
</script>
