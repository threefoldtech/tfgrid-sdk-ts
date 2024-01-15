<template>
  <VCard>
    <VCardTitle v-text="'Filters'" class="bg-primary" />
    <VCardText>
      <FormValidator valid-on-init v-model="valid">
        <VContainer fluid>
          <VRow no-gutters>
            <slot />
          </VRow>

          <VRow class="mb-4" no-gutters v-show="valid && (changed || (!loading && !empty))">
            <VAlert type="info" variant="tonal">
              <span>
                {{ changed ? "Filtering options updated but not applied." : "" }} Click
                <VCard class="d-inline pa-1" v-text="changed ? 'Apply' : 'Clear'" flat />
                {{ changed ? "inorder to reloading your data." : "to reset your selected filters." }}
              </span>
            </VAlert>
          </VRow>

          <VRow no-gutters>
            <VDivider />
          </VRow>
        </VContainer>

        <VContainer>
          <VRow>
            <VSpacer />
            <VBtn variant="outlined" :disabled="loading || !valid || empty" @click="clear" text="Clear" class="mr-2" />
            <VBtn
              variant="outlined"
              color="primary"
              :disabled="!valid || !changed"
              @click="apply"
              text="Apply"
              :loading="loading"
            />
          </VRow>
        </VContainer>
      </FormValidator>
    </VCardText>
  </VCard>
</template>

<script lang="ts">
import { computed, type ComputedRef } from "vue";
import { inject, provide, ref } from "vue";

const key = Symbol("key:filters-container");

export interface FilterService {
  empty: boolean;
  changed: boolean;
  clear(): boolean;
  apply(): void;
}

export interface FiltersContainerService {
  register(name: string, service: ComputedRef<FilterService>): void;
  unregister(name: string): void;
}

export function useFiltersContainerService() {
  return inject(key) as FiltersContainerService;
}

export default {
  name: "TfFiltersContainer",
  props: { loading: Boolean },
  emits: {
    apply: () => true,
  },
  setup(_, ctx) {
    const filters = ref(new Map<string, ComputedRef<FilterService>>());

    const valid = ref(false);
    const services = computed(() => [...filters.value.values()]);

    const empty = computed(() => services.value.every(s => s.value.empty));
    const changed = computed(() => services.value.some(s => s.value.changed));

    const service: FiltersContainerService = {
      register(name, service) {
        filters.value.set(name, service);
      },

      unregister(name) {
        filters.value.delete(name);
      },
    };

    provide(key, service);

    function clear() {
      const cleared = services.value.some(s => s.value.clear());
      cleared && ctx.emit("apply");
    }

    function apply() {
      services.value.forEach(s => s.value.apply());
      ctx.emit("apply");
    }

    return { empty, changed, clear, apply, valid };
  },
};
</script>
