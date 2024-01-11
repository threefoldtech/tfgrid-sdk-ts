<template>
  <VExpansionPanels :model-value="[0]" mandatory>
    <VExpansionPanel eager>
      <template #title>
        <span class="text-subtitle-1" v-text="'Filters'" />
      </template>

      {{ services }}

      <VExpansionPanelText>
        <FormValidator valid-on-init v-model="valid">
          <VContainer fluid>
            <VRow>
              <slot />
            </VRow>

            <VRow class="mb-4">
              <VDivider />
            </VRow>

            <VRow justify="end">
              <VBtn variant="outlined" class="mr-2" :disabled="disableClear">Clear</VBtn>
              <VBtn color="primary" variant="tonal" :disabled="!valid">Apply</VBtn>
            </VRow>
          </VContainer>
        </FormValidator>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<script lang="ts">
import { computed, type ComputedRef, inject, provide, ref } from "vue";

const key = Symbol("key:filters-container");

export interface FilterService {
  value?: string | number | null;
  changed: boolean;
  reset(): void;
  clear(): void;
}

export interface FiltersContainerService {
  register(key: string, service: ComputedRef<FilterService>): void;
  unregister(key: string): void;
}

export function useFilterContainer() {
  return inject(key) as FiltersContainerService;
}

function provideService(service: FiltersContainerService) {
  return provide(key, service);
}

export default {
  name: "FiltersContainer",
  setup() {
    const valid = ref<boolean>();
    const filters = ref(new Map<string, ComputedRef<FilterService>>());
    const services = computed(() => Array.from(filters.value.values()));

    const disableClear = computed(() => {
      console.log(services.value);

      return services.value.every(s => !s.value.value);
      // console.log(services.value.map(f => f.value));
      // return services.value.every(f => !f.value.value);
    });

    provideService({
      register: (key, service) => filters.value.set(key, service),
      unregister: key => filters.value.delete(key),
    });

    return { filters, disableClear, valid, services };
  },
};
</script>
