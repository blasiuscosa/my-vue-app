<template>
  <div
    v-if="message"
    :class="stacked ? 'col justify-center text-center text-caption' : 'row'"
    class="q-col-gutter-sm items-center"
  >
    <div class="col-auto">
      <slot name="actions"></slot>
    </div>
    <div class="col-12">
      <div :class="stacked ? 'justify-center' : 'justify-start'" class="row q-col-gutter-sm items-baseline">
        <div class="col-auto" :class="textColor">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <div class="row q-col-gutter-sm">
                <div class="col-auto">
                  <q-icon v-if="hideIcon === false" :size="iconSize" :color="iconColor" :name="getIcon"></q-icon>
                </div>
                <div class="col-10">
                  <slot name="content" :message="message">
                    {{ message }}
                  </slot>
                </div>
              </div>
            </div>
            <div class="col-12">
              <slot name="sub-content" :subTitle="subTitle">
                <span class="text-grey-7">{{ subTitle }}</span>
              </slot>
            </div>
            <div class="col-auto">
              <slot name="bottom-actions"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Info',
  props: {
    message: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    icon: {
      type: String,
    },
    iconSize: {
      type: [String, Number],
      default: '1.5rem',
    },
    iconColor: {
      type: String,
      default: 'primary',
    },
    stacked: {
      type: Boolean,
      default: false,
    },
    hideIcon: {
      type: Boolean,
      default: false,
    },
    textColor: {
      type: String,
      default: 'text-primary',
    },
    title: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    getIcon() {
      return this.icon ? this.icon : this.title ? 'label_important' : 'fa fa-info-circle'
    },
  },
}
</script>
