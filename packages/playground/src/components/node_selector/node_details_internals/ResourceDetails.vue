<template>
  <div class="w-100">
    <VContainer>
      <VRow>
        <span v-text="name" class="text-caption font-weight-bold" />
        <VSpacer />
        <p class="font-weight-bold text-primary" v-text="usagePrecentage + ' %'" />
      </VRow>
    </VContainer>
    <VProgressLinear :model-value="Math.min(100, usagePrecentage)" color="primary" />
  </div>
</template>

<script lang="ts">
import { computed } from "vue";

export default {
  name: "ResourceDetails",
  props: {
    name: { type: String, required: true },
    used: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  setup(props) {
    const usagePrecentage = computed(() => {
      const x = (props.used / props.total) * 10000;
      const q = +x.toFixed(0) / 100;
      return isNaN(q) ? 0 : q;
    });

    return { usagePrecentage };
  },
};
</script>
