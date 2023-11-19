<template>
  <section>
    <h6 class="text-h5 mb-4">Select a Node</h6>
    <v-alert
      class="mb-2"
      type="warning"
      variant="tonal"
      v-if="
        !loadingNodes && selectedNode === undefined && emptyResult && props.filters.rentedBy && !props.filters.farmId
      "
    >
      You have no rented nodes that match your selected resources. Please try changing your selected resources or rent a
      node that matches your requirements.
    </v-alert>
    <input-validator
      ref="validator"
      :rules="[validators.required('Node id is required.')]"
      :async-rules="[() => validateNodeStoragePool(selectedNode)]"
      :value="selectedNode"
      #="{ props }"
    >
      <input-tooltip tooltip="Select a node ID to deploy on.">
        <v-autocomplete
          v-if="selection == 'automated'"
          select
          label="Node"
          :items="availableNodes"
          item-title="nodeId"
          return-object
          v-model="selectedNode"
          :disabled="loadingNodes || pingingNode"
          v-bind="{
            ...props,
            loading: props.loading || loadingNodes || pingingNode,
            hint: pingingNode ? `Checking if the disks will fit in the node's storage pools... ` : props.hint,
            error: !!errorMessage || props.error,
            errorMessages: errorMessage || props.errorMessages,
          }"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item @click="props.onClick" :class="{ 'v-list-item--active': props.isActive }">
              <v-list-item-content class="d-flex justify-space-between">
                <v-list-item-title>
                  {{ item.raw.nodeId }}
                </v-list-item-title>
                <v-chip v-bind="props" :color="getChipColor(item.raw.state)" class="ml-3">
                  {{ item.raw.state }}
                </v-chip>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-autocomplete>
        <v-text-field
          v-else-if="selection == 'manual'"
          label="Name"
          v-model.number="ManualselectedNode"
          :disabled="loadingNodes"
          v-bind="{
            ...props,
            loading: props.loading,
            error: !!errorMessage,
            errorMessages: !!errorMessage ? errorMessage : undefined,
          }"
        />
      </input-tooltip>
      <input-validator
        v-if="selectedNode && filters.hasGPU"
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
            :items="nodeCards?.map(card => getCardName(card))"
            :disabled="loadingCards"
            multiple
            @update:model-value="selectedCards = $event"
            v-bind="{ ...props, loading: props.loading || loadingCards }"
          />
        </input-tooltip>
      </input-validator>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import type { FilterOptions } from "@threefold/grid_client";
import { type PropType, type Ref, ref, watch } from "vue";

import { ValidatorStatus } from "@/hooks/form_validator";

import { useProfileManager } from "../stores/profile_manager";
import { getFilteredNodes, getNodeCards, type INode, type NodeGPUCardType } from "../utils/filter_nodes";
import { getGrid } from "../utils/grid";
import { getCardName, normalizeError } from "../utils/helpers";
import { useFarm } from "./select_farm_manager.vue";

export interface NodeFilters {
  farmId?: number;
  ipv6?: boolean;
  ipv4?: boolean;
  hasGPU?: boolean;
  cpu: number;
  memory: number;
  diskSizes: number[];
  certified?: boolean;
  rentedBy?: number;
  type?: string;
  availableFor?: number;
}

const emits = defineEmits<{ (event: "update:modelValue", value?: INode): void }>();

const props = defineProps({
  selection: String,
  modelValue: { type: Object as PropType<INode> },
  filters: { default: () => ({} as NodeFilters), type: Object as PropType<NodeFilters> },
  rootFileSystemSize: { type: Number, required: true },
});
const farmManager = useFarm();
const profileManager = useProfileManager();
const availableNodes = ref<Array<INode>>([]);
const nodesArr = ref<Array<INode>>([]);
const loadingNodes = ref(false);
const loadingCards = ref(false);
const shouldBeUpdated = ref(false);
const errorMessage = ref<string>();
const ManualselectedNode = ref();
const selectedNode = ref<INode | undefined>();
const selectedCards = ref<Array<string>>([]);
const nodeCards = ref<Array<NodeGPUCardType>>([]);
const cards: NodeGPUCardType[] = [];
const emptyResult = ref(false);
const validator = ref();
const pingingNode = ref(false);
const delay = ref();

