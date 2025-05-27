<template>
  <div class="w-100">
    <VContainer>
      <VRow>
        <div>
          <span class="text-caption font-weight-bold" v-text="name" />
          <template v-if="cpuType">
            <VTooltip text="Processor Version">
              <template #activator="{ props }">
                <VChip class="ml-2" size="x-small" v-bind="props">
                  <span class="font-weight-bold">{{ cpuType }}</span>
                </VChip>
              </template>
            </VTooltip>
          </template>

          <template v-if="memoryType">
            <VTooltip text="Memory Type">
              <template #activator="{ props }">
                <VChip class="ml-2" size="x-small" v-bind="props">
                  <span class="font-weight-bold">{{ memoryType }}</span>
                </VChip>
              </template>
            </VTooltip>
          </template>
        </div>

        <VSpacer />
        <template v-if="text">
          <span class="text-caption font-weight-bold text-info" v-text="text" />
          <VSpacer />
        </template>
        <p class="font-weight-bold text-primary" v-text="usageText" />

        <InputTooltip
          v-if="name === 'CPU'"
          tooltip="CPU can be greater than 100% due to overprovisioning."
          align-center
        />
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
    cpuType: { type: String, required: false },
    memoryType: { type: String, required: false },
    text: String,
  },
  setup(props) {
    const usagePrecentage = computed(() => {
      const x = (props.used / props.total) * 10000;
      const q = +x.toFixed(0) / 100;
      return isNaN(q) ? 0 : q;
    });

    const usageText = computed(() => {
      if (props.total === 0) {
        return "N/A";
      }
      return usagePrecentage.value > 100 ? "100+ %" : `${usagePrecentage.value} %`;
    });

    return { usagePrecentage, usageText };
  },
};
</script>
