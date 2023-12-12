<template>
  <VTextField
    label="Node ID"
    placeholder="Add your desired node id to validate"
    type="number"
    v-model.number="nodeId"
    :error="!!validationTask.error"
    :error-messages="validationTask.error || undefined"
    :persistent-hint="validationTask.loading || (validationTask.initialized && validationTask.data === true)"
    :hint="validationTask.loading ? 'Validating node...' : validationTask.data ? `Node ${nodeId} is valid.` : undefined"
    @blur="validationTask.initialized ? undefined : validationTask.run(nodeId)"
  />
</template>

<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import isInt from "validator/lib/isInt";
import { computed, type PropType, ref, watch } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { NodeSelectorFilters } from "../../types/nodeSelector";
import { normalizeError } from "../../utils/helpers";
import { resolveAsync } from "../../utils/nodeSelector";

const _defaultError =
  "Something went wrong while checking status of the node. Please check your connection and try again.";

export default {
  name: "TfManualNodeSelector",
  props: {
    modelValue: Object as PropType<NodeInfo>,
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
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
    const nodeId = ref<number>();

    // reset node to mark form as invalid
    watch(nodeId, () => ctx.emit("update:model-value"));

    const validationTask = useAsync<true | string, string, [id: number | undefined]>(async nodeId => {
      if (typeof nodeId !== "number") {
        throw "Node ID is required.";
      }

      switch (true) {
        case !isInt(nodeId.toString()):
          throw "Node ID must be a valid number.";

        case nodeId < 1:
          throw "Node ID must be a valid number.";
      }

      const [node, e0] = await resolveAsync(gridStore.client.capacity.nodes.getNode(nodeId));
      if (e0) {
        throw normalizeError(e0, _defaultError);
      }

      switch (true) {
        case node === undefined || node === null:
          throw `Node ${nodeId} is not on the grid`;

        case node.status === "down":
          throw `Node ${nodeId} is down`;

        case props.filters.certified && node.certificationType.toLowerCase() !== "certified":
          throw `Node ${nodeId} is not Certified`;

        case props.filters.dedicated && node.rentedByTwinId === 0:
          throw `Node ${nodeId} is not Dedicated`;

        case props.filters.dedicated && node.rentedByTwinId !== gridStore.client.twinId:
          throw `Node ${nodeId} is Dedicated, but rented by someone else`;

        case props.filters.ipv4 && !node.publicConfig.ipv4:
          throw `Node ${nodeId} is not assigned to a PublicIP`;
      }

      const args = [nodeId, "proxy", gridStore.client.config.proxyURL] as const;
      const [resources, e1] = await resolveAsync(gridStore.client.capacity.nodes.getNodeFreeResources(...args));
      if (e1) {
        throw normalizeError(e1, _defaultError);
      }

      const { cru, mru, sru } = resources;
      const { cpu = 0, memory = 0, ssdDisks = [], solutionDisk = 0, rootFilesystemSize = 0 } = props.filters;

      const memorySize = memory / 1024;
      const requiredMru = Math.ceil(Math.pow(Math.round(memorySize) * 1024, 3));

      const diskSize = ssdDisks.reduce((t, d) => t + d, rootFilesystemSize + solutionDisk);
      const requiredDisk = Math.ceil(Math.pow(diskSize, 3));

      switch (true) {
        case cru < cpu:
          throw `Node ${nodeId} doesn't have enough CPU`;

        case mru < requiredMru:
          throw `Node ${nodeId} doesn't have enough Memory`;

        case sru < requiredDisk:
          throw `Node ${nodeId} doesn't have enough Storage`;
      }

      ctx.emit("update:model-value", node);
      return true;
    });

    // revalidate if filters updated
    useWatchDeep(
      () => props.filters,
      () => validationTask.value.initialized && validationTask.value.run(nodeId.value),
    );

    useWatchDeep(nodeId, validationTask.value.run, { debounce: 250 });

    // update v-model:valid
    const valid = computed(() => {
      const { initialized, data } = validationTask.value;
      return initialized && data === true;
    });
    watch(valid, valid => ctx.emit("update:valid", valid), { immediate: true });

    return { nodeId, validationTask };
  },
};
</script>
