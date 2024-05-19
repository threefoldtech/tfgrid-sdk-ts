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
      <v-btn
        prepend-icon="mdi-refresh"
        color="info"
        variant="outlined"
        :disabled="isLoadingNode && isLoadingName && isLoadingRent"
        @click="onMount"
      >
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
          :tooltip="`${totalCostUSD?.toFixed(3)} USD/hour ≈ ${totalCostUSD === 0 ? 0 : (totalCostUSD! * 24 * 30).toFixed(3)} USD/month`"
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
          :count="table.count"
          :page="page"
          :size="size"
          @update:options="loadContracts"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { ContractState, NodeStatus } from "@threefold/gridproxy_client";
import { Decimal } from "decimal.js";
import { computed, defineComponent, onMounted, type Ref, ref } from "vue";

import ContractsTable from "@/components/contracts_list/contracts_table.vue";
import { useProfileManager } from "@/stores/profile_manager";
import type { VDataTableHeader } from "@/types";
import {
  type ContractsTableType,
  ContractType,
  getNodeInfo,
  normalizeContract,
  type NormalizedContract,
} from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { gridProxyClient, queryClient } from "../clients";
import { useGrid } from "../stores";
import { updateGrid } from "../utils/grid";

const isLoadingNode = ref<boolean>(false);
const isLoadingName = ref<boolean>(false);
const isLoadingRent = ref<boolean>(false);

const profileManager = useProfileManager();
const gridStore = useGrid();
const grid = gridStore.client as GridClient;
const contracts = ref<NormalizedContract[]>([]);
const nameContracts = ref<NormalizedContract[]>([]);
const nodeContracts = ref<NormalizedContract[]>([]);
const rentContracts = ref<NormalizedContract[]>([]);
const allContracts = ref<NormalizedContract[]>([]);
const loadingErrorMessage = ref<string>();
const totalCost = ref<number>();
const totalCostUSD = ref<number>();
const page = ref<number>(1);
const size = ref<number>(5);
const nodesCount = ref<number>(0);
const rentsCount = ref<number>(0);
const namesCount = ref<number>(0);

const panel = ref<number[]>([0, 1, 2]);
const nodeInfo: Ref<{ [nodeId: number]: { status: NodeStatus; farmId: number } }> = ref({});

// Computed property to get unique node IDs from contracts
const nodeIDs = computed(() => {
  return [...new Set(allContracts.value.map(contract => contract.details.nodeId) || [])];
});

onMounted(onMount);

