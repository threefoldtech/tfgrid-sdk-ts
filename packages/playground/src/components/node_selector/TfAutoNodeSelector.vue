<template>
  <VAutocomplete
    label="Node"
    placeholder="Select node"
    :items="loadedNodes"
    item-title="nodeId"
    return-object
    :model-value="$props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #item="{ item, props }">
      <VListItem v-bind="props">
        <template #title> {{ item.value.nodeId }} </template>
        <template #append>
          <VChip class="mr-2" v-if="item.value.certificationType.toLowerCase() === 'certified'" color="primary">
            Certified
          </VChip>
          <VChip :color="item.value.rentedByTwinId === 0 ? 'secondary' : 'success'">
            {{ item.value.rentedByTwinId === 0 ? "Shared" : "Dedicated" }}
          </VChip>
        </template>
      </VListItem>
    </template>

    <template #append-item v-if="page !== -1">
      <VContainer>
        <VBtn
          @click="reloadNodes()"
          block
          color="secondary"
          variant="tonal"
          :loading="nodesTask.loading"
          prepend-icon="mdi-reload"
        >
          Load More Nodes
        </VBtn>
      </VContainer>
    </template>
  </VAutocomplete>
</template>

<script lang="ts">
import type { FarmInfo, NodeInfo } from "@threefold/grid_client";
import { computed, nextTick, type PropType, ref } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import {
  createPageGen,
  getNodePageCount,
  loadNodes,
  normalizeNodeFilters,
  normalizeNodeOptions,
} from "../../utils/nodeSelector";

export default {
  name: "TfAutoNodeSelector",
  props: {
    modelValue: Object as PropType<NodeInfo>,
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      required: true,
    },
    location: {
      type: Object as PropType<SelectedLocation>,
      required: true,
    },
    farm: {
      type: Object as PropType<Partial<FarmInfo>>,
      required: true,
    },
  },
  emits: {
    "update:model-value": (node?: NodeInfo) => true || node,
  },
  setup(props) {
    const gridStore = useGrid();
    const loadedNodes = ref<NodeInfo[]>([]);
    const nodesTask = useAsync(loadNodes, {
      onAfterTask({ data }) {
        loadedNodes.value = loadedNodes.value.concat(data as NodeInfo[]);
        nextPage();
      },
      default: [],
    });

    const pageCountTask = useAsync(getNodePageCount, { default: 1 });
    const page = ref(-1);
    let pageGen: ReturnType<typeof createPageGen>;
    function nextPage() {
      page.value = pageGen?.next().value ?? -1;
    }

    const options = computed(() => normalizeNodeOptions(gridStore, props.location, page, props.farm));
    const filters = computed(() => normalizeNodeFilters(props.filters, options.value));

    const reloadNodes = () => nodesTask.value.run(gridStore, filters.value);
    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pageGen = createPageGen(pageCountTask.value.data as number);
        nextPage();
        await nextTick();
        loadedNodes.value = [];
        return reloadNodes();
      },
      { deep: true, debounce: 1000, ignoreFields: ["page"] },
    );

    return {
      nodesTask,
      loadedNodes,
      reloadNodes,
      page,
    };
  },
};
</script>
