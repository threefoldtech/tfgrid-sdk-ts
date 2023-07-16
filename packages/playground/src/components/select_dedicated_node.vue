<template>
  <section>
    <h6 class="text-h5 mb-4">Select a node</h6>
    <v-alert class="mb-2" type="warning" variant="tonal" v-if="!loadingNodes && selectedNode === undefined">
      There are no nodes rented by you that match your selected resources, try to change your resources or rent a node
      and try again.
    </v-alert>

    <input-validator :rules="[validators.required('Node id is required.')]" :value="selectedNode" #="{ props }">
      <v-autocomplete
        select
        label="Node"
        :items="availableNodes"
        :model-value="selectedNode && selectedNode < 1 && availableNodes.length ? availableNodes[0] : selectedNode"
        :disabled="loadingNodes"
        :loading="loadingNodes"
        @update:model-value="selectedNode = $event"
        v-bind="props"
      >
        <template #selection="{ item }">
          <span>
            {{ item.value }}
          </span>
          <v-chip v-bind="props" color="success" class="ml-3">dedicated</v-chip>
        </template>
      </v-autocomplete>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref, watch } from "vue";

import { useProfileManager } from "../stores/profile_manager";
import { type Flist, ProjectName } from "../types";
import DedicatedNode, { type Node } from "../utils/filter_dedicated_node";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export interface DedicatedMachineFilters {
  ipv6: boolean;
  ipv4: boolean;
  wireguard: boolean;
  planetary: boolean;
  hasGPU: boolean;
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
  dedicated?: boolean;
}

const emits = defineEmits<{ (event: "update:modelValue", value?: Node): void }>();

const props = defineProps({
  modelValue: { type: Object as PropType<Node> },
  filters: { default: () => ({} as DedicatedMachineFilters), type: Object as PropType<DedicatedMachineFilters> },
});

const profileManager = useProfileManager();
const availableNodes = ref<Array<number>>([]);
const loadingNodes = ref(false);
const selectedNode = ref<number>();
const errorMessage = ref<string>();

watch(selectedNode, async () => {
  if (selectedNode.value) {
    emits("update:modelValue", { nodeId: selectedNode.value });
  }
});

watch(
  () => props.filters.ipv4,
  async () => {
    checkNode();
  },
);

onMounted(checkNode);

async function checkNode() {
  errorMessage.value = "";
  loadingNodes.value = true;
  const filters = props.filters;
  if (filters.dedicated) {
    const projectName = ProjectName.Fullvm.toLowerCase();
    const grid = await getGrid(profileManager.profile!, projectName);

    if (grid) {
      const filteredDNodes = new DedicatedNode(grid);
      filteredDNodes
        .getDedicatedNodes({
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
              dedicated: filters.dedicated,
            },
          ],
          network: { addAccess: filters.wireguard },
        })
        .then(res =>
          res.forEach(nodes => {
            if (nodes.length) {
              const node = nodes[0].nodeId;
              if (!availableNodes.value.includes(node)) {
                availableNodes.value.push(node);
                selectedNode.value = node;
              }
            } else {
              selectedNode.value = undefined;
              availableNodes.value = [];
            }
          }),
        )
        .catch(e => (errorMessage.value = normalizeError(e, "Failed to deploy a full virtual machine instance.")))
        .then(() => (loadingNodes.value = false));
    }
  }
}
</script>
