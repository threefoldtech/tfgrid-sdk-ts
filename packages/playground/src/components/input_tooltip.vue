<template>
  <div ref="tooltipContainer">
    <v-tooltip :text="tooltip || 'None!'">
      <template #activator="{ props }">
        {{ getPropsRef(props) }}
        <slot :tooltipProps="{ appendIcon }"></slot>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

export default {
  name: "InputTooltip",
  props: {
    tooltip: {
      type: String,
      required: true,
    },
  },
  setup() {
    const tooltipContainer = ref<HTMLElement>();
    const appendIcon = "mdi-information";

    let propsRef: any;
    function getPropsRef(_props: any) {
      propsRef = _props;
      return null;
    }

    onMounted(() => {
      const icon = tooltipContainer.value?.querySelector<HTMLElement>(`i[class*="${appendIcon}"]`);
      if (icon) {
        icon.style.cursor = "help";
        icon.onmouseenter = propsRef.onMouseenter;
        icon.onmouseleave = propsRef.onMouseleave;
        icon.onfocus = propsRef.onFocus;
        icon.onblur = propsRef.onBlur;
      }
    });

    onUnmounted(() => {
      const icon = tooltipContainer.value?.querySelector<HTMLElement>(`i[class*="${appendIcon}"]`);
      if (icon) {
        icon.onmouseenter = null;
        icon.onmouseleave = null;
        icon.onfocus = null;
        icon.onblur = null;
      }
    });

    return {
      appendIcon,
      tooltipContainer,
      getPropsRef,
    };
  },
};
</script>
