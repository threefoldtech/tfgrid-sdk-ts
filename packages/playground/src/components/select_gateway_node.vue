<template>
  <input-validator
    :value="$props.modelValue?.id"
    :rules="[validators.required('Gateway node is required.')]"
    #="{ props }"
  >
    <input-tooltip
      tooltip="Creates a subdomain for your instance on the selected domain to be able to access your instance from the browser."
    >
      <v-autocomplete
        label="Select gateway"
        placeholder="Please select a domain."
        :items="items"
        item-title="domain"
        return-object
        v-bind="{
          ...props,
          error: items.length == 0 ? false : props.error,
          errorMessages: items.length == 0 ? undefined : props.errorMessages,
        }"
        @update:model-value="$emit('update:model-value', $event)"
        :loading="items.length === 0 && loading"
        :disabled="items.length === 0 && loading"
        :model-value="$props.modelValue"
      >
        <template v-slot:append-item v-if="page !== -1">
          <div class="px-4 mt-4">
            <v-btn
              block
              color="secondary"
              variant="tonal"
              rounded="large"
              size="large"
              @click="loadNextPage"
              :loading="loading"
            >
              Load More Gateway Nodes
            </v-btn>
          </div>
        </template>
      </v-autocomplete>
    </input-tooltip>
  </input-validator>
</template>

<script lang="ts" setup>
import type { FilterOptions } from "@threefold/grid_client";
import { onMounted, type Ref, ref, watch } from "vue";

import { useProfileManager } from "../stores";
import type { GatewayNode } from "../types";
import type { Farm } from "../types";
import { loadGatewayNodes } from "../utils/gateway";
import { getGrid } from "../utils/grid";

const props = defineProps<{ modelValue?: GatewayNode; farmData?: Farm; customDomain?: boolean }>();
const emits = defineEmits<{ (event: "update:model-value", value: GatewayNode | undefined): void }>();

const profileManager = useProfileManager();

const loading = ref(false);
const items = ref<any[]>([]);
const page = ref(1);
const size = 50;
const test = 0;

onMounted(loadNextPage);
type gatewayFilters = Omit<FilterOptions, "gateway">;

watch(
  () => props.farmData,
  () => {
    page.value = 1;
    items.value = [];
    loadNextPage();
  },
);
async function loadNextPage() {
  loading.value = true;
  const grid = await getGrid(profileManager.profile!);
  let nodes = [];
  const options: gatewayFilters = {
    page: page.value++,
    size,
    farmId: props.customDomain ? props.farmData?.farmID : undefined,
  };
  nodes = await loadGatewayNodes(grid!, options);

  if (!nodes.length && props.customDomain && props.farmData?.country) {
    console.log("Nearest in same country");
    options.farmId = undefined;
    options.country = props.farmData.country;
    nodes = await loadGatewayNodes(grid!, options);
  }
  if (!nodes.length && props.customDomain) {
    console.log("Network");
    options.country = options.farmId = undefined;
    nodes = await loadGatewayNodes(grid!, options);
  }

  if (nodes.length === 0 || nodes.length < size) {
    page.value = -1;
  }

  items.value = items.value.concat(nodes.map(normalizeGatewayNode));
  loading.value = false;

  if (!items.value.length) {
    emits("update:model-value", undefined);
  }
}

function normalizeGatewayNode(item: any): GatewayNode {
  return {
    id: +item.nodeId,
    domain: item.publicConfig.domain,
    ip: item.publicConfig.ipv4,
  };
}
</script>

<script lang="ts">
export default {
  name: "SelectGatewayNode",
};
</script>
