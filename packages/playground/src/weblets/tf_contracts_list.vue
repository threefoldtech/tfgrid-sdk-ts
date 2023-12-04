<template>
  <weblet-layout :class="'mt-0 pt-0'" ref="layout" @mount="onMount">
    <template #title>Contracts List</template>

    <!-- Error Alert -->
    <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="loadingErrorMessage">
      Error while listing contracts due: {{ loadingErrorMessage }}
    </v-alert>

    <template #header-actions="{ hasProfile }">
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        class="mt-3"
        :disabled="isLoading || !hasProfile"
        @click="onMount"
      >
        refresh
      </v-btn>
    </template>

    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel class="mb-4" :elevation="3" v-for="(table, idx) of contractsTables" :key="idx">
        <v-expansion-panel-title color="primary">
          <v-icon size="30" class="pr-3">{{ table.icon }}</v-icon>
          <v-card-title class="pa-0">{{ table.title }}</v-card-title>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <contracts-table
            :node-status="nodeStatus"
            :loading="table.loading"
            :contracts="table.contracts"
            :grid="table.grid"
            :contracts-type="table.type"
            :table-headers="table.headers"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import { computed, defineComponent, type Ref, ref } from "vue";

import ContractsTable from "@/components/contracts_list/contracts_table.vue";
import { useProfileManager } from "@/stores/profile_manager";
import type { VDataTableHeader } from "@/types";
import { type ContractsTableType, ContractType, getNodeStatus, getUserContracts } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid } from "@/utils/grid";

const isLoading = ref<boolean>(false);
const profileManager = useProfileManager();
const grid = ref<GridClient>();

const contracts = ref<any[]>([]);
const nameContracts = ref<any[]>([]);
const nodeContracts = ref<any[]>([]);
const rentContracts = ref<any[]>([]);
const loadingErrorMessage = ref<string>();

const panel = ref<number[]>([0, 1]);
const nodeStatus = ref() as Ref<{ [x: number]: NodeStatus }>;

const nodeIDs = computed(() => {
  const allNodes = contracts.value.map(contract => contract.nodeId);
  return [...new Set(allNodes)];
});

async function onMount() {
  isLoading.value = true;
  loadingErrorMessage.value = undefined;
  if (profileManager.profile) {
    const _grid = await getGrid(profileManager.profile);
    if (_grid) {
      grid.value = _grid;
      try {
        contracts.value = await getUserContracts(grid.value);
        nodeContracts.value = contracts.value.filter(c => c.type === ContractType.NODE);
        nameContracts.value = contracts.value.filter(c => c.type === ContractType.NAME);
        rentContracts.value = contracts.value.filter(c => c.type === ContractType.RENT);
        nodeStatus.value = await getNodeStatus(nodeIDs.value);
      } catch (error: any) {
        loadingErrorMessage.value = error.message;
        createCustomToast(`Error while listing contracts due: ${error.message}`, ToastType.danger, {});
      }
    } else {
      loadingErrorMessage.value = "Failed to initialize an instance of grid type.";
      createCustomToast("Failed to initialize an instance of grid type.", ToastType.danger, {});
    }
  } else {
    loadingErrorMessage.value =
      "Failed to initialize an instance of the profile manager, please make sure that you have a stable connection.";
    createCustomToast(
      "Failed to initialize an instance of the profile manager, please make sure that you have a stable connection.",
      ToastType.danger,
      {},
    );
  }
  isLoading.value = false;
}

const baseTableHeaders: VDataTableHeader = [
  // Add any field that may be used in all of the tables here.
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contractId" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Created At", key: "createdAt" },
];

const nodeTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false }, // Should be always last item.
];

const nameTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Solution Name", key: "solutionName" },
  { title: "Expiration", key: "expiration" },
  { title: "Details", key: "actions", sortable: false },
];

const RentTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Node ID", key: "nodeId" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false },
];

const contractsTables: ContractsTableType[] = [
  {
    headers: nodeTableHeaders,
    type: ContractType.NODE,
    contracts: nodeContracts,
    icon: "mdi-file",
    title: "Node Contracts",
    grid: grid,
    loading: isLoading,
  },
  {
    headers: nameTableHeaders,
    type: ContractType.NAME,
    contracts: nameContracts,
    icon: "mdi-note-edit-outline",
    title: "Name Contracts",
    grid: grid,
    loading: isLoading,
  },
  {
    headers: RentTableHeaders,
    type: ContractType.RENT,
    contracts: rentContracts,
    icon: "mdi-newspaper-variant",
    title: "Rent Contracts",
    grid: grid,
    loading: isLoading,
  },
];
</script>

<script lang="ts">
export default defineComponent({
  name: "TfContractsList",
  components: {},
});
</script>
