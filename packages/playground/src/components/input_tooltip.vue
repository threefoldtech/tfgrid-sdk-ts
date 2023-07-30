<template>
  <div class="d-flex">
    <v-tooltip :text="tooltip || 'None!'">
      <template #activator="{ props }">
        {{ getPropsRef(props) }}
        <div class="d-flex" :class="{ 'w-100': !inline }">
          <slot></slot>
          <span
            :style="{ cursor: 'help', marginTop: '17.5px' }"
            class="ml-3"
            @mouseenter="propsRef?.onMouseenter"
            @mouseleave="propsRef?.onMouseleave"
            @focus="propsRef?.onFocus"
            @blur="propsRef?.onBlur"
          >
            <a v-if="href" :href="href" target="_blank">
              <v-icon>mdi-information</v-icon>
            </a>

            <template v-else>
              <v-icon>mdi-information-outline</v-icon>
            </template>
          </span>
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "InputTooltip",
  props: {
    tooltip: {
      type: String,
      required: true,
    },
    inline: {
      type: Boolean,
      default: () => false,
    },
    href: {
      type: String,
      required: false,
    },
  },
  setup() {
    const appendIcon = "mdi-information";

    const propsRef = ref<any>();
    function getPropsRef(_props: any) {
      propsRef.value = _props;
      return null;
    }

    return {
      appendIcon,
      getPropsRef,
      propsRef,
    };
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit !important;
}
</style>