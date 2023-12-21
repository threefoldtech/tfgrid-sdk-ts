<template>
  <div
    class="position-fixed top w-100 left bg-primary"
    :style="[
      {
        height: '2px',
        zIndex: 99999999,
        transformOrigin: 'left center',
      },
      style,
    ]"
  />
</template>

<script lang="ts">
import { computed, ref, type StyleValue, watch } from "vue";

import { useNavigationStatus, useOnline } from "../hooks";

export default {
  name: "TfNavigationLoader",
  setup() {
    const navigationStatus = useNavigationStatus();
    const online = useOnline();

    /**
     * loading value indicates scale at a wider domain to avoid floating issues
     * scale: 0 -> 1
     * value: 0 -> 100
     */
    const loadingValue = ref(0);

    let interval: ReturnType<typeof setInterval> | null = null;
    function clear() {
      interval !== null && clearInterval(interval);
      interval = null;
    }

    watch(
      () => navigationStatus.value === "Loading",
      async loading => {
        clear();

        if (!loading) {
          return;
        }

        loadingValue.value = 0;
        interval = setInterval(() => {
          const value = Math.min(75, loadingValue.value + (3 + Math.round(Math.random() * 10)));
          loadingValue.value = value;
          if (value === 75 || !online.value) {
            clear();
          }
        }, 5_00);
      },
    );

    const style = computed<StyleValue>(() => {
      if (navigationStatus.value === "Loading" && online.value) {
        return {
          opacity: 1,
          transition: loadingValue.value === 0 ? undefined : "transform 0.3s linear",
          transform: `scaleX(${loadingValue.value / 100})`,
        };
      }

      return {
        opacity: 0,
        transition: "transform 0.3s linear, opacity 0.3s linear 0.6s",
        transform: `scaleX(${navigationStatus.value === "Success" ? 1 : 0})`,
      };
    });

    return { loadingValue, style };
  },
};
</script>
