<template>
  <VAlert type="info" variant="tonal" class="my-4">
    Access your deployments via SSH, with default username
    <span class="font-weight-bold text-grey-darken-1" v-text="'root'" />.

    <ul :style="{ listStyle: 'square' }">
      <li
        v-for="method in methods"
        :key="method"
        class="my-1"
        :class="{
          'text-white': theme.global.current.value.dark,
          'text-grey-darken-3': !theme.global.current.value.dark,
        }"
      >
        &blacksquare; ssh root@&lt;<span v-text="method" class="text-grey-darken-1" />&gt;
      </li>
    </ul>
  </VAlert>
</template>

<script lang="ts">
import { useTheme } from "vuetify";

const methods = ["public-ipv4", "planetary-network-ip", "public-ipv6", "wireguard-ip", "mycelium-network-ip"];

export default {
  name: "AccessDeploymentAlert",
  setup() {
    const theme = useTheme();
    return { methods, theme };
  },
};
</script>
