<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Choose a Location</h6>

    <VAlert type="error" class="text-body-1" v-if="locationsTask.error">
      Failed to load locations. Please try again!
      <template #append>
        <VBtn icon="mdi-reload" color="error" variant="plain" density="compact" @click="locationsTask.run()" />
      </template>
    </VAlert>

    <template v-else>
      <VAutocomplete
        label="Region"
        placeholder="Select a region"
        :loading="locationsTask.loading"
        :items="regions"
        :model-value="$props.modelValue.region || regions[0]"
        @update:model-value="updateRegion"
        clearable
        @click:clear="$emit('update:model-value', {})"
      />

      <VAutocomplete
        label="Country"
        placeholder="Select a country"
        :loading="locationsTask.loading"
        :items="countries"
        :model-value="$props.modelValue.country || countries[0]"
        @update:model-value="updateCountry"
        clearable
        @click:clear="$emit('update:model-value', { region: $props.modelValue.region })"
      />
    </template>
  </section>
</template>

<script lang="ts">
import { computed, onUnmounted, type PropType } from "vue";

import { useAsync } from "../../hooks";
import type { SelectedLocation } from "../../types/nodeSelector";
import { getLocations } from "../../utils/nodeSelector";
import type { Locations } from "../select_location.vue";

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
  setup(props, ctx) {
    const locationsTask = useAsync(getLocations, { init: true, default: {} });
    const regions = computed(() => ["All Regions", ...Object.keys(locationsTask.value.data as Locations)]);
    const countries = computed(() => {
      const res = ["All Countries"];
      if (!props.modelValue.region) {
        return res.concat(Object.values(locationsTask.value.data as Locations).flat(1));
      }
      return res.concat((locationsTask.value.data as Locations)[props.modelValue.region] || []);
    });

    onUnmounted(() => ctx.emit("update:model-value", {}));

    function updateRegion(newRegion?: string | null): void {
      const region = !newRegion || newRegion === regions.value[0] ? undefined : newRegion;
      if (props.modelValue.region !== region) {
        ctx.emit("update:model-value", { region });
      }
    }

    function updateCountry(newCountry?: string | null): void {
      const country = !newCountry || newCountry === countries.value[0] ? undefined : newCountry;
      if (props.modelValue.country !== country) {
        ctx.emit("update:model-value", { region: props.modelValue.region, country });
      }
    }

    return { locationsTask, regions, countries, updateRegion, updateCountry };
  },
};
</script>
