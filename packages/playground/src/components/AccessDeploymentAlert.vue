<template>
  <VAlert type="info" variant="tonal" class="my-4">
    Access your deployments using

    <VContainer fluid>
      <VRow no-gutters>
        <VCol
          cols="12"
          md="6"
          lg="4"
          v-for="method in methods"
          :key="method"
          class="mb-2"
          :style="{ whiteSpace: 'nowrap' }"
        >
          &rtrif;
          <VCard class="d-inline pa-1">
            ssh root@&lt;<span :style="{ opacity: 'var(--v-medium-emphasis-opacity)' }" v-text="method" />&gt;
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
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