async function onMount() {
  contracts.value = nameContracts.value = nodeContracts.value = rentContracts.value = [];
  isLoadingNode.value = true;
  isLoadingName.value = true;
  isLoadingRent.value = true;

  totalCost.value = undefined;
  totalCostUSD.value = undefined;
  loadingErrorMessage.value = undefined;
  updateGrid(grid, { projectName: "" });

  if (profileManager.profile) {
    if (grid) {
      await loadContracts({ page: page.value, itemsPerPage: size.value, contractType: ContractType.Node });
      await loadContracts({ page: page.value, itemsPerPage: size.value, contractType: ContractType.Name });
      await loadContracts({ page: page.value, itemsPerPage: size.value, contractType: ContractType.Rent });
      // getting nodeStatus
      allContracts.value = [...nodeContracts.value, ...nameContracts.value, ...rentContracts.value];
      nodeInfo.value = await getNodeInfo(nodeIDs.value);

      // load all contracts for total cost
      const { data: dataContracts } = await gridProxyClient.contracts.list({
        twinId: profileManager.profile!.twinId,
        state: [ContractState.Created, ContractState.GracePeriod],
      });

      const normalizedContracts: NormalizedContract[] = [];
      for (const contract of dataContracts) {
        try {
          const normalizedContract = await normalizeContract(grid, contract, contract.type);
          normalizedContracts.push(normalizedContract);
        } catch (error) {
          console.error("Error normalizing contract:", error);
        }
      }
      contracts.value = normalizedContracts;
      totalCost.value = getTotalCost(contracts.value);
      const TFTInUSD = await queryClient.tftPrice.get();
      totalCostUSD.value = totalCost.value * (TFTInUSD / 1000);
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
  isLoadingNode.value = false;
  isLoadingName.value = false;
  isLoadingRent.value = false;
}

async function loadContracts(options: { page: number; itemsPerPage: number; contractType: ContractType }) {
  if (options.contractType == ContractType.Node) {
    isLoadingNode.value = true;
  } else if (options.contractType == ContractType.Name) {
    isLoadingName.value = true;
  } else {
    isLoadingRent.value = true;
  }

  try {
    const { count, data: dataContracts } = await gridProxyClient.contracts.list({
      twinId: profileManager.profile!.twinId,
      state: [ContractState.Created, ContractState.GracePeriod],
      size: options.itemsPerPage,
      page: options.page,
      type: options.contractType,
      retCount: true,
    });

    const normalizedContracts: NormalizedContract[] = [];
    for (const contract of dataContracts) {
      try {
        const normalizedContract = await normalizeContract(grid, contract, options.contractType);
        normalizedContracts.push(normalizedContract);
      } catch (error) {
        console.error("Error normalizing contract:", error);
      }
    }

    if (options.contractType == ContractType.Node) {
      nodeContracts.value = normalizedContracts;
      nodesCount.value = count ?? 0;
    } else if (options.contractType == ContractType.Name) {
      nameContracts.value = normalizedContracts;
      namesCount.value = count ?? 0;
    } else {
      rentContracts.value = normalizedContracts;
      rentsCount.value = count ?? 0;
    }
    nodeInfo.value = await getNodeInfo(normalizedContracts.map(contract => contract.details.nodeId));
  } catch (error: any) {
    // Handle errors and display toast messages
    loadingErrorMessage.value = error.message;
    createCustomToast(`Error while listing contracts due: ${error.message}`, ToastType.danger, {});
  } finally {
    isLoadingNode.value = false;
    isLoadingName.value = false;
    isLoadingRent.value = false;
  }
}

const nodeStatus = computed(() => {
  const statusObject: { [x: number]: NodeStatus } = {};
  for (const nodeId in nodeInfo.value) {
    if (Object.prototype.hasOwnProperty.call(nodeInfo.value, nodeId)) {
      statusObject[nodeId] = nodeInfo.value[nodeId].status;
    }
  }
  return statusObject;
});

// Calculate the total cost of contracts
function getTotalCost(contracts: NormalizedContract[]) {
  totalCost.value = 0;
  for (const contract of contracts) {
    totalCost.value = +new Decimal(totalCost.value).add(contract.consumption?.valueOf() || 0);
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
  { title: "ID", key: "contract_id" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Created At", key: "created_at" },
];

// Define specific table headers for each contract type
const nodeTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Type", key: "deploymentType" },
  { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Farm ID", key: "farm_id" },
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
  { title: "Farm ID", key: "farm_id" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false },
];

// Define contracts tables with their specific configurations
const contractsTables: ContractsTableType[] = [
  {
    headers: nodeTableHeaders,
    type: ContractType.Node,
    contracts: nodeContracts,
    icon: "mdi-file",
    title: "Node Contracts",
    grid: grid,
    loading: isLoadingNode,
    count: nodesCount,
    page: page,
  },
  {
    headers: nameTableHeaders,
    type: ContractType.Name,
    contracts: nameContracts,
    icon: "mdi-note-edit-outline",
    title: "Name Contracts",
    grid: grid,
    loading: isLoadingName,
    count: namesCount,
    page: page,
  },
  {
    headers: RentTableHeaders,
    type: ContractType.Rent,
    contracts: rentContracts,
    icon: "mdi-newspaper-variant",
    title: "Rent Contracts",
    grid: grid,
    loading: isLoadingRent,
    count: rentsCount,
    page: page,
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
