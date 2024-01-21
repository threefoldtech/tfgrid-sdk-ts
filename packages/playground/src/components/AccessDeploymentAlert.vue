<template>
  <VAlert type="info" variant="tonal" class="my-4">
    Access your deployments via SSH, with default username
    <span
      class="font-weight-bold"
      :class="{
        'text-grey': $vuetify.theme.global.name === 'dark',
        'text-black': $vuetify.theme.global.name === 'light',
      }"
      v-text="'root'"
    />.

    <ul :style="{ listStyle: 'square' }">
      <li v-for="method in methods" :key="method" class="text-white my-1">
        &blacksquare; ssh root@&lt;<span v-text="method" class="text-grey" />&gt;
      </li>
    </ul>
  </VAlert>
</template>

<script lang="ts">
const methods = ["public-ipv4", "planetary-network-ip", "public-ipv6", "wireguard-ip"];

export default {
  name: "AccessDeploymentAlert",
  setup() {
    return { methods };
  },
};
</script>
