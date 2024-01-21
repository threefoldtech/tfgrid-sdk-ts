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
          'text-white': $vuetify.theme.global.name === 'dark',
          'text-grey-darken-3': $vuetify.theme.global.name === 'light',
        }"
      >
        &blacksquare; ssh root@&lt;<span v-text="method" class="text-grey-darken-1" />&gt;
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
