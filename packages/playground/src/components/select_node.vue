<template>
  <section>
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

    <v-alert v-if="filtersUpdated" type="warning" variant="tonal" class="text-warning mb-2 variant-tonal">
      Please press on <strong>Load Nodes</strong> button to list nodes matching your new requirements.
    </v-alert>

    <input-validator
      ref="validator"
      :rules="[validators.required('Node id is required.')]"
      :async-rules="[() => validateNodeStoragePool(selectedNode)]"
      :value="selectedNode"
      #="{ props }"
      v-if="selection == Selection.AUTOMATED"
    >
      <input-tooltip tooltip="Select a node ID to deploy on.">
        <div class="w-100 d-flex">
          <v-autocomplete
            select
            label="Node"
            :items="availableNodes"
            item-title="nodeId"
            return-object
            v-model="selectedNode"
            :disabled="loadingNodes || pingingNode || filtersUpdated || $props.loadingFarm"
            v-bind="{
              ...props,
              loading: props.loading || loadingNodes || pingingNode,
              hint: pingingNode ? `Checking if the disks will fit in the node's storage pools... ` : props.hint,
              error: _isLoading ? false : !!errorMessage || props.error,
              errorMessages: _isLoading ? undefined : errorMessage || props.errorMessages,
            }"
          >
            <template v-slot:item="{ item, props }">
              <v-list-item @click="props.onClick" :class="{ 'v-list-item--active': props.isActive }">
                <v-list-item-content class="d-flex justify-space-between">
                  <v-list-item-title>
                    {{ item.raw.nodeId }}
                  </v-list-item-title>
                  <div>
                    <v-chip
                      v-if="item.raw.certified === 'Certified'"
                      v-bind="props"
                      :color="getChipColor(item.raw.certified)"
                      class="ml-3"
                    >
                      {{ item.raw.certified }}
                    </v-chip>
                    <v-chip v-bind="props" :color="getChipColor(item.raw.state)" class="ml-3">
                      {{ item.raw.state }}
                    </v-chip>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-autocomplete>
          <v-btn
            class="ml-2 mt-2"
            variant="tonal"
            color="info"
            :loading="loadingNodes || pingingNode"
            :disabled="$props.loadingFarm || loadingNodes || pingingNode"
            @click="loadNodes"
          >
            Load Nodes
          </v-btn>
        </div>
      </input-tooltip>
    </input-validator>
    <input-validator
      v-else-if="selection == Selection.MANUAL"
      :value="manualselectedNode"
      ref="manualField"
      :rules="[
        validators.required('Node ID is required.'),
        validators.isInt('Node ID must be a valid number.'),
        validators.min('Node ID must be a valid number.', 1),
      ]"
      :async-rules="[() => validateManualSelectedNode(manualselectedNode)]"
      #="{ props }"
      :debounce-time="1000"
    >
      <v-text-field
        label="Node ID"
        type="number"
        v-model.number="manualselectedNode"
        :disabled="loadingNodes"
        v-bind="{
          ...props,
          loading: props.loading || loadingNodes,
          error: props.error,
          hint: pingingNode ? `Validating Node` : props.hint,
        }"
      />
    </input-validator>

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
  </section>
</template>

<script lang="ts" setup>
import type { NodeInfo, NodeResources } from "@threefold/grid_client";
import equals from "lodash/fp/equals.js";
import { computed, onBeforeUnmount, onMounted, type PropType, ref, watch } from "vue";

import { ValidatorStatus } from "@/hooks/form_validator";
import { Selection } from "@/utils/types";

import { useProfileManager } from "../stores/profile_manager";
import type { FarmInterface } from "../types";
import { getFilteredNodes, getNodeCards, type INode, type NodeGPUCardType } from "../utils/filter_nodes";
import { getGrid } from "../utils/grid";
import { getCardName, normalizeError } from "../utils/helpers";
import { useFarm } from "./select_farm_manager.vue";
import { defaultCountry, defaultRegion } from "./select_location.vue";

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
  country?: string;
  region?: string;
}

const emits = defineEmits<{
  (event: "update:modelValue", value?: INode): void;
  (event: "update:loading", value?: boolean): void;
}>();