function isSelectionEmpty(node: INode | undefined, selectedCards: string[]): boolean {
  if (!node || availableNodes.value.length === 0) {
    return true;
  }

  const selectedNodeMatches = availableNodes.value.some(n => n.nodeId === node.nodeId);

  if (selectedNodeMatches && selectedCards.length > 0) {
    return !selectedCards.some(selectedCard => cards.some(card => getCardName(card) === selectedCard));
  }

  return !selectedNodeMatches;
}
// GPU CArds
watch(selectedCards, async () => {
  for (const card of nodeCards.value) {
    for (const selectedCard of selectedCards.value) {
      if (getCardName(card) === selectedCard && !cards.includes(card)) {
        cards.push(card);
      }
    }
  }
  if (selectedNode.value && selectedCards.value) {
    emits("update:modelValue", { nodeId: selectedNode.value.nodeId, cards: cards });
  }
});

watch(
  () => selectedNode.value,
  async node => {
    errorMessage.value = ``;

    const grid = await getGrid(profileManager.profile!);
    if (node && grid) {
      if (props.selection === "automated") {
        await validateNodeStoragePool(node);
      } else {
        await checkRentedNode();
      }
    }

    if (node && props.filters.hasGPU) {
      loadingCards.value = true;
      const grid = await getGrid(profileManager.profile!);
      if (grid) {
        const cards = await getNodeCards(grid, node.nodeId);
        nodeCards.value = cards?.filter(card => card.contract === 0);
        loadingCards.value = false;
      }
    }
    emptyResult.value = isSelectionEmpty(node, selectedCards.value);
  },
  { immediate: true },
);

watch(
  () => ({ ...props.filters }),
  (value, oldValue) => {
    if (
      value.farmId === oldValue.farmId &&
      value.diskSizes === oldValue.diskSizes &&
      value.cpu === oldValue.cpu &&
      value.memory === oldValue.memory &&
      value.certified === oldValue.certified &&
      value.rentedBy === oldValue.rentedBy &&
      value.hasGPU === oldValue.hasGPU
    )
      return;
    shouldBeUpdated.value = true;
  },
  { deep: false },
);

watch(
  () => props.selection,
  async (value, oldValue) => {
    if (value === "automated") {
      selectedNode.value = undefined;
    }
    ManualselectedNode.value = undefined;
  },
  { deep: false },
);

watch(
  () => ManualselectedNode.value,
  async (value, oldValue) => {
    if (value != undefined || value != null) {
      // workaround for checking for available nodes
      // const grid = await getGrid(profileManager.profile!);
      // if (grid) {
      //   const filters: FilterOptions = {
      //     nodeId: value,
      //   };
      //   const nodes = await grid.capacity.filterNodes(filters);
      //   console.log("nodes", nodes);
      // }

      selectedNode.value = { nodeId: Number(value) };
      // checkRentedNode();
    }
  },
  { deep: false },
);
watch([loadingNodes, shouldBeUpdated], async ([l, s]) => {
  if (l || !s) return;
  shouldBeUpdated.value = false;
  if (props.selection === "automated") {
    console.log("automated");
    farmManager?.subscribe(farmId => {
      if (!farmId) {
        selectedNode.value = undefined;
        availableNodes.value = [];
        return;
      }
      clearTimeout(delay.value);
      delay.value = setTimeout(() => {
        loadNodes(farmId);
      }, 1000);
    });
  }
});

