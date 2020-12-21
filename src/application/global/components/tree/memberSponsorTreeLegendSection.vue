<template>
  <div class="row">
    <div class="col-12 q-pa-sm">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-field hide-bottom-space stack-label borderless label="info">
            <template slot="control">
              <q-markup-table class="fit" flat dense separator="none">
                <tbody>
                  <tr v-for="code in colorCodes">
                    <td>
                      <div class="color-code-box" :style="{ backgroundColor: code.color }" />
                    </td>
                    <td :style="{ color: code.color }">
                      {{ code.title }}
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </template>
          </q-field>
        </div>
        <div class="col-12">
          <q-field hide-bottom-space borderless stack-label label="Sales Activity Status">
            <q-markup-table flat dense separator="none">
              <tbody>
                <tr v-for="code in activityStatus">
                  <td>
                    <div class="color-code-rounded" :style="{ backgroundColor: code.color }" />
                  </td>
                  <td :style="{ color: code.color }">
                    {{ code.title }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-field>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LegendSection',
  props: {
    personalData: {
      type: Object,
    },
    colorCodes: {
      type: Array,
      required: true,
    },
    activityStatus: {
      type: Array,
      required: true,
    },
  },
}
</script>
<style lang="stylus">
.color-code-box
    background-color inherit
    width 20px
    height 20px
    margin 5px
    border 1px solid rgba(0, 0, 0, .6)
.color-code-rounded
    background-color inherit
    width 20px
    height 20px
    margin 5px
    border-radius 20px
    border 1px solid rgba(0, 0, 0, .6)
</style>
