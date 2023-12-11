<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Choose a Location</h6>

    <VRow justify="center" class="mb-6" v-if="locationsTask.loading">
      <VProgressCircular indeterminate color="primary" size="75" width="6" />
    </VRow>

    <VAlert type="error" class="text-body-1" v-else-if="locationsTask.error">
      Failed to load locations. Please try again!
      <template #append>
        <VBtn icon="mdi-reload" color="error" variant="plain" density="compact" @click="locationsTask.run()" />
      </template>
    </VAlert>

    <template v-else>
      <VAutocomplete
        label="Region"
        placeholder="Select a region"
        :items="regions"
        :model-value="$props.modelValue.region || regions[0]"
        @update:model-value="
          $event => {
            const region = !$event || $event === regions[0] ? undefined : $event;
            if ($props.modelValue.region !== region)
              $emit('update:model-value', { country: $props.modelValue.country, region });
          }
        "
        clearable
        @click:clear="$emit('update:model-value', { country: $props.modelValue.country })"
      />

      <VAutocomplete
        label="Country"
        placeholder="Select a country"
        :items="countries"
        :model-value="$props.modelValue.country || countries[0]"
        @update:model-value="
          $event => {
            const country = !$event || $event === countries[0] ? undefined : $event;
            if ($props.modelValue.country !== country)
              $emit('update:model-value', { region: $props.modelValue.region, country });
          }
        "
        clearable
        @click:clear="$emit('update:model-value', { region: $props.modelValue.region })"
      />
    </template>
  </section>
</template>

<script lang="ts">
import { computed, type PropType } from "vue";

import { useAsync } from "../../hooks";
import type { SelectedLocation } from "../../types/nodeSelector";
import { getLocations } from "../../utils/nodeSelector";

export default {
  name: "TfSelectLocation",
  props: {
    modelValue: {
      type: Object as PropType<SelectedLocation>,
      required: true,
    },
  },
  emits: {
    "update:model-value": (value: SelectedLocation) => true || value,
  },
  setup() {
    const locationsTask = useAsync(getLocations, { init: true });
    const regions = computed(() => ["All Regions", ...Object.keys(locationsTask.value.data || {})]);
    const countries = computed(() => ["All Countries", ...Object.values(locationsTask.value.data || {}).flat(1)]);

    return { locationsTask, regions, countries };
  },
};
</script>
