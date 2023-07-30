<template>
  <div class="border px-4 pb-4 rounded position-relative mt-10" :class="{ 'pt-10': hasInfo, 'pt-6': !hasInfo }">
    <div
      class="mb-6"
      :style="{ opacity: $vuetify.theme.name === 'dark' ? 'var(--v-medium-emphasis-opacity)' : '' }"
      v-if="$slots.description"
    ></div>
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

    <slot></slot>

    <div class="mt-4" v-if="$slots.list">
      <slot name="list"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useProfileManager } from "@/stores";

import AppInfo from "./app_info.vue";

export default {
  name: "ViewLayout",
  components: { AppInfo },
  setup() {
    const route = useRoute();
    const profileManager = useProfileManager();

    return {
      hasInfo: computed(() => profileManager.profile && route.meta.info),
    };
  },
};
</script>
