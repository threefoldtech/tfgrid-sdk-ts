<template>
  <section>
    <VFadeTransition>
      <VAlert type="warning" class="mb-4" v-if="filtersUpdated">
        Please press on <strong>Load Nodes</strong> button to list nodes matching your new requirements.
      </VAlert>
    </VFadeTransition>

    <div class="d-flex">
      <VAutocomplete
        ref="nodeInput"
        label="Node"
        placeholder="Select node"
        :items="loadedNodes"
        item-title="nodeId"
        return-object
        :model-value="$props.modelValue"
        @update:model-value="bindModelValue($event)"
        :disabled="filtersUpdated"
        :loading="nodeInputValidateTask.loading"
        required
        :hint="
          nodeInputValidateTask.loading ? `Checking if the disks will fit in the node's storage pools...` : undefined
        "
        :persistent-hint="nodeInputValidateTask.loading"
        clearable
        @click:clear="
          bindModelValue();
          ($refs.nodeInput as VInput)?.$el.querySelector('input').blur();
          nodeInputValidateTask.reset();
          touched = false;
        "
        :error="!!nodeInputValidateTask.error && !filtersUpdated"
        :error-messages="!filtersUpdated ? nodeInputValidateTask.error || undefined : undefined"
        @blur="
          touched
            ? undefined
            : (() => {
                touched = true;
                !nodeInputValidateTask.initialized && nodeInputValidateTask.run($props.modelValue);
              })()
        "
        :rules="[() => true]"
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
              :disabled="nodeInputValidateTask.loading"
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
        :disabled="nodeInputValidateTask.loading"
      >
        Load Nodes
      </VBtn>
    </div>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import equals from "lodash/fp/equals.js";
import { computed, nextTick, onMounted, type PropType, ref, watch } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VInput } from "vuetify/components/VInput";

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
    valid: Boolean,
  },
  emits: {
    "update:model-value": (node?: NodeInfo) => true || node,
    "update:valid": (valid: boolean) => true || valid,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const loadedNodes = ref<NodeInfo[]>([]);
    const nodesTask = useAsync(loadNodes, {
      onBeforeTask() {
        const oldNode = props.modelValue;
        bindModelValue();
        return oldNode?.nodeId;
      },
      onAfterTask({ data }, oldNodeId: number) {
        loadedNodes.value = loadedNodes.value.concat(data as NodeInfo[]);
        if (oldNodeId) {
          const index = loadedNodes.value.findIndex(n => n.nodeId === oldNodeId);
          bindModelValue(loadedNodes.value[index]);
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
      nodeInputValidateTask.value.reset();
      touched.value = false;
      baseFilters.value = undefined;
      filtersUpdated.value = false;
      await pageCountTask.value.run(gridStore, filters.value);
      pageGen = createPageGen(pageCountTask.value.data as number);
      nextPage();
      await nextTick();
      loadedNodes.value = [];
      return reloadNodes();
    }

    const nodeInputValidateTask = useAsync<true, string, [NodeInfo | undefined]>(async node => {
      if (!node || !node.nodeId) {
        throw "Node ID is required.";
      }

      try {
        await gridStore.client.capacity.checkNodeCapacityPool({
          nodeId: node.nodeId,
          ssdDisks: [props.filters.solutionDisk ?? 0, ...(props.filters.ssdDisks || [])]
            .filter(Boolean)
            .map(disk => disk * 1024 ** 3),
          rootfsDisks: [(props.filters.rootFilesystemSize ?? 0) * 1024 ** 3],
          hddDisks: props.filters.hddDisks || [],
        });
        return true;
      } catch (error) {
        if (error?.toString().includes("Cannot fit the required SSD disk with size")) {
          throw (
            "Although node " +
            node.nodeId +
            " appears to have sufficient storage capacity for your workload, it lacks a single internal " +
            "partition capable of accommodating it. Please select a different node."
          );
        }

        throw "Something went wrong while checking status of the node. Please check your connection and try again.";
      }
    });

    const touched = ref(false);
    function bindModelValue(node?: NodeInfo) {
      ctx.emit("update:model-value", node);
      (touched.value || node) && nodeInputValidateTask.value.run(node);
    }

    // update v-model:valid
    const valid = computed(() => {
      const { initialized, data } = nodeInputValidateTask.value;
      return initialized && data === true && !filtersUpdated.value;
    });
    watch(valid, valid => ctx.emit("update:valid", valid), { immediate: true });

    return {
      pageCountTask,
      nodesTask,
      loadedNodes,
      reloadNodes,
      resetPageAndReloadNodes,
      page,

      filtersUpdated,
      nodeInputValidateTask,

      touched,
      bindModelValue,
    };
  },
};
</script>
