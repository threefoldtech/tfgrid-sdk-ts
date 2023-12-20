<template>
  <VDialog scrollable persistent min-width="400px" max-width="700px" :model-value="offline || failed">
    <VCard>
      <VCardTitle class="v-card-title font-weight-black text-center text-h5 bg-primary py-3" v-text="title" />
      <VCardText class="text-center">
        <VIcon icon="mdi-close-circle-outline" class="text-h3" color="error" v-if="failed" />
        <VProgressCircular indeterminate size="40" width="5" color="info" v-else />

        <p class="my-4" v-text="description" />
      </VCardText>

      <VCardActions class="d-flex justify-center mb-4" v-if="failed">
        <VBtn prepend-icon="mdi-reload" variant="outlined" color="secondary" @click="reload">Reload Now</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";

import { useOffline } from "../hooks";

export default {
  name: "TfOfflineNotifier",
  setup() {
    const offline = useOffline();
    const dotCount = ref(0);
    const failed = ref(false);

    function reload() {
      window.onbeforeunload = null;
      window.location.reload();
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    watch(offline, offline => {
      if (offline) {
        if (failed.value) return;

        dotCount.value = 0;
        let time = 0;
        interval = setInterval(() => {
          time += 0.3;
          dotCount.value = (dotCount.value + 1) % 4;

          if (time >= 20) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }

            failed.value = true;
          }
        }, 300);
        return;
      }

      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    });

    const title = computed(() => {
      if (failed.value) {
        return `Failed to reconnect`;
      }

      return `Trying to reconnect${".".repeat(dotCount.value)}`;
    });

    const description = computed(() => {
      if (failed.value) {
        return `Failed to reconnect. Please reload dashboard.`;
      }

      return `We're attempting to automatically reconnect you to dashboard. If your internet connection is ok. otherwise you
          can reload instantly.`;
    });

    return { offline, failed, reload, dotCount, title, description };
  },
};
</script>
