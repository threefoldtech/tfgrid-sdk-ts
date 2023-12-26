<template>
  <!-- Error Alert -->
  <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="loadingErrorMessage">
    Error while listing contracts due: {{ loadingErrorMessage }}
  </v-alert>

  <!-- Contracts List Card -->
  <v-card variant="text" class="mb-4">
    <section class="d-flex align-center">
      <v-card-title class="font-weight-bold d-flex align-center title ma-0 pa-0"> Contracts List </v-card-title>
      <v-spacer />
      <v-btn prepend-icon="mdi-refresh" color="info" variant="outlined" :disabled="isLoading" @click="onMount">
        refresh
      </v-btn>
    </section>
  </v-card>

  <!-- Total Cost Card -->
  <v-card variant="tonal" :loading="totalCost === undefined" class="mb-3 bg-blue-primary-lighten-3">
    <template #title>
      <v-row>
        <v-col class="d-flex justify-start"> <p class="text-subtitle-1">Total cost of contracts</p> </v-col>
      </v-row>
    </template>
    <template #text>
      <strong v-if="totalCost != undefined" class="text-primary">
        <input-tooltip
          inline
          :alignCenter="true"
          :tooltip="`${totalCostUSD} USD/hour ≈ ${totalCostUSD === 0 ? 0 : (totalCostUSD! * 24 * 30).toFixed(3)} USD/month`"
        >
          {{ totalCost }} TFT/hour ≈ {{ totalCost === 0 ? 0 : (totalCost * 24 * 30).toFixed(3) }} TFT/month
        </input-tooltip>
      </strong>
      <small v-else> loading total cost... </small>
    </template>
  </v-card>

  <!-- Contracts Tables -->
  <v-expansion-panels v-model="panel" multiple>
    <v-expansion-panel class="mb-4" :elevation="3" v-for="(table, idx) of contractsTables" :key="idx">
      <v-expansion-panel-title color="primary" style="height: 50px !important; min-height: 15px !important">
        <v-icon size="24" class="pr-3">{{ table.icon }}</v-icon>
        <v-card-title class="pa-0 text-subtitle-1">
          <strong>{{ table.title }}</strong>
        </v-card-title>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <!-- Contracts Table Component -->
        <contracts-table
          :node-status="nodeStatus"
          :loading="table.loading"
          :contracts="table.contracts"
          :grid="table.grid"
          :contracts-type="table.type"
          :table-headers="table.headers"
          @update:deleted-contracts="onDeletedContracts"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import { Decimal } from "decimal.js";
import { computed, defineComponent, onMounted, type Ref, ref } from "vue";

import ContractsTable from "@/components/contracts_list/contracts_table.vue";
import { useProfileManager } from "@/stores/profile_manager";
import type { VDataTableHeader } from "@/types";
import {
  type ContractsTableType,
  ContractType,
  getNodeStatus,
  getUserContracts,
  type NormalizedContract,
} from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid } from "@/utils/grid";

import { queryClient } from "../clients";

const isLoading = ref<boolean>(false);
const profileManager = useProfileManager();
const grid = ref<GridClient>();

const contracts = ref<NormalizedContract[]>([]);
const nameContracts = ref<NormalizedContract[]>([]);
const nodeContracts = ref<NormalizedContract[]>([]);
const rentContracts = ref<NormalizedContract[]>([]);
const loadingErrorMessage = ref<string>();
const totalCost = ref<number>();
const totalCostUSD = ref<number>();

const panel = ref<number[]>([0, 1, 2]);
const nodeStatus = ref() as Ref<{ [x: number]: NodeStatus }>;

// Computed property to get unique node IDs from contracts
const nodeIDs = computed(() => {
  const allNodes = contracts.value.map(contract => contract.nodeId);
  return [...new Set(allNodes)];
});

onMounted(onMount);

async function onMount() {
  contracts.value = nameContracts.value = nodeContracts.value = rentContracts.value = [];
  isLoading.value = true;
  totalCost.value = undefined;
  totalCostUSD.value = undefined;
  loadingErrorMessage.value = undefined;

  if (profileManager.profile) {
    const _grid = await getGrid(profileManager.profile);
    if (_grid) {
      grid.value = _grid;
      try {
        // Fetch user contracts, node status, and calculate total cost
        contracts.value = await getUserContracts(grid.value);
        nodeContracts.value = contracts.value.filter(c => c.type === ContractType.NODE);
        nameContracts.value = contracts.value.filter(c => c.type === ContractType.NAME);
        rentContracts.value = contracts.value.filter(c => c.type === ContractType.RENT);
        nodeStatus.value = await getNodeStatus(nodeIDs.value);
        totalCost.value = getTotalCost(contracts.value);
        const TFTInUSD = await queryClient.tftPrice.get();
        totalCostUSD.value = totalCost.value / TFTInUSD;
      } catch (error: any) {
        // Handle errors and display toast messages
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

  // Update UI
  isLoading.value = false;
}

// Calculate the total cost of contracts
function getTotalCost(contracts: NormalizedContract[]) {
  totalCost.value = 0;
  for (const contract of contracts) {
    totalCost.value = +new Decimal(totalCost.value).add(contract.consumption);
  }
  return +totalCost.value.toFixed(3);
}

// Handle updates when contracts are deleted
function onDeletedContracts(_contracts: NormalizedContract[]) {
  contracts.value = _contracts;
  totalCost.value = undefined;
  totalCost.value = getTotalCost(contracts.value);
}

// Define base table headers for contracts tables
const baseTableHeaders: VDataTableHeader = [
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contractId" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Created At", key: "createdAt" },
];

// Define specific table headers for each contract type
const nodeTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false },
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

// Define contracts tables with their specific configurations
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
// Export the component definition
export default defineComponent({
  name: "TfContractsList",
  components: {},
});
</script>
