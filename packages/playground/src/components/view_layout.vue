<template>
  <div class="border px-4 pb-4 rounded position-relative pt-3 mt-1" ref="viewLayoutContainer">
    <div
      :style="{ opacity: $vuetify.theme.name === 'dark' ? 'var(--v-medium-emphasis-opacity)' : '' }"
      v-if="$slots.description"
    />

    <template v-if="requireSSH && !ssh">
      <VAlert variant="tonal" type="error" :text="title + ' requires public ssh key.'" class="mb-4" />
      <SshkeyView />
    </template>
    <slot v-else :key="tick" />

    <div class="mt-4" v-if="$slots.list">
      <slot name="list" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useProfileManager } from "@/stores";
import SshkeyView from "@/views/sshkey_view.vue";

export default {
  name: "ViewLayout",
  components: { SshkeyView },
  setup() {
    const route = useRoute();
    const profileManager = useProfileManager();
    const viewLayoutContainer = ref<HTMLElement>();
    const tick = ref(0);

    function reRender(e: Event) {
      e.stopPropagation();
      tick.value++;
    }

    onMounted(() => {
      if (viewLayoutContainer.value) {
        viewLayoutContainer.value?.addEventListener("render:solution", reRender);
      }
    });

    onUnmounted(() => {
      viewLayoutContainer.value?.removeEventListener("render:solution", reRender);
    });

    return {
      title: computed(() => route.meta.title),
      hasInfo: computed(() => profileManager.profile && route.meta.info),
      ssh: computed(() => profileManager.profile?.ssh),
      requireSSH: computed(() => route.meta.requireSSH),
      tick,
      viewLayoutContainer,
    };
  },
};
</script>
