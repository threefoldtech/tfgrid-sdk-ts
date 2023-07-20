<template>
  <section>
    <h6 class="text-h5 mb-4">Select a Node</h6>
    <v-alert class="mb-2" type="warning" variant="tonal" v-if="!loadingNodes && selectedNode === undefined">
      There are no nodes rented by you that match your selected resources, try to change your resources or rent a node
      and try again.
    </v-alert>
    <input-validator :rules="[validators.required('Node id is required.')]" :value="selectedNode" #="{ props }">
      <input-tooltip tooltip="Select Node ID to deploy on.">
        <v-autocomplete
          select
          label="Node"
          :items="availableNodes"
          item-title="nodeId"
          v-model="selectedNode"
          @update:model-value="selectedNode = $event"
          :disabled="loadingNodes"
          :loading="loadingNodes"
          v-bind="{
            ...props,
            loading: props.loading || loadingNodes,
            error: false,
            errorMessages: undefined,
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
      </input-tooltip>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, type PropType, type Ref, ref, watch } from "vue";

import { useProfileManager } from "../stores/profile_manager";
import { getFilteredNodes, type Node } from "../utils/filter_nodes";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export interface NodeFilters {
  farmId?: number;
  ipv6?: boolean;
  ipv4?: boolean;
  hasGPU?: boolean;
  cpu: number;
  memory: number;
  disks: {
    name?: string | undefined;
    size: number;
    mountPoint: string;
  }[];
  certified?: boolean;
  rentedBy?: number;
  type?: string;
}

const emits = defineEmits<{ (event: "update:modelValue", value?: number): void }>();

const props = defineProps({
  modelValue: { type: Number },
  filters: { default: () => ({} as NodeFilters), type: Object as PropType<NodeFilters> },
});

const profileManager = useProfileManager();
const availableNodes = ref<Array<Node>>([]);
const nodesArr = ref<Array<Node>>([]);
const loadingNodes = ref(false);
const errorMessage = ref<string>();
const selectedNode = ref() as Ref<number | undefined>;

onMounted(loadNodes);

watch(
  () => selectedNode.value,
  node => {
    if (node) {
      emits("update:modelValue", node as number);
    }
  },
  { immediate: true },
);

const shouldBeUpdated = ref(false);
watch(
  () => ({ ...props.filters }),
  (value, oldValue) => {
    if (
      value.farmId === oldValue.farmId &&
      value.cpu === oldValue.cpu &&
      value.memory === oldValue.memory &&
      value.ipv4 === oldValue.ipv4 &&
      value.ipv6 === oldValue.ipv6 &&
      value.certified === oldValue.certified &&
      value.rentedBy === oldValue.rentedBy &&
      value.type === oldValue.type
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

async function loadNodes() {
  nodesArr.value = [];
  errorMessage.value = "";
  loadingNodes.value = true;
  const filters = props.filters;

  const grid = await getGrid(profileManager.profile!);
  if (grid) {
    try {
      const res = await getFilteredNodes(grid, {
        farmId: filters.farmId,
        cpu: filters.cpu,
        memory: filters.memory,
        disks: [...filters.disks],
        ipv4: filters.ipv4,
        hasGPU: filters.hasGPU,
        certified: filters.certified,
        rentedBy: filters.rentedBy,
      });

      if (!filters?.farmId || res?.length === 0) {
        selectedNode.value = undefined;
        return;
      }

      if (res) {
        for (const node of res) {
          if (!nodesArr.value.some(n => n.nodeId === node.nodeId)) {
            nodesArr.value.push({ nodeId: node.nodeId, state: node.rentedByTwinId ? "Dedicated" : "Shared" });
          }
        }
        availableNodes.value = nodesArr.value;
        selectedNode.value = availableNodes.value ? availableNodes.value[0].nodeId : undefined;
      } else {
        selectedNode.value = undefined;
        availableNodes.value = [];
      }
    } catch (e) {
      errorMessage.value = normalizeError(e, "Something went wrong while deploying.");
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
