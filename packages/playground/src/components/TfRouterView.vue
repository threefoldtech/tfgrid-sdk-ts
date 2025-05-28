<template>
  <div :style="{ position: 'relative' }">
    <router-view v-slot="{ Component, route: currentRoute }">
      <div :key="currentRoute.path">
        <component :is="Component" v-if="isAuth || currentRoute.meta.publicPath" />
        <ConnectWalletLanding v-else @open-profile="$emit('openProfile')" />
      </div>
    </router-view>
  </div>
</template>

<script lang="ts">
import { useRoute } from "vue-router";

import ConnectWalletLanding from "./connect_wallet_landing.vue";

export default {
  name: "TfRouterView",
  components: { ConnectWalletLanding },
  props: {
    isAuth: { type: Boolean, required: true },
  },
  setup() {
    const route = useRoute();

    return { route };
  },
};
</script>
