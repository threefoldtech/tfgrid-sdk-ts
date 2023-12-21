<template>
  <VCard>
    <VCardTitle class="py-2 bg-primary text-center" v-text="'TFChain Wallet'" />
    <VCardSubtitle :style="{ opacity: 1 }">
      <VAlert class="my-4">
        Please visit
        <a
          class="app-link"
          target="_blank"
          href="https://manual.grid.tf/playground/wallet_connector.html"
          text="the manual"
        />
        get started.
      </VAlert>
    </VCardSubtitle>

    <VDivider />

    <VCardText>
      <VContainer>
        <slot />
      </VContainer>
    </VCardText>

    <VCardActions v-if="$slots['actions']">
      <slot name="actions" />
    </VCardActions>
  </VCard>
</template>

<script lang="ts">
export default {
  name: "WalletLayout",
};
</script>