function getChipColor(item: any) {
  return item === "Dedicated" ? "success" : "secondary";
}
async function checkRentedNode() {
  const grid = await getGrid(profileManager.profile!);
  const filters = props.filters;
  errorMessage.value = ``;
  loadingNodes.value = true;
  const node = await grid?.capacity.nodes.getNode(Number(ManualselectedNode.value));
  if (node) {
    const gridproxy = window.env.GRIDPROXY_URL;
    const diskSizes = [...filters.diskSizes, props.rootFileSystemSize];

    const freeresources = await grid?.capacity.nodes.getNodeFreeResources(node.nodeId, "proxy", gridproxy);
    console.log("Free resources: ", freeresources);
    if (node.rentedByTwinId !== profileManager.profile?.twinId && node.rentedByTwinId !== 0) {
      errorMessage.value = `Node ${ManualselectedNode.value} is rented by someone else`;
    } else if (filters.ipv4 && !node.publicConfig.ipv4) {
      errorMessage.value = `Node ${ManualselectedNode.value} is not assigned to a public ip`;
    } else if (freeresources && freeresources.cru < filters.cpu) {
      errorMessage.value = `Node ${ManualselectedNode.value} doesn't have enough cpu`;
    } else if (freeresources && freeresources.mru < Math.round(filters.memory / 1024)) {
      errorMessage.value = `Node ${ManualselectedNode.value} doesn't have enough memory`;
    } else if (freeresources && freeresources.sru < filters.diskSizes.reduce((total, disk) => total + disk)) {
      errorMessage.value = `Node ${ManualselectedNode.value} doesn't have enough sru`;
    }
  } else {
    errorMessage.value = `Node ${ManualselectedNode.value} is not on the grid`;
  }
  loadingNodes.value = false;
  pingingNode.value = false;
}

async function loadNodes(farmId: number | undefined) {
  availableNodes.value = [];
  selectedNode.value = undefined;
  loadingNodes.value = true;
  errorMessage.value = "";
  const filters = props.filters;
  farmManager?.setLoading(true);
  try {
    const grid = await getGrid(profileManager.profile!);
    if (grid) {
      const res = await getFilteredNodes(grid, {
        farmId: farmId,
        cpu: filters.cpu,
        memory: filters.memory,
        diskSizes: [...filters.diskSizes, props.rootFileSystemSize],
        ipv4: filters.ipv4,
        hasGPU: filters.hasGPU ? filters.hasGPU : undefined,
        certified: filters.certified,
        rentedBy: filters.rentedBy,
        availableFor: grid.twinId,
      });

      if (res?.length === 0) {
        selectedNode.value = undefined;
        emptyResult.value = true;
        loadingNodes.value = false;
        return;
      }

      if (res) {
        nodesArr.value = [];
        for (const node of res) {
          if (!nodesArr.value.some(n => n.nodeId === node.nodeId)) {
            nodesArr.value.push({
              nodeId: node.nodeId,
              state: node.rentedByTwinId ? "Dedicated" : "Shared",
            });
          }
        }
        availableNodes.value = nodesArr.value;
      } else {
        availableNodes.value = [];
      }
    }
  } catch (e) {
    errorMessage.value = normalizeError(e, "Something went wrong while fetching nodes.");
  } finally {
    validator.value?.setStatus(ValidatorStatus.Init);
    loadingNodes.value = false;
    farmManager?.setLoading(false);
  }
}

async function validateNodeStoragePool(validatingNode: INode | undefined) {
  if (!validatingNode) return { message: "Node id is required." };
  farmManager?.setLoading(true);
  validator.value?.setStatus(ValidatorStatus.Pending);
  pingingNode.value = true;
  try {
    const grid = await getGrid(profileManager.profile!);
    if (!grid) throw new Error("Connection issue please try again");

    loadingNodes.value = true;
    await grid.capacity.checkNodeCapacityPool({
      nodeId: validatingNode.nodeId,
      ssdDisks: props.filters.diskSizes.map(disk => disk * 1024 ** 3),
      rootfsDisks: [props.rootFileSystemSize * 1024 ** 3],
      hddDisks: [],
    });
    emits("update:modelValue", {
      nodeId: validatingNode.nodeId,
      cards: cards,
    });
  } catch (e) {
    availableNodes.value = availableNodes.value.filter(node => node.nodeId !== validatingNode.nodeId);
    validator.value?.setStatus(ValidatorStatus.Invalid);
    emptyResult.value = true;

    if (e?.toString().includes("Cannot fit the required SSD disk with size")) {
      return {
        message: `Although node ${validatingNode.nodeId} appears to have sufficient storage capacity for your workload, it lacks a single internal partition capable of accommodating it. Please select a different node.`,
      };
    } else {
      return {
        message: "Something went wrong while checking status of the node. Please check your connection and try again.",
      };
    }
  } finally {
    loadingNodes.value = false;
    pingingNode.value = false;
    farmManager?.setLoading(false);
  }
}
</script>

<script lang="ts">
export default {
  name: "SelectNode",
};
</script>
