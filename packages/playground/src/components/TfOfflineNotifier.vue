<template>
  <VDialog scrollable persistent min-width="400px" max-width="700px" v-model="offline">
    <VCard>
      <VCardTitle class="font-weight-black text-center text-h4 bg-primary py-8">
        Trying to reconnect{{ ".".repeat(dotCount) }}
      </VCardTitle>
      <VCardText class="text-center">
        <VIcon icon="mdi-close-circle" class="text-h1" color="error" />

        <p>
          We're attempting to automatically reconnect you to dashboard. If your internet connection is ok. otherwise you
          can reload instantly.
        </p>
      </VCardText>

      <VDivider />

      <VCardActions class="d-flex justify-center">
        <VBtn prepend-icon="mdi-reload" variant="tonal" color="error" @click="reload">Reload Now</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { ref, watch } from "vue";

import { useOffline } from "../hooks";

export default {
  name: "TfOfflineNotifier",
  setup() {
    const offline = useOffline();
    const dotCount = ref(0);

    function reload() {
      window.onbeforeunload = null;
      window.location.reload();
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    watch(offline, offline => {
      if (offline) {
        dotCount.value = 0;
        interval = setInterval(() => {
          dotCount.value = (dotCount.value + 1) % 4;
        }, 300);
        return;
      }

      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    });

    return { offline, reload, dotCount };
  },
};
</script>
