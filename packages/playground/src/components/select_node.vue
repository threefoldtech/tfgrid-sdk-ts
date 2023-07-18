<template>
  <section>
    <h6 class="text-h5 mb-4">Select a Node</h6>
    <v-alert class="mb-2" type="warning" variant="tonal" v-if="!loadingNodes && selectedNode === undefined">
      There are no nodes rented by you that match your selected resources, try to change your resources or rent a node
      and try again.
    </v-alert>
    <input-validator :rules="[validators.required('Node id is required.')]" :value="selectedNode?.id" #="{ props }">
      <v-autocomplete
        select
        label="Node"
        :items="availableNodes"
        :model-value="selectedNode?.id"
        :disabled="loadingNodes"
        :loading="loadingNodes"
        @update:model-value="selectedNode = $event"
        v-bind="props"
      >
        <template v-slot:item="{ item, props }">
          <v-list-item @click="props.onClick" :class="{ 'v-list-item--active': props.isActive }">
            <v-list-item-content class="d-flex justify-space-between">
              <v-list-item-title>
                {{ item.value.id }}
              </v-list-item-title>
              <v-chip v-bind="props" :color="getChipColor(item.value.state)" class="ml-3">
                {{ item.value.state }}
              </v-chip>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-autocomplete>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref, watch } from "vue";

import { useProfileManager } from "../stores/profile_manager";
import type { Flist } from "../types";
import FilteredNodes, { type Node } from "../utils/filter_nodes";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export interface MachineFilters {
  ipv6?: boolean;
  ipv4?: boolean;
  wireguard?: boolean;
  planetary?: boolean;
  hasGPU?: boolean;
  cpu: number;
  memory: number;
  ssd: number;
  flist?: Flist;
  name: string;
  disk: number;
  disks: {
    name?: string | undefined;
    size: number;
    mountPoint: string;
  }[];
  certified?: boolean;
  rentedBy?: number;
}

const emits = defineEmits<{ (event: "update:modelValue", value?: Node): void }>();

const props = defineProps({
  modelValue: { type: Object as PropType<Node> },
  filters: { default: () => ({} as MachineFilters), type: Object as PropType<MachineFilters> },
});

interface AvailableNode {
  id: number;
  state: string;
}
const profileManager = useProfileManager();
const availableNodes = ref<Array<AvailableNode>>([]);
const loadingNodes = ref(false);
const selectedNode = ref<{ id: number }>();
const errorMessage = ref<string>();

watch(selectedNode, async () => {
  if (selectedNode.value) {
    emits("update:modelValue", { nodeId: selectedNode.value.id });
  }
});

watch(
  () => props.filters.ipv4,
  async () => {
    checkNode();
  },
);

function getChipColor(item: any) {
  return item === "Dedicated" ? "success" : "secondary";
}
onMounted(checkNode);

async function checkNode() {
  errorMessage.value = "";
  loadingNodes.value = true;
  const filters = props.filters;
  const grid = await getGrid(profileManager.profile!);
  if (grid) {
    const filteredDNodes = new FilteredNodes(grid);
    try {
      const res = await filteredDNodes.getFilteredNodes({
        name: filters.name,
        machines: [
          {
            name: filters.name,
            cpu: filters.cpu,
            memory: filters.memory,
            flist: filters.flist!.value,
            entryPoint: filters.flist!.entryPoint,
            disks: [{ size: filters.disk, mountPoint: "/" }, ...filters.disks],
            publicIpv4: filters.ipv4,
            publicIpv6: filters.ipv6,
            planetary: filters.planetary,
            envs: [{ key: "SSH_KEY", value: profileManager.profile!.ssh }],
            rootFilesystemSize: 2,
            hasGPU: filters.hasGPU,
            rentedBy: filters.rentedBy,
          },
        ],
        network: { addAccess: filters.wireguard },
      });

      for (const nodes of res) {
        if (nodes.length) {
          for (const node of nodes) {
            selectedNode.value = { id: availableNodes.value[0].id };
            if (!availableNodes.value.some(n => n.id === node.nodeId)) {
              availableNodes.value.push({ id: node.nodeId, state: node.rentedByTwinId ? "Dedicated" : "Shared" });
            }
          }
        } else {
          selectedNode.value = undefined;
          availableNodes.value = [];
        }
      }
    } catch (e) {
      errorMessage.value = normalizeError(e, "Failed to deploy a full virtual machine instance.");
    } finally {
      loadingNodes.value = false;
    }
  }
}
</script>

<script lang="ts">
export default {
  name: "SelectNode",
};
</script>
