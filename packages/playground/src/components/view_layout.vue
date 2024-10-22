<template>
  <div
    class="border px-4 pb-4 rounded position-relative mt-1"
    :class="{ 'pt-10': hasInfo, 'pt-3': !hasInfo }"
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
    <template v-if="!kyc || requireSSH">
      <template v-if="requireSSH && !ssh">
        <VAlert variant="tonal" type="error" class="mb-4">
          {{ title }} requires a public SSH key. You can generate or import it from the
          <router-link :to="DashboardRoutes.Deploy.SSHKey">SSH Keys</router-link> page.
        </VAlert>
      </template>
      <template v-if="kyc !== KycStatus.verified">
        <VAlert variant="tonal" type="error" class="mb-4">
          {{ title }} requires a KYC verification. <v-chip color="error">verify now</v-chip>
        </VAlert>
      </template>
    </template>
    <slot v-else :key="tick" />

    <div class="mt-4" v-if="$slots.list">
      <slot name="list" />
    </div>
  </div>
</template>

<script lang="ts">
import { KycStatus } from "@threefold/grid_client";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

import { DashboardRoutes } from "@/router/routes";
import { useProfileManager } from "@/stores";
import { useKYC } from "@/stores/kyc";

import AppInfo from "./app_info.vue";

export default {
  name: "ViewLayout",
  components: { AppInfo },
  setup() {
    const route = useRoute();
    const profileManager = useProfileManager();
    const kyc = useKYC();
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
      kyc: computed(() => kyc.status),
      requireSSH: computed(() => route.meta.requireSSH),
      tick,
      viewLayoutContainer,
      DashboardRoutes,
      KycStatus,
    };
  },
};
</script>
