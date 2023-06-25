<template>
  <section>
    <h6 class="text-h5 mb-4">Select a node</h6>
    <v-alert class="mb-2" type="warning" variant="tonal" v-if="!loadingNodes && selectedNode === undefined">
      There are no nodes rented by you that match your selected resources, try to change your resources or rent a node
      and try again.
    </v-alert>

    <input-validator :rules="[validators.required('Node id is required.')]" :value="selectedNode" #="{ props }">
      <input-tooltip tooltip="The rented node id, this node should have GPUs.">
        <v-autocomplete
          select
          label="Node"
          :items="availableNodesWithGPU"
          :model-value="
            selectedNode && selectedNode < 1 && availableNodesWithGPU.length ? availableNodesWithGPU[0] : selectedNode
          "
          :disabled="loadingNodes"
          :loading="loadingNodes"
          @update:model-value="selectedNode = $event"
          v-bind="props"
        />
      </input-tooltip>
    </input-validator>

    <input-validator
      v-if="selectedNode"
      :rules="[
        validators.required('Please select at least one card.'),
        validators.min('Please select at least one card.', 1),
      ]"
      :value="selectedCards.length"
      #="{ props }"
    >
      <input-tooltip
        tooltip="Please select at least one card from the available GPU cards. Note that if you have a deployment that already uses certain cards, they will not appear in the selection area. You have the option to select one or more cards.."
      >
        <v-autocomplete
          select
          label="Node cards"
          :model-value="selectedCards"
          :items="nodeCards.map(card => card.vendor)"
          :disabled="loadingCards"
          :loading="loadingCards"
          multiple
          @update:model-value="selectedCards = $event"
          v-bind="props"
        />
      </input-tooltip>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, ref, watch } from "vue";

import GPUNode, { type GPUNodeType, type NodeGPUCardType } from "@/utils/filter_node_with_gpu";
import { normalizeError } from "@/utils/helpers";

import { useProfileManager } from "../stores/profile_manager";
import { type Flist, ProjectName } from "../types";
import { getGrid } from "../utils/grid";

export interface GPUMachineFilters {
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
}

const emits = defineEmits<{ (event: "update:modelValue", value?: GPUNodeType): void }>();

const props = defineProps({
  modelValue: { type: Object as PropType<GPUNodeType> },
  filters: { default: () => ({} as GPUMachineFilters), type: Object as PropType<GPUMachineFilters> },
});

const profileManager = useProfileManager();
const availableNodesWithGPU = ref<Array<number>>([]);
const loadingNodes = ref(false);
const loadingCards = ref(false);
const selectedNode = ref<number>();
const selectedCards = ref<Array<string>>([]);
const nodeCards = ref<Array<NodeGPUCardType>>([]);
const errorMessage = ref<string>();

watch(selectedCards, async () => {
  const cards: NodeGPUCardType[] = [];
  for (const card of nodeCards.value) {
    for (const selectedCard of selectedCards.value) {
      if (card.vendor === selectedCard && !cards.includes(card)) {
        cards.push(card);
      }
    }
  }
  if (selectedNode.value && selectedCards.value) {
    emits("update:modelValue", { nodeId: selectedNode.value, cards: cards });
  }
});

watch(selectedNode, async () => {
  loadingCards.value = true;
  const projectName = ProjectName.Fullvm.toLowerCase();
  const grid = await getGrid(profileManager.profile!, projectName);
  if (grid) {
    const gpuNodeHelper = new GPUNode(grid);
    if (selectedNode.value) {
      gpuNodeHelper.getNodeCards(selectedNode.value).then(res => {
        nodeCards.value = res.filter(card => card.contract === 0);
        loadingCards.value = false;
      });
    }
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
  if (filters.hasGPU) {
    const projectName = ProjectName.Fullvm.toLowerCase();
    const grid = await getGrid(profileManager.profile!, projectName);

    if (grid) {
      const gpuNodeHelper = new GPUNode(grid);
      gpuNodeHelper
        .getNodes({
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
            },
          ],
          network: { addAccess: filters.wireguard },
        })
        .then(res =>
          res.forEach(nodes => {
            if (nodes.length) {
              const node = nodes[0].nodeId;
              if (!availableNodesWithGPU.value.includes(node)) {
                availableNodesWithGPU.value.push(node);
                selectedNode.value = node;
              }
            } else {
              selectedNode.value = undefined; // To display the alert message only if the select area is touched, do not want to display the message on the mount.
              availableNodesWithGPU.value = [];
            }
          }),
        )
        .catch(e => (errorMessage.value = normalizeError(e, "Failed to deploy a full virtual machine instance.")))
        .then(() => (loadingNodes.value = false));
    }
  }
}
</script>