const props = defineProps({
  selection: String,
  modelValue: { type: Object as PropType<INode> },
  loadingFarm: { type: Boolean, required: true },
  filters: { default: () => ({} as NodeFilters), type: Object as PropType<NodeFilters> },
  rootFileSystemSize: { type: Number, required: true },
});
const farmManager = useFarm();
const profileManager = useProfileManager();
const availableNodes = ref<Array<INode>>([]);
const nodesArr = ref<Array<INode>>([]);
const loadingNodes = ref(false);
const loadingCards = ref(false);
const errorMessage = ref<string>();
const manualselectedNode = ref<number>();
const selectedNode = ref<INode | undefined>();
const selectedCards = ref<Array<string>>([]);
const nodeCards = ref<Array<NodeGPUCardType>>([]);
const cards: NodeGPUCardType[] = [];
const emptyResult = ref(false);
const validator = ref();
const manualField = ref();
const pingingNode = ref(false);

const farm = ref<FarmInterface>();
const unsubscribe = farmManager.subscribe(f => (farm.value = f));
onBeforeUnmount(unsubscribe);

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
    emits("update:modelValue", {
      nodeId: selectedNode.value.nodeId,
      cards: cards,
      certified: selectedNode.value.certified,
    });
  }
});

watch(
  () => selectedNode.value,
  async node => {
    const grid = await getGrid(profileManager.profile!);
    if (node && grid) {
      if (props.selection === Selection.AUTOMATED) {
        await validateNodeStoragePool(node);
      }
    }

    if (node) {
      baseFilters.value = props.filters;
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

const baseFilters = ref();
const filtersUpdated = ref(false);
watch(
  () => props.filters,
  value => {
    if (!baseFilters.value) {
      baseFilters.value = value;
    }

    filtersUpdated.value = !equals(value, baseFilters.value);
    validator.value?.setStatus(
      filtersUpdated.value || !selectedNode.value ? ValidatorStatus.Init : ValidatorStatus.Valid,
    );
  },
  { deep: true },
);

onMounted(() => {
  baseFilters.value = undefined;
  loadNodes();
});

watch(
  () => props.filters,
  async (value, oldValue) => {
    if (equals(value, oldValue)) {
      return;
    }

    if (props.selection === Selection.MANUAL && manualselectedNode.value) {
      manualField.value?.validate();
    }
  },
  { deep: true },
);

watch(
  () => props.selection,
  async (value, oldValue) => {
    errorMessage.value = undefined;
    if (value !== oldValue) {
      selectedNode.value = undefined;
      manualselectedNode.value = undefined;
    }
  },
  { deep: false },
);

function getChipColor(item: any) {
  return item === "Dedicated" ? "success" : item === "Certified" ? "primary" : "secondary";
}
function validateSelectedNodeFilters(
  validatingNodeId: number,
  node: NodeInfo,
  freeResources: NodeResources | undefined,
  filters: NodeFilters,
) {
  const twinId = profileManager.profile?.twinId;

  const isNotRentingNode = node.rentedByTwinId !== twinId && node.rentedByTwinId !== 0;
  const isNotRentingDedicatedFarm = node.inDedicatedFarm && node.rentedByTwinId !== twinId;

  if (isNotRentingDedicatedFarm) {
    throw new Error(`Node ${validatingNodeId} belongs to a dedicated farm and is not rented by you`);
  } else if (isNotRentingNode) {
    throw new Error(`Node ${validatingNodeId} is rented by someone else`);
  } else if (filters.ipv4 && !node.publicConfig.ipv4) {
    throw new Error(`Node ${validatingNodeId} is not assigned to a PublicIP`);
  } else if (freeResources) {
    const { cru, mru, sru } = freeResources;
    const { cpu, memory } = filters;
    const diskSizes = [...filters.diskSizes, props.rootFileSystemSize];
    if (cru < cpu) {
      throw new Error(`Node ${validatingNodeId} doesn't have enough CPU`);
    } else if (mru < Math.ceil(_g2b(Math.round(memory / 1024)))) {
      throw new Error(`Node ${validatingNodeId} doesn't have enough Memory`);
    } else if (sru < Math.ceil(_g2b(diskSizes.reduce((total, disk) => total + disk)))) {
      throw new Error(`Node ${validatingNodeId} doesn't have enough Storage`);
    }
  }
}
function _g2b(GB: number): number {
  return GB * 1024 ** 3;
}

async function validateManualSelectedNode(validatingNodeId?: number) {
  if (!validatingNodeId) return;
  try {
    loadingNodes.value = true;
    const grid = await getGrid(profileManager.profile!);
    const filters = props.filters;
    const twinId = profileManager.profile?.twinId;
    const node = await grid?.capacity.nodes.getNode(validatingNodeId);
    if (node) {
      if (node.status == "down") {
        throw new Error(`Node ${validatingNodeId} is down`);
      }
      if (filters.certified && node.certificationType !== "Certified") {
        throw new Error(`Node ${validatingNodeId} is not Certified`);
      }
      if (filters.rentedBy && node.rentedByTwinId) {
        throw new Error(`Node ${validatingNodeId} is Dedicated, but rented by someone else`);
      }
      if (filters.rentedBy && node.rentedByTwinId !== twinId) {
        throw new Error(`Node ${validatingNodeId} is not Dedicated`);
      }
      const freeResources = await grid?.capacity.nodes.getNodeFreeResources(
        node.nodeId,
        "proxy",
        window.env.GRIDPROXY_URL,
      );
      validateSelectedNodeFilters(validatingNodeId, node, freeResources, filters);
    } else {
      throw new Error(`Node ${validatingNodeId} is not on the grid`);
    }
    selectedNode.value = { nodeId: Number(validatingNodeId), certified: node.certificationType };
    emits("update:modelValue", {
      nodeId: selectedNode.value.nodeId,
      cards: cards,
      certified: selectedNode.value?.certified,
    });
  } catch (e) {
    console.error(`An error occurred: ${e}`);
    return {
      message: normalizeError(
        e,
        "Something went wrong while checking status of the node. Please check your connection and try again.",
      ),
    };
  } finally {
    loadingNodes.value = false;
  }
  return undefined;
}
async function loadNodes() {
  if (props.selection === Selection.AUTOMATED) {
    baseFilters.value = undefined;
    filtersUpdated.value = false;
  }

  const { farmID = -1, country, region } = farm.value || {};
  const farmId = farmID > 0 ? farmID : undefined;
  availableNodes.value = [];
  const oldSelectedNode = selectedNode.value;
  selectedNode.value = undefined;
  loadingNodes.value = true;
  errorMessage.value = "";
  const filters = props.filters;
  farmManager?.setLoading(true);
  try {
    const grid = await getGrid(profileManager.profile!);
    if (grid) {
      const res = await getFilteredNodes(grid, {
        farmId,
        cpu: filters.cpu,
        memory: filters.memory,
        diskSizes: [...filters.diskSizes, props.rootFileSystemSize],
        ipv4: filters.ipv4,
        hasGPU: filters.hasGPU ? filters.hasGPU : undefined,
        certified: filters.certified,
        rentedBy: filters.rentedBy,
        availableFor: grid.twinId,
        country: country === defaultCountry ? undefined : country,
        region: region === defaultRegion ? undefined : region,
      });

      if (res) {
        nodesArr.value = [];
        for (const node of res) {
          if (!nodesArr.value.some(n => n.nodeId === node.nodeId)) {
            nodesArr.value.push({
              nodeId: node.nodeId,
              state: node.rentedByTwinId ? "Dedicated" : "Shared",
              certified: node.certificationType,
            });
          }
        }
        availableNodes.value = nodesArr.value;
      } else {
        availableNodes.value = [];
      }

      if (props.selection === Selection.AUTOMATED) {
        if (oldSelectedNode) {
          const index = availableNodes.value.findIndex(n => oldSelectedNode.nodeId === n.nodeId);

          if (index !== -1) {
            selectedNode.value = availableNodes.value[index];
          } else {
            validator.value?.setStatus(ValidatorStatus.Init);
          }
        } else {
          validator.value?.setStatus(ValidatorStatus.Init);
        }
      }
    }
  } catch (e) {
    const msg = (e as Error).message || (e as string) || "";

    if (msg.trim().toLowerCase().startsWith("validation failed")) {
      errorMessage.value = "Please provide valid data.";
      return;
    }

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
      certified: validatingNode?.certified,
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

const isLoading = computed(() => loadingNodes.value || pingingNode.value || validator.value?.status === ValidatorStatus.Pending); // prettier-ignore
const _isLoading = computed(() => isLoading.value || filtersUpdated.value || props.loadingFarm);

watch(isLoading, loading => farmManager?.setLoading(loading));
</script>

<script lang="ts">
export default {
  name: "SelectNode",
};
</script>

<style lang="scss">
.warning-hint-input .v-messages__message {
  color: rgb(var(--v-theme-warning)) !important;
}
</style>
