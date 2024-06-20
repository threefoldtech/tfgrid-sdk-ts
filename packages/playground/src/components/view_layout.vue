<template>
  <div
    class="border px-4 pb-4 rounded position-relative"
    :class="{ 'pt-8 mt-5': hasInfo, 'pt-3 mt-1': !hasInfo }"
    ref="viewLayoutContainer"
  >
    <div
      :style="{ opacity: $vuetify.theme.name === 'dark' ? 'var(--v-medium-emphasis-opacity)' : '' }"
      v-if="$slots.description"
    />

    <div
      class="position-absolute pa-1 rounded-circle border"
      :style="{
        top: 0,
        right: '16px',
        transform: 'translateY(-50%)',
        zIndex: 99,
        backgroundColor: 'rgb(var(--v-theme-background))',
      }"
      v-if="hasInfo"
    >
      <AppInfo />
    </div>

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

import AppInfo from "./app_info.vue";

export default {
  name: "ViewLayout",
  components: { AppInfo, SshkeyView },
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
