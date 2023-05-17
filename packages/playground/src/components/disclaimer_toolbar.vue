<template>
  <v-card v-if="network !== 'main' && nw !== 'main'">
    <v-card-title class="font-weight-bold">Disclaimer</v-card-title>
    <v-card-text>
      This is a {{ nw }} environment. We're still ironing out the kinks. If there are any issues,
      please let us know
      <a
        class="app-link"
        href="https://github.com/threefoldtech/test_feedback/issues"
        target="_blank"
        >here.</a
      >
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// eslint-disable-next-line no-undef
const network = process.env.NETWORK as any

const nw = computed(() => {
  switch (network) {
    case 'dev':
      return 'development'
    case 'qa':
      return 'QA'
    case 'test':
      return 'testing'
  }
  return network
})
</script>

<script lang="ts">
export default {
  name: 'DisclaimerToolbar',
}
</script>
