<template>
  <div>
    <TfNodeDetailsCard
      :selected-machines="selectedMachines.filter(m => m.nodeId === nodeId)"
      v-show="modelValue || placeholderNode"
      :key="modelValue?.rentedByTwinId"
      flat
      :node="modelValue || placeholderNode"
      @update:node="$emit('update:model-value', $event as any)"
      :status="
        validationTask.loading
          ? 'Pending'
          : validationTask.initialized
          ? validationTask.error
            ? 'Invalid'
            : 'Valid'
          : 'Init'
      "
    />

    <input-tooltip tooltip="Node ID to deploy on." align-center>
      <VTextField
        label="Node ID"
        placeholder="Add your desired node id to validate"
        class="w-100 mt-4"
        type="number"
        v-model.number="nodeId"
        :error="!!validationTask.error"
        :error-messages="validationTask.error || undefined"
        :disabled="!validFilters"
        :persistent-hint="
          (nodeId && !validationTask.initialized) ||
          !validFilters ||
          validationTask.loading ||
          (validationTask.initialized && validationTask.data === true)
        "
        :hint="
          !validFilters
            ? 'Please provide valid data.'
            : nodeId && !validationTask.initialized
            ? 'Preparing to validate node.'
            : validationTask.loading
            ? 'Validating node...'
            : validationTask.data
            ? `Node ${nodeId} is valid.`
            : undefined
        "
        @blur="validationTask.initialized ? undefined : validationTask.run(nodeId)"
      />
    </input-tooltip>
  </div>
</template>

<script lang="ts">
import type { NodeInfo } from "@threefold/grid_client";
import type AwaitLock from "await-lock";
import isInt from "validator/lib/isInt";
import { onUnmounted, type PropType, ref, watch } from "vue";

