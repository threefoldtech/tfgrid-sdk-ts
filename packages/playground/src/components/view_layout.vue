<template>
  <div class="border px-4 pb-4 rounded position-relative mt-10" :class="{ 'pt-10': hasInfo, 'pt-6': !hasInfo }">
    <div
      class="mb-6"
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
    <slot v-else />

    <div class="mt-4" v-if="$slots.list">
      <slot name="list" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
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

    return {
      title: computed(() => route.meta.title),
      hasInfo: computed(() => profileManager.profile && route.meta.info),
      ssh: computed(() => profileManager.profile?.ssh),
      requireSSH: computed(() => route.meta.requireSSH),
    };
  },
};
</script>
