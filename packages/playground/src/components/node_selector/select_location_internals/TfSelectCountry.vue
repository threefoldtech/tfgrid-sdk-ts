<template>
  <VAutocomplete label="Region" placeholder="Select a region" v-bind="$props.countryProps" clearable />
</template>

<script lang="ts">
import type { PropType } from "vue";

export default {
  name: "TfSelectCountry",
  props: {
    countryProps: {
      type: Object as PropType<{
        modelValue: string;
        loading: boolean;
        items: string[];
        "onUpdate:model-value"(region: string): void;
        "onClick:clear"(): void;
      }>,
      required: true,
    },
  },
};
</script>
