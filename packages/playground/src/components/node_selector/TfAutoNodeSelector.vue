<template>
  <section>
    <VFadeTransition>
      <VAlert type="warning" class="mb-4 mt-1" v-if="filtersUpdated && validFilters">
        Please press on <strong>Load Nodes</strong> button to list nodes matching your new requirements.
      </VAlert>
    </VFadeTransition>

    <input-tooltip tooltip="Select a node ID to deploy on.">
      <div class="d-flex w-100">
        <VAutocomplete
          ref="nodeInput"
          label="Node"
          placeholder="Select node"
          :items="loadedNodes"
          item-title="nodeId"
          return-object
          :model-value="$props.modelValue"
          @update:model-value="bindModelValueAndValidate($event)"
          :disabled="!validFilters || filtersUpdated"
          :loading="nodeInputValidateTask.loading"
          required
          :hint="
            !validFilters
              ? 'Please provide valid data.'
              : nodeInputValidateTask.loading
              ? `Checking if the disks will fit in the node's storage pools...`
              : undefined
          "
          :persistent-hint="!validFilters || nodeInputValidateTask.loading"
          clearable
          @click:clear="
            bindModelValueAndValidate();
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

          <template #append-item v-if="pagination.page !== -1">
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
          variant="outlined"
          color="secondary"
          class="mt-2 ml-2"
          @click="resetPageAndReloadNodes()"
          :loading="pageCountTask.loading || nodesTask.loading"
          :disabled="nodeInputValidateTask.loading || !validFilters"
        >
          Load Nodes
        </VBtn>
      </div>
    </input-tooltip>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import equals from "lodash/fp/equals.js";
import sample from "lodash/fp/sample.js";
import { computed, nextTick, onMounted, onUnmounted, type PropType, ref } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VInput } from "vuetify/components/VInput";

import { useAsync, usePagination, useWatchDeep } from "../../hooks";
import { ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import type { SelectedLocation, SelectionDetailsFilters } from "../../types/nodeSelector";
import {
  checkNodeCapacityPool,
  getNodePageCount,
  loadValidNodes,
  normalizeNodeFilters,
  normalizeNodeOptions,
} from "../../utils/nodeSelector";

export default {
  name: "TfAutoNodeSelector",
  props: {
    modelValue: Object as PropType<NodeInfo>,
    validFilters: { type: Boolean, required: true },
    filters: {
      type: Object as PropType<SelectionDetailsFilters>,
      required: true,
    },
    location: Object as PropType<SelectedLocation>,
    farm: Object as PropType<FarmInfo>,
    status: String as PropType<ValidatorStatus>,
  },
  emits: {
    "update:model-value": (node?: NodeInfo) => true || node,
    "update:status": (status: ValidatorStatus) => true || status,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const loadedNodes = ref<NodeInfo[]>([]);
    const nodesTask = useAsync(loadValidNodes, {
      shouldRun: () => props.validFilters,
      onBeforeTask() {
        const oldNode = props.modelValue;
        bindModelValue();
        return oldNode?.nodeId;
      },
      onAfterTask({ data }, oldNodeId: number) {
        loadedNodes.value = loadedNodes.value.concat(data as NodeInfo[]);

        const node = loadedNodes.value.find(n => n.nodeId === oldNodeId) || sample(loadedNodes.value);
        node && bindModelValue(node);
        node && nodeInputValidateTask.value.run(node);
        pagination.value.next();
      },
      default: [],
    });

    const pageCountTask = useAsync(getNodePageCount, { default: 1, shouldRun: () => props.validFilters });
    const pagination = usePagination();

    const options = computed(() => normalizeNodeOptions(gridStore, props.location, pagination, props.farm));
    const filters = computed(() => normalizeNodeFilters(props.filters, options.value));

    const reloadNodes = () => nodesTask.value.run(gridStore, props.filters, filters.value, pagination);

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
            props.modelValue && nodeInputValidateTask.value.run(props.modelValue);
            return;
          }

          filtersUpdated.value = true;
          nodeInputValidateTask.value.initialized && nodeInputValidateTask.value.reset();
          return;
        }

        baseFilters.value = oldFilters;
        filtersUpdated.value = !equals(filters, oldFilters);
        filtersUpdated.value && nodeInputValidateTask.value.initialized && nodeInputValidateTask.value.reset();
      },
      { deep: true, ignoreFields: ["page"] },
    );

    async function resetPageAndReloadNodes() {
      bindStatus();
      nodeInputValidateTask.value.reset();
      touched.value = false;
      baseFilters.value = undefined;
      filtersUpdated.value = false;
      await pageCountTask.value.run(gridStore, filters.value);
      pagination.value.reset(pageCountTask.value.data as number);
      await nextTick();
      loadedNodes.value = [];
      return reloadNodes();
    }

    const nodeInputValidateTask = useAsync<true, string, [NodeInfo | undefined]>(
      node => checkNodeCapacityPool(gridStore, node, props.filters),
      {
        tries: 1,
        shouldRun: () => props.validFilters,
        onBeforeTask: () => bindStatus(ValidatorStatus.Pending),
        onAfterTask: ({ data }) => bindStatus(data ? ValidatorStatus.Valid : ValidatorStatus.Invalid),
        onReset: bindStatus,
      },
    );

    const touched = ref(false);
    function bindModelValueAndValidate(node?: NodeInfo) {
      bindModelValue(node);
      (touched.value || node) && nodeInputValidateTask.value.run(node);
    }

    onUnmounted(() => {
      bindModelValue();
      bindStatus();
    });

    function bindModelValue(node?: NodeInfo): void {
      ctx.emit("update:model-value", node);
    }

    onMounted(bindStatus);
    function bindStatus(status?: ValidatorStatus): void {
      ctx.emit("update:status", status || ValidatorStatus.Init);
    }

    return {
      pageCountTask,
      nodesTask,
      loadedNodes,
      reloadNodes,
      resetPageAndReloadNodes,
      pagination,

      filtersUpdated,
      nodeInputValidateTask,

      touched,
      bindModelValueAndValidate,
      bindStatus,
    };
  },
};
</script>
