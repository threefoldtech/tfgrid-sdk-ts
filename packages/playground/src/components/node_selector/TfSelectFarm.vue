<template>
  <VAutocomplete
    label="Farm Name"
    placeholder="Select a farm"
    :items="farms"
    :loading="farmsTask.loading"
    item-title="name"
    :model-value="modelValue || farms[0]"
    @update:model-value="
      $event => {
        if ($event !== $props.modelValue) {
          $emit('update:model-value', $event || farms[0]);
        }
      }
    "
    clearable
    @click:clear="onClear()"
    return-object
    @vue:mounted="if (!modelValue || !modelValue.name) $emit('update:model-value', farms[0]);"
    prepend-inner-icon="mdi-magnify"
    v-model:menu="menuOpened"
    :focused="focused"
    @update:focused="updateFocused($event)"
    v-model:search.trim="searchQuery"
    @keyup="searchForFarms"
  >
    <template #no-data v-if="searchTask.loading">
      <div class="d-flex pa-2">
        <VProgressCircular indeterminate color="primary" size="20" width="3" />
        <p class="ml-2">
          Searching for farms with query <strong>{{ searchQuery }}</strong>
        </p>
      </div>
    </template>

    <template #append-item v-if="!searchTask.initialized && page !== -1">
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
</template>

<script lang="ts">
import type { FarmInfo } from "@threefold/grid_client";
import { computed, nextTick, onUnmounted, type PropType, ref } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import {
  createPageGen,
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
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      required: true,
    },
    location: Object as PropType<SelectedLocation>,
  },
  emits: {
    "update:model-value": (farm: FarmInfo) => true || farm,
  },
  setup(props, ctx) {
    const gridStore = useGrid();

    /* Load farms with filters */
    const loadedFarms = ref<FarmInfo[]>([]);
    const farmsTask = useAsync(loadFarms, {
      onBeforeTask() {
        if (!searchTask.value.initialized) {
          const oldFarm = props.modelValue;
          ctx.emit("update:model-value", farms.value[0]);
          return oldFarm?.farmId;
        }
      },
      onAfterTask({ data }, oldFarmId?: number) {
        loadedFarms.value = loadedFarms.value.concat(data as FarmInfo[]);
        if (oldFarmId) {
          const index = loadedFarms.value.findIndex(f => f.farmId === oldFarmId);
          if (loadedFarms.value[index]) {
            ctx.emit("update:model-value", loadedFarms.value[index]);
          }
        }
        nextPage();
      },
      default: [],
    });
    const options = computed(() => normalizeFarmOptions(gridStore, props.location, page));
    const filters = computed(() => normalizeFarmFilters(props.filters, options.value));

    const pageCountTask = useAsync(getFarmPageCount, { default: 1 });
    const page = ref(-1);
    let pageGen: ReturnType<typeof createPageGen>;
    function nextPage() {
      page.value = pageGen?.next().value ?? -1;
    }

    const reloadFarms = () => farmsTask.value.run(gridStore, filters.value, props.filters.exclusiveFor);
    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pageGen = createPageGen(pageCountTask.value.data as number);
        nextPage();
        await nextTick();
        loadedFarms.value = [];
        return reloadFarms();
      },
      { immediate: true, deep: true, debounce: 1000, ignoreFields: ["page"] },
    );

    /* Load farms with search */
    const searchTask = useAsync(searchFarms);
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
      ctx.emit("update:model-value", farms.value[0]);
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

    onUnmounted(() => ctx.emit("update:model-value", {} as FarmInfo));

    return {
      farmsTask,
      page,
      reloadFarms,

      searchTask,
      menuOpened,
      focused,
      updateFocused,
      searchQuery,
      searchForFarms,

      onClear,
      farms,
    };
  },
};
</script>
