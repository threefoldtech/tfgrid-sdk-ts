<template>
  <section>
    <VBtn
      variant="tonal"
      color="secondary"
      class="mb-4"
      size="x-large"
      block
      @click="resetPageAndReloadNodes()"
      :loading="pageCountTask.loading || nodesTask.loading"
      :disabled="nodeInputValidateTask.loading || !validFilters"
    >
      Load Nodes
    </VBtn>

    <input-tooltip tooltip="Select a node ID to deploy on." align-center>
      <div class="w-100" :style="{ position: 'relative' }">
        <VProgressLinear
          v-if="loadedNodes.length > 0 && (pageCountTask.loading || nodesTask.loading)"
          indeterminate
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9,
            transform: 'none',
            width: 'calc(100% - 16px)',
          }"
          height="2px"
          color="primary"
        />

        <VCard
          max-height="450"
          flat
          class="mb-4 border"
          :disabled="!validFilters || filtersUpdated"
          :style="{ opacity: !validFilters || filtersUpdated ? 0.5 : 1 }"
        >
          <VContainer v-if="loadedNodes.length === 0 && (pageCountTask.loading || nodesTask.loading)">
            <VRow align="center" justify="center" class="pa-4">
              <VProgressCircular color="primary" indeterminate class="mr-2" /> Loading Nodes...
            </VRow>
          </VContainer>

          <VContainer v-if="loadedNodes.length === 0 && !(pageCountTask.loading || nodesTask.loading)">
            <VAlert type="error" text="No Nodes were found!" />
          </VContainer>

          <div ref="nodesContainer" :style="{ maxHeight: '450px' }" class="overflow-auto" v-if="loadedNodes.length">
            <template v-for="(node, index) in loadedNodes" :key="node.id">
              <TfNodeDetailsCard
                :node="node"
                :selected="!validFilters || filtersUpdated ? false : $props.modelValue === node"
                @node:select="bindModelValueAndValidate"
              />
              <div class="border-b" v-if="index + 1 !== loadedNodes.length" />
            </template>

            <VContainer v-if="loadedNodes.length > 0 && pagination.page !== -1">
              <VBtn
                @click="reloadNodes()"
                block
                color="secondary"
                variant="tonal"
                size="large"
                :loading="nodesTask.loading"
                prepend-icon="mdi-reload"
                :disabled="nodeInputValidateTask.loading"
              >
                Load More Nodes
              </VBtn>
            </VContainer>
          </div>
        </VCard>

        <VAlert
          :type="!validFilters ? 'error' : 'warning'"
          variant="elevated"
          :style="{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9 }"
          v-if="!validFilters || (filtersUpdated && validFilters)"
        >
          <span v-if="!validFilters" v-text="'Please provide valid data.'" />
          <template v-else>
            Please press on <strong>Load Nodes</strong> button to list nodes matching your new requirements.
          </template>
        </VAlert>

        <VAlert
          type="info"
          variant="elevated"
          :style="{ position: 'absolute', bottom: '15px', right: '31px', zIndex: 9 }"
          v-else-if="nodeInputValidateTask.loading"
          text="Checking if the disks will fit in the node's storage pools..."
        />

        <VAlert
          type="error"
          variant="elevated"
          v-if="!filtersUpdated && nodeInputValidateTask.error"
          :style="{ position: 'absolute', bottom: '15px', right: '31px', zIndex: 9 }"
          :text="nodeInputValidateTask.error"
        />
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
import type { VCard } from "vuetify/components/VCard";

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
import TfNodeDetailsCard from "./TfNodeDetailsCard.vue";

export default {
  name: "TfAutoNodeSelector",
  components: { TfNodeDetailsCard },
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
        onAfterTask({ data }) {
          bindStatus(data ? ValidatorStatus.Valid : ValidatorStatus.Invalid);
          const container = nodesContainer.value as HTMLDivElement;
          if (container) {
            const card = container.querySelector(".selected-node") as HTMLDivElement;

            if (card && container.getAttribute("data-scrolled") !== "scrolled") {
              container.setAttribute("data-scrolled", "scrolled");
              container.scroll({
                behavior: "smooth",
                top: card.offsetTop - 100,
              });
            }
          }
        },
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

    const nodesContainer = ref<HTMLDivElement>();

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

      nodesContainer,
    };
  },
};
</script>

<style>
.node-selector .v-select__selection {
  width: 100%;
}
</style>
