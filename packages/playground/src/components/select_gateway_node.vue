<template>
  <input-validator
    ref="validator"
    :value="$props.modelValue?.id"
    :rules="[validators.required('Domain is required.')]"
    #="{ props }"
  >
    <input-tooltip
      tooltip="Creates a subdomain for your instance on the selected domain to be able to access your instance from the browser."
    >
      <v-autocomplete
        label="Select domain"
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
              {{ loadMoreText }}
            </v-btn>
          </div>
        </template>
      </v-autocomplete>
    </input-tooltip>
  </input-validator>
</template>

<script lang="ts" setup>
import type { FilterOptions, GridClient } from "@threefold/grid_client";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { ValidatorStatus } from "@/hooks/form_validator";

import { useGrid } from "../stores";
import type { GatewayNode } from "../types";
import type { FarmInterface } from "../types";
import { loadGatewayNodes } from "../utils/gateway";

const props = defineProps<{
  modelValue?: GatewayNode;
  farmData?: FarmInterface;
  customDomain?: boolean;
  availableFor?: number;
}>();
const emits = defineEmits<{ (event: "update:model-value", value: GatewayNode | undefined): void }>();

const loading = ref(false);
const items = ref<any[]>([]);
const page = ref(1);
const size = 50;
const validator = ref();
const gatewayOption = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

onMounted(loadNextPage);
onUnmounted(() => emits("update:model-value", undefined));
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
  validator.value?.setStatus(ValidatorStatus.Init);
  let nodes = [];
  gatewayOption.value = "farm";
  const options: gatewayFilters = {
    page: page.value++,
    size,
    farmId: props.customDomain ? props.farmData?.farmID : undefined,
    availableFor: props.availableFor,
  };
  nodes = await loadGatewayNodes(grid!, options);

  if (!nodes.length && props.customDomain && props.farmData?.country) {
    gatewayOption.value = "country";
    options.farmId = undefined;
    options.country = props.farmData.country;
    nodes = await loadGatewayNodes(grid!, options); // search in the same country
    if (!nodes.length && props.customDomain) {
      gatewayOption.value = "Network";
      options.country = options.farmId = undefined;
      nodes = await loadGatewayNodes(grid!, options); // search in the whole network
    }
  }

  if (nodes.length === 0 || nodes.length < size) {
    page.value = -1;
  }

  items.value = items.value.concat(nodes.map(normalizeGatewayNode));
  const nodeExists = !!nodes.find(({ nodeId }) => nodeId == props.modelValue?.id);
  loading.value = false;

  if (props.modelValue && !nodeExists) emits("update:model-value", undefined);
  if (nodeExists) await validator.value?.validate();
}
defineExpose({ loading });
function normalizeGatewayNode(item: any): GatewayNode {
  return {
    id: +item.nodeId,
    domain: item.publicConfig.domain,
    ip: item.publicConfig.ipv4.split("/")[0],
  };
}

const loadMoreText = computed(() => {
  const farm = props.farmData;
  const base = "Load More Domains";

  if (farm) {
    if (gatewayOption.value === "farm") return `${base} in ${farm.name}`;
    if (gatewayOption.value === "country") return `${base} in ${farm.country}`;
  }

  return base;
});
</script>

<script lang="ts">
export default {
  name: "SelectGatewayNode",
};
</script>
