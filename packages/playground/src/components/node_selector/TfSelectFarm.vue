<template>
  <input-tooltip tooltip="The name of the farm that you want to deploy inside it.">
    <VAutocomplete
      label="Farm Name"
      placeholder="Select a farm"
      class="w-100 mb-1"
      :items="farms"
      :loading="farmsTask.loading"
      item-title="name"
      :model-value="modelValue || farms[0]"
      @update:model-value="bindModelValue"
      clearable
      @click:clear="onClear()"
      return-object
      prepend-inner-icon="mdi-magnify"
      v-model:menu="menuOpened"
      :focused="focused"
      @update:focused="updateFocused($event)"
      v-model:search.trim="searchQuery"
      @keyup="searchForFarms"
      :hint="
        !validFilters
          ? 'Please provide valid data.'
          : pageCountTask.loading || !farmsTask.initialized
          ? 'Preparing to load farms'
          : searchQuery === '' && !menuOpened && focused
          ? 'Type any desired farm name to search for...'
          : undefined
      "
      :persistent-hint="
        !validFilters ||
        !farmsTask.initialized ||
        pageCountTask.loading ||
        (searchQuery === '' && !menuOpened && focused)
      "
      :disabled="!validFilters"
    >
      <template #no-data v-if="searchTask.loading">
        <div class="d-flex pa-2">
          <VProgressCircular indeterminate color="primary" size="20" width="3" />
          <p class="ml-2">
            Searching for farms with query <strong>{{ searchQuery }}</strong>
          </p>
        </div>
      </template>

      <template #prepend-item v-if="searchQuery === '' && menuOpened">
        <span class="px-4 text-caption text-medium-emphasis">Type any desired farm name to search for...</span>
      </template>

      <template #append-item v-if="!searchTask.initialized && pagination.page !== -1">
        <VContainer>
          <VBtn
            @click="reloadFarms()"
            block
            color="secondary"
            variant="tonal"
            :loading="farmsTask.loading"
            prepend-icon="mdi-reload"
          >
            Load More Farms
          </VBtn>
        </VContainer>
      </template>
    </VAutocomplete>
  </input-tooltip>
</template>

<script lang="ts">
import type { FarmInfo } from "@threefold/grid_client";
import { computed, nextTick, onUnmounted, type PropType, ref } from "vue";

import { useAsync, usePagination, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { SelectedLocation, SelectionDetailsFilters } from "../../types/nodeSelector";
import {
  getFarmPageCount,
  loadFarms,
  normalizeFarmFilters,
  normalizeFarmOptions,
  searchFarms,
} from "../../utils/nodeSelector";

const _defaultFarm = { name: "All Farms" } as FarmInfo;

export default {
  name: "TfSelectFarm",
  props: {
    modelValue: Object as PropType<FarmInfo>,
    validFilters: { type: Boolean, required: true },
    filters: {
      type: Object as PropType<SelectionDetailsFilters>,
      required: true,
    },
    location: Object as PropType<SelectedLocation>,
  },
  emits: {
    "update:model-value": (farm?: FarmInfo) => true || farm,
  },
  setup(props, ctx) {
    const gridStore = useGrid();

    /* Load farms with filters */
    const loadedFarms = ref<FarmInfo[]>([]);
    const farmsTask = useAsync(loadFarms, {
      shouldRun: () => props.validFilters,
      onBeforeTask() {
        if (!searchTask.value.initialized) {
          const oldFarm = props.modelValue;
          bindModelValue();
          return oldFarm?.farmId;
        }
      },
      onAfterTask({ data }, oldFarmId?: number) {
        loadedFarms.value = loadedFarms.value.concat(data as FarmInfo[]);
        if (oldFarmId) {
          const index = loadedFarms.value.findIndex(f => f.farmId === oldFarmId);
          bindModelValue(loadedFarms.value[index]);
        }
        pagination.value.next();
      },
      default: [],
    });
    const options = computed(() => normalizeFarmOptions(gridStore, props.location, pagination));
    const filters = computed(() => normalizeFarmFilters(props.filters, options.value));

    const pageCountTask = useAsync(getFarmPageCount, { default: 1, shouldRun: () => props.validFilters });
    const pagination = usePagination();

    const reloadFarms = () => farmsTask.value.run(gridStore, filters.value, props.filters.exclusiveFor);

    useWatchDeep(filters, farmsTask.value.reset);
    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pagination.value.reset(pageCountTask.value.data as number);
        await nextTick();
        loadedFarms.value = [];
        return reloadFarms();
      },
      { immediate: true, deep: true, debounce: 1000, ignoreFields: ["page"] },
    );

    /* Load farms with search */
    const searchTask = useAsync(searchFarms, { shouldRun: () => props.validFilters });
    let oldSearchQuery = "";
    const searchQuery = ref("");

    const menuOpened = ref(false);
    const focused = ref(false);
    async function updateFocused(focus: boolean) {
      focused.value = focus;
      if (focus) {
        await nextTick();
        searchQuery.value = oldSearchQuery;
      }
    }

    function searchForFarms() {
      if (oldSearchQuery === searchQuery.value) {
        return;
      }

      oldSearchQuery = searchQuery.value;

      if (!oldSearchQuery) {
        return searchTask.value.reset();
      }

      return searchTask.value.run(oldSearchQuery);
    }

    function onClear() {
      bindModelValue();
      searchTask.value.reset();
      oldSearchQuery = "";
    }

    /* Farms to be shown */
    const farms = computed(() => {
      const res = [_defaultFarm];

      if ((focused.value || menuOpened.value) && searchTask.value.initialized) {
        return res.concat(searchTask.value.data || []);
      }

      return res.concat(loadedFarms.value);
    });

    onUnmounted(bindModelValue);
    function bindModelValue(farm?: FarmInfo) {
      const f = !farm || !farm.farmId ? undefined : farm;
      f !== props.modelValue && ctx.emit("update:model-value", f);
    }

    return {
      farmsTask,
      pagination,
      reloadFarms,
      pageCountTask,

      searchTask,
      menuOpened,
      focused,
      updateFocused,
      searchQuery,
      searchForFarms,

      onClear,
      farms,

      bindModelValue,
    };
  },
};
</script>
