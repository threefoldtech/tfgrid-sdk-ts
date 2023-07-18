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
        item-title="id"
        v-model="selectedNode"
        :disabled="loadingNodes"
        :loading="loadingNodes"
        v-bind="props"
      >
        <template v-slot:item="{ item, props }">
          <v-list-item @click="props.onClick" :class="{ 'v-list-item--active': props.isActive }">
            <v-list-item-content class="d-flex justify-space-between">
              <v-list-item-title>
                {{ item.raw.id }}
              </v-list-item-title>
              <v-chip v-bind="props" :color="getChipColor(item.raw.state)" class="ml-3">
                {{ item.raw.state }}
              </v-chip>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-autocomplete>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, type Ref, ref, watch } from "vue";

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
const errorMessage = ref<string>();
const selectedNode = ref() as Ref<AvailableNode | undefined>;

watch(
  () => selectedNode.value,
  node => {
    if (node) {
      emits("update:modelValue", { nodeId: node.id as unknown as number });
    }
  },
  { immediate: true },
);

const shouldBeUpdated = ref(false);
watch(
  () => ({ ...props.filters }),
  (value, oldValue) => {
    if (
      value.cpu === oldValue.cpu &&
      value.memory === oldValue.memory &&
      value.ssd === oldValue.ssd &&
      value.disk === oldValue.disk &&
      value.ipv4 === oldValue.ipv4 &&
      value.ipv6 === oldValue.ipv6 &&
      value.certified === oldValue.certified &&
      value.rentedBy === oldValue.rentedBy
    )
      return;
    loadNodes();
    shouldBeUpdated.value = true;
  },
);

watch([loadingNodes, shouldBeUpdated], async ([l, s]) => {
  if (l || !s) return;
  shouldBeUpdated.value = false;
  await loadNodes();
});

function getChipColor(item: any) {
  return item === "Dedicated" ? "success" : "secondary";
}
onMounted(loadNodes);

async function loadNodes() {
  availableNodes.value = [];
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
            certified: filters.certified,
            rentedBy: filters.rentedBy,
          },
        ],
        network: { addAccess: filters.wireguard },
      });
      const nodes = res[0];
      if (nodes) {
        for (const node of nodes) {
          if (!availableNodes.value.some(n => n.id === node.nodeId)) {
            availableNodes.value.push({ id: node.nodeId, state: node.rentedByTwinId ? "Dedicated" : "Shared" });
          }
        }
        selectedNode.value = availableNodes.value ? availableNodes.value[0] : undefined;
      } else {
        selectedNode.value = undefined;
        availableNodes.value = [];
      }
    } catch (e) {
      errorMessage.value = normalizeError(e, "Failed to deploy.");
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
