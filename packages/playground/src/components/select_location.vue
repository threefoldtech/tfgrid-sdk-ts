<template>
  <div>
    <v-autocomplete
      label="Region"
      :model-value="$props.modelValue.region"
      @update:model-value="$emit('update:model-value', { country: defaultCountry, region: $event })"
      :items="regions"
      :loading="loading"
    />

    <v-autocomplete label="Country" v-model="$props.modelValue.country" :items="countries" :loading="loading" />
  </div>
</template>

<script lang="ts">
import { computed, onMounted, type PropType, ref } from "vue";

import { gqlClient } from "../clients";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { normalizeError } from "../utils/helpers";

export type Location = { country: string; region: string };
export type Locations = { [region: string]: string[] };

export const defaultRegion = "All Regions";
export const defaultCountry = "All Countries";
export function createLocation(): Location {
  return { region: defaultRegion, country: defaultCountry };
}

async function getLocations(tries = 1): Promise<Locations> {
  try {
    const { totalCount: limit } = await gqlClient
      .countriesConnection({ totalCount: true }, { orderBy: ["name_ASC"] })
      .catch(() => ({ totalCount: 300 }));

    const countries = await gqlClient.countries({ name: true, subregion: true }, { limit });
    const locations: Locations = {};
    for (const { name, subregion } of countries) {
      locations[subregion] = locations[subregion] || [];
      locations[subregion].push(name);
    }
    return locations;
  } catch (error) {
    if (tries === 3) {
      createCustomToast(
        normalizeError(error, "Something went wrong while getting available locations."),
        ToastType.danger,
      );
      return {};
    }
    return getLocations(tries + 1);
  }
}

export default {
  name: "SelectLocation",
  props: {
    modelValue: { type: Object as PropType<Location>, required: true },
  },
  emits: {
    "update:model-value": (value: Location) => true || value,
  },
  setup(props) {
    const loading = ref(false);
    const locations = ref<Locations>({});
    const regions = computed(() => [defaultRegion, ...Object.keys(locations.value)]);
    const countries = computed(() => [defaultCountry, ...(locations.value[props.modelValue.region] || [])]);

    onMounted(async () => {
      loading.value = true;
      locations.value = await getLocations();
      loading.value = false;
    });

    return { defaultCountry, loading, regions, countries };
  },
};
</script>
