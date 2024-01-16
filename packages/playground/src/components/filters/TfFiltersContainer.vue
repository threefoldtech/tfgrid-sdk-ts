<template>
  <VExpansionPanels :model-value="[0]">
    <VExpansionPanel eager>
      <VExpansionPanelTitle class="text-h6"> Filters </VExpansionPanelTitle>
      <VExpansionPanelText eager>
        <VForm :disabled="loading">
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

            <VContainer fluid>
              <VRow no-gutters>
                <VSpacer />
                <VBtn
                  variant="outlined"
                  :disabled="loading || !valid || empty"
                  @click="clear"
                  text="Clear"
                  class="mr-2"
                />
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
        </VForm>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

<script lang="ts">
import { computed, type ComputedRef, inject, onMounted, provide, ref } from "vue";
import { useRouter } from "vue-router";

const key = Symbol("key:filters-container");

export interface FilterService {
  empty: boolean;
  changed: boolean;
  clear(): boolean;
  apply(): [name: string, value?: string];
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
    const router = useRouter();
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
      const clear = services.value.map(service => service.value.clear());
      clear.some(c => c) && ctx.emit("apply");
    }

    onMounted(apply);
    function apply() {
      const applys = services.value.map(service => service.value.apply());

      router.replace({
        query: applys.reduce((query, [name, value]) => {
          query[name] = value;
          return query;
        }, {} as { [name: string]: string | undefined }),
      });

      ctx.emit("apply");
    }

    return { empty, changed, clear, apply, valid };
  },
};
</script>
