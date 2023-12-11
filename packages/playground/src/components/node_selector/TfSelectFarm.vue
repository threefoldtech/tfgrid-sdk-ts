<template>
  <TfSelectFarmSupportSearch>
    <template #search-support="{ searchSupportProps }">
      <VAutocomplete
        label="Farm Name"
        placeholder="Select a farm"
        :items="farms"
        :loading="farmsTask.loading"
        item-title="name"
        :model-value="modelValue || farms[0]"
        @update:model-value="$emit('update:model-value', $event || farms[0])"
        clearable
        @click:clear="$emit('update:model-value', farms[0])"
        return-object
        @vue:mounted="if (!modelValue || !modelValue.name) $emit('update:model-value', farms[0]);"
        v-bind="searchSupportProps"
      />
    </template>
  </TfSelectFarmSupportSearch>
</template>

<script lang="ts">
import type { FarmInfo, GridClient } from "@threefold/grid_client";
import { computed, type PropType } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import { loadFarms, normalizeFarmFilters } from "../../utils/nodeSelector";
import TfSelectFarmSupportSearch from "./TfSelectFarmSupportSearch.vue";

export default {
  name: "TfSelectFarm",
  components: { TfSelectFarmSupportSearch },
  props: {
    modelValue: Object as PropType<FarmInfo>,
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      required: true,
    },
    location: {
      type: Object as PropType<SelectedLocation>,
      required: true,
    },
  },
  emits: {
    "update:model-value": (farm: FarmInfo) => true || farm,
  },
  setup(props) {
    const gridStore = useGrid();
    const farmsTask = useAsync(loadFarms);
    const farms = computed(() => [{ name: "All Farms" } as FarmInfo, ...(farmsTask.value.data || [])]);

    const filters = computed(() =>
      normalizeFarmFilters(props.filters, {
        size: window.env.PAGE_SIZE,
        page: 1,
        location: props.location,
        twinId: gridStore.client.twinId,
      }),
    );

    useWatchDeep(
      filters,
      filters => farmsTask.value.run(gridStore.client as GridClient, filters, props.filters.exclusiveFor),
      { immediate: true, debounce: 1000 },
    );

    return {
      farmsTask,

      farms,
    };
  },
};
</script>