import { gridProxyClient } from "../../clients";
import { useAsync, useWatchDeep } from "../../hooks";
import { ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import type { SelectedMachine, SelectionDetailsFilters } from "../../types/nodeSelector";
import { normalizeError } from "../../utils/helpers";
import { checkNodeCapacityPool, release, resolveAsync, validateRentContract } from "../../utils/nodeSelector";
import TfNodeDetailsCard from "./TfNodeDetailsCard.vue";

const _defaultError =
  "Something went wrong while checking status of the node. Please check your connection and try again.";

export default {
  name: "TfManualNodeSelector",
  components: { TfNodeDetailsCard },
  props: {
    modelValue: Object as PropType<NodeInfo>,
    validFilters: { type: Boolean, required: true },
    filters: {
      type: Object as PropType<SelectionDetailsFilters>,
      required: true,
    },
    status: String as PropType<ValidatorStatus>,
    selectedMachines: {
      type: Array as PropType<SelectedMachine[]>,
      required: true,
    },
    nodesLock: Object as PropType<AwaitLock>,
  },
  emits: {
    "update:model-value": (node?: NodeInfo) => true || node,
    "update:status": (status: ValidatorStatus) => true || status,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const nodeId = ref<number>();

    // reset node to mark form as invalid
    const placeholderNode = ref<NodeInfo>();

    watch(nodeId, () => {
      bindModelValue();
      placeholderNode.value = undefined;
    });

    const validationTask = useAsync<true | string, string, [id: number | undefined]>(
      async nodeId => {
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

        placeholderNode.value = node;

        if (node === undefined || node === null) {
          throw `Node ${nodeId} is not on the grid`;
        }

        const [{ data: farms }, e1] = await resolveAsync(gridProxyClient.farms.list({ farmId: node.farmId }));
        if (e1) {
          throw normalizeError(e1, _defaultError);
        }

        if (farms.length === 0) {
          throw "Couldn't load farm data for that Node ID";
        }

        switch (true) {
          case node.status === "down":
            throw `Node ${nodeId} is down`;

          case props.filters.certified && node.certificationType.toLowerCase() !== "certified":
            throw `Node ${nodeId} is not Certified`;

          case props.filters.dedicated && !node.dedicated:
            throw `Node ${nodeId} is not dedicated`;

          case props.filters.dedicated && node.rentedByTwinId === 0:
            throw `Node ${nodeId} is not rented`;

          case props.filters.dedicated && node.rentedByTwinId !== gridStore.client.twinId:
            throw `Node ${nodeId} is Dedicated, but rented by someone else`;

          case node.rentedByTwinId !== 0 && node.rentedByTwinId !== gridStore.client.twinId:
            throw `Node ${nodeId} is rented by someone else`;

          case props.filters.ipv4 && farms[0].publicIps.every(p => p.contract_id !== 0):
            throw `Node ${nodeId} is not assigned to a PublicIP`;
        }

        const args = [nodeId, "proxy", gridStore.client.config.proxyURL] as const;
        const [resources, e2] = await resolveAsync(gridStore.client.capacity.nodes.getNodeFreeResources(...args));
        if (e2) {
          throw normalizeError(e2, _defaultError);
        }

        const { cru, mru, sru } = resources;
        const { ssdDisks = [], rootFilesystemSize = 0 } = props.filters;

        const machinesWithSameNode = props.selectedMachines.filter(machine => machine.nodeId === nodeId);
        let { cpu = 0, memory = 0, solutionDisk = 0 } = props.filters;

        cpu += machinesWithSameNode.reduce((res, machine) => res + machine.cpu, 0);
        memory += machinesWithSameNode.reduce((res, machine) => res + machine.memory, 0);
        solutionDisk += machinesWithSameNode.reduce((res, machine) => res + machine.disk, 0);

        const memorySize = memory / 1024;
        const requiredMru = Math.ceil(Math.round(memorySize) * 1024 ** 3);

        const diskSize = ssdDisks.reduce((t, d) => t + d, rootFilesystemSize + solutionDisk);
        const requiredDisk = Math.ceil(diskSize * 1024 ** 3);

        switch (true) {
          case cru < cpu:
            throw `Node ${nodeId} doesn't have enough CPU`;

          case mru < requiredMru:
            throw `Node ${nodeId} doesn't have enough Memory`;

          case sru < requiredDisk:
            throw `Node ${nodeId} doesn't have enough Storage`;
        }

        await validateRentContract(gridStore, node);
        await checkNodeCapacityPool(gridStore, node, props.filters);

        bindModelValue(node);
        placeholderNode.value = undefined;

        return true;
      },
      {
        tries: 1,
        onReset: bindStatus,
        shouldRun: () => props.validFilters,
        async onBeforeTask() {
          await props.nodesLock?.acquireAsync();
          bindStatus(ValidatorStatus.Pending);
        },
        onAfterTask: ({ data }) => {
          bindStatus(data ? ValidatorStatus.Valid : ValidatorStatus.Invalid);
          release(props.nodesLock);
        },
      },
    );

    // reset validation to prevent form from being valid
    useWatchDeep(() => props.filters, validationTask.value.reset);
    useWatchDeep(nodeId, validationTask.value.reset);
    useWatchDeep(
      () => props.selectedMachines.map(m => m.nodeId),
      () => nodeId.value && validationTask.value.run(nodeId.value),
      { debounce: 1000 },
    );

    // revalidate if filters updated
    useWatchDeep(
      () => props.filters,
      () => nodeId.value && validationTask.value.run(nodeId.value),
      { debounce: 1000 },
    );

    useWatchDeep(nodeId, validationTask.value.run, { debounce: 1000 });
    useWatchDeep(
      () => props.validFilters,
      valid => !valid && validationTask.value.initialized && validationTask.value.reset(),
    );

    onUnmounted(() => {
      bindModelValue();
      bindStatus();
    });

    function bindModelValue(node?: NodeInfo): void {
      ctx.emit("update:model-value", node);
    }

    function bindStatus(status?: ValidatorStatus): void {
      ctx.emit("update:status", status || ValidatorStatus.Init);
    }

    return { nodeId, validationTask, placeholderNode };
  },
};
</script>
