<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Choose a Location</h6>

    <VAlert type="error" class="text-body-1 mb-4" v-if="locationsTask.error">
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
        :model-value="selectedLocation.region || regions[0]"
        @update:model-value="updateRegion"
        clearable
        @click:clear="bindModelValue()"
      />

      <VAutocomplete
        label="Country"
        placeholder="Select a country"
        :loading="locationsTask.loading"
        :items="countries"
        :model-value="selectedLocation.country || countries[0]"
        @update:model-value="updateCountry"
        clearable
        @click:clear="bindModelValue(selectedLocation.region)"
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
    modelValue: Object as PropType<SelectedLocation>,
  },
  emits: {
    "update:model-value": (value?: SelectedLocation) => true || value,
  },
  setup(props, ctx) {
    const selectedLocation = computed(() => props.modelValue || {});
    const locationsTask = useAsync(getLocations, { init: true, default: {} });
    const regions = computed(() => ["All Regions", ...Object.keys(locationsTask.value.data as Locations)]);
    const countries = computed(() => {
      const res = ["All Countries"];
      if (!selectedLocation.value.region) {
        return res.concat(Object.values(locationsTask.value.data as Locations).flat(1));
      }
      return res.concat((locationsTask.value.data as Locations)[selectedLocation.value.region] || []);
    });

    function updateRegion(newRegion?: string | null): void {
      const region = !newRegion || newRegion === regions.value[0] ? undefined : newRegion;
      if (selectedLocation.value.region !== region) {
        bindModelValue(region);
      }
    }

    function updateCountry(newCountry?: string | null): void {
      const country = !newCountry || newCountry === countries.value[0] ? undefined : newCountry;
      if (selectedLocation.value.country !== country) {
        bindModelValue(selectedLocation.value.region, country);
      }
    }

    onUnmounted(bindModelValue);
    function bindModelValue(region?: string, country?: string): void {
      const value = !region && !country ? undefined : { region, country };
      ctx.emit("update:model-value", value);
    }

    return { selectedLocation, locationsTask, regions, countries, updateRegion, updateCountry, bindModelValue };
  },
};
</script>
