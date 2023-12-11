<template>
  <section>
    <VAlert type="warning" class="mb-4" v-if="filtersUpdated">
      Please press on <strong>Load Nodes</strong> button to list nodes matching your new requirements.
    </VAlert>

    <div class="d-flex">
      <VAutocomplete
        label="Node"
        placeholder="Select node"
        :items="loadedNodes"
        item-title="nodeId"
        return-object
        :model-value="$props.modelValue"
        @update:model-value="$emit('update:model-value', $event)"
        :disabled="filtersUpdated"
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

      <VBtn
        variant="tonal"
        color="secondary"
        class="mt-2 ml-2"
        @click="resetPageAndReloadNodes()"
        :loading="pageCountTask.loading || nodesTask.loading"
      >
        Load Nodes
      </VBtn>
    </div>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import equals from "lodash/fp/equals.js";
import { computed, nextTick, onMounted, type PropType, ref } from "vue";

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
  setup(props, ctx) {
    const gridStore = useGrid();
    const loadedNodes = ref<NodeInfo[]>([]);
    const nodesTask = useAsync(loadNodes, {
      onBeforeTask() {
        const oldNode = props.modelValue;
        ctx.emit("update:model-value");
        return oldNode?.nodeId;
      },
      onAfterTask({ data }, oldNodeId: number) {
        loadedNodes.value = loadedNodes.value.concat(data as NodeInfo[]);
        if (oldNodeId) {
          const index = loadedNodes.value.findIndex(n => n.nodeId === oldNodeId);
          ctx.emit("update:model-value", loadedNodes.value[index]);
        }
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

    let initialized = false;
    onMounted(async () => {
      initialized = true;
      await resetPageAndReloadNodes();
    });

    const baseFilters = ref<FilterOptions>();
    const filtersUpdated = ref(false);
    useWatchDeep(
      filters,
      async (filters, oldFilters) => {
        if (!initialized) {
          return;
        }

        if (baseFilters.value) {
          if (equals(filters, baseFilters.value)) {
            baseFilters.value = undefined;
            filtersUpdated.value = false;
            return;
          }

          filtersUpdated.value = true;
          return;
        }

        baseFilters.value = oldFilters;
        filtersUpdated.value = !equals(filters, oldFilters);
      },
      { deep: true, ignoreFields: ["page"] },
    );

    async function resetPageAndReloadNodes() {
      baseFilters.value = undefined;
      filtersUpdated.value = false;
      await pageCountTask.value.run(gridStore, filters.value);
      pageGen = createPageGen(pageCountTask.value.data as number);
      nextPage();
      await nextTick();
      loadedNodes.value = [];
      return reloadNodes();
    }

    return {
      pageCountTask,
      nodesTask,
      loadedNodes,
      reloadNodes,
      resetPageAndReloadNodes,
      page,

      filtersUpdated,
    };
  },
};
</script>
