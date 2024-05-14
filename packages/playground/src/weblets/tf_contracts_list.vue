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
        v-if="lockedContracts?.totalAmountLocked && !isLoading"
        class="mr-2"
        variant="outlined"
        color="warning"
        @click="openUnlockDialog"
        :loading="unlockContractLoading"
      >
        Unlock All
      </v-btn>
      <v-btn
        prepend-icon="mdi-refresh"
        color="info"
        variant="outlined"
        :disabled="isLoading"
        @click="
          contractsTable.forEach(t => t.reset());
          onMount();
        "
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
  <!-- locked amount Dialog -->
  <v-dialog width="500" v-model="unlockDialog" v-if="lockedContracts?.totalAmountLocked">
    <v-card>
      <v-card-title class="bg-primary">
        Unlock All Contracts
        <v-tooltip text="Grace period contracts documentation" location="bottom right">
          <template #activator="{ props }">
            <v-btn
              @click.stop
              v-bind="props"
              color="white"
              variant="text"
              icon="mdi-information-outline"
              height="24px"
              width="24px"
              target="_blank"
              :href="manual.contract_locking"
            />
          </template>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <v-row v-if="loadingLockDetails" class="d-flex flex-column justify-center align-center py-4">
          <v-progress-circular indeterminate />
          <div class="text-subtitle-2 pt-2">Loading contracts lock details</div>
        </v-row>
        <v-row class="d-flex" v-else>
          <v-alert v-if="lockedContracts?.totalAmountLocked < freeBalance" class="ma-4" type="success" variant="tonal">
            <div class="font-weigh-black">You have enough balance to unlock your contracts!</div></v-alert
          >
          <v-alert v-else class="ma-4" type="warning" variant="tonal">
            <div>
              You need to fund your account with
              <span class="font-weight-black">
                {{ Math.ceil(lockedContracts?.totalAmountLocked - freeBalance) }} TFTs
              </span>
              to resume your contracts
            </div>
          </v-alert>
        </v-row>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="anchor" class="mr-2 px-3" @click="unlockDialog = false"> Close </v-btn>
          <v-tooltip
            :text="
              freeBalance < lockedContracts?.totalAmountLocked
                ? `You don't have enough balance to unlock your contracts`
                : `Get your contracts ready again`
            "
            location="top center"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-btn
                  :disabled="freeBalance < lockedContracts.totalAmountLocked || loadingLockDetails"
                  variant="outlined"
                  color="warning"
                  @click="unlockAllContracts"
                  :loading="unlockContractLoading"
                >
                  Unlock contracts
                </v-btn>
              </div>
            </template>
          </v-tooltip>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
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
          ref="contractsTable"
          :node-status="nodeStatus"
          :loading="table.loading"
          :contracts="table.contracts"
          :locked-contracts="lockedContracts !== undefined ? lockedContracts[`${table.type}Contracts`] : {}"
          :grid="table.grid"
          :contracts-type="table.type"
          :table-headers="table.headers"
          @update:deleted-contracts="onDeletedContracts"
          @update:unlock-contracts="onMount"
          @update:lock-details="getContractsLockDetails"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import type { GridClient, LockContracts } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import { Decimal } from "decimal.js";
import { computed, defineComponent, onMounted, type Ref, ref } from "vue";

import ContractsTable from "@/components/contracts_list/contracts_table.vue";
import { useProfileManagerController } from "@/components/profile_manager_controller.vue";
import { useProfileManager } from "@/stores/profile_manager";
import type { VDataTableHeader } from "@/types";
import {
  type ContractsTableType,
  ContractType,
  getNodeInfo,
  getUserContracts,
  type NormalizedContract,
} from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { manual } from "@/utils/manual";

import { queryClient } from "../clients";
import { useGrid } from "../stores";
import { updateGrid } from "../utils/grid";

const profileManagerController = useProfileManagerController();
const balance = profileManagerController.balance;
const freeBalance = computed(() => balance.value?.free ?? 0 - (balance.value?.locked ?? 0));
const isLoading = ref<boolean>(false);
const profileManager = useProfileManager();
const gridStore = useGrid();
const grid = gridStore.client as GridClient;
const contracts = ref<NormalizedContract[]>([]);
const nameContracts = ref<NormalizedContract[]>([]);
const nodeContracts = ref<NormalizedContract[]>([]);
const rentContracts = ref<NormalizedContract[]>([]);
const loadingErrorMessage = ref<string>();
const totalCost = ref<number>();
const totalCostUSD = ref<number>();
const lockedContracts = ref<LockContracts>();
const unlockDialog = ref<boolean>(false);
const panel = ref<number[]>([0, 1, 2]);
const nodeInfo: Ref<{ [nodeId: number]: { status: NodeStatus; farmId: number } }> = ref({});
const unlockContractLoading = ref<boolean>(false);
const contractsTable = ref<(typeof ContractsTable)[]>([]);
const loadingLockDetails = ref(false);
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
  updateGrid(grid, { projectName: "" });

  if (profileManager.profile) {
    if (grid) {
      try {
        // Fetch user contracts, node status, and calculate total cost
        contracts.value = await getUserContracts(grid);
        nodeInfo.value = await getNodeInfo(nodeIDs.value);
        contracts.value.map(contract => {
          const { nodeId } = contract;
          if (nodeId && nodeInfo.value[nodeId]) {
            contract.farmId = nodeInfo.value[nodeId].farmId;
          }
          return contract;
        });
        await getContractsLockDetails();

        nodeContracts.value = contracts.value.filter(c => c.type === ContractType.NODE);
        nameContracts.value = contracts.value.filter(c => c.type === ContractType.NAME);
        rentContracts.value = contracts.value.filter(c => c.type === ContractType.RENT);
        totalCost.value = getTotalCost(contracts.value);
        const TFTInUSD = await queryClient.tftPrice.get();
        totalCostUSD.value = totalCost.value * (TFTInUSD / 1000);
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

async function openUnlockDialog() {
  loadingLockDetails.value = true;
  unlockDialog.value = true;
  try {
    await getContractsLockDetails();
  } catch (e) {
    createCustomToast(`Failed to get contracts lock details`, ToastType.danger);
    console.error(e);
  } finally {
    loadingLockDetails.value = false;
  }
}

async function unlockAllContracts() {
  try {
    unlockContractLoading.value = true;
    await grid.contracts.unlockMyContracts();
    createCustomToast(
      `your request to unlock contract your contracts has been processed successfully, Changes may take few minuets to reflect`,
      ToastType.info,
    );
    setTimeout(() => onMount(), 30000);
    unlockDialog.value = false;
  } catch (e) {
    createCustomToast(`Failed to unlock contract your contracts`, ToastType.danger);
    console.error(e);
  } finally {
    unlockContractLoading.value = false;
    unlockDialog.value = false;
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
async function getContractsLockDetails() {
  lockedContracts.value = await grid.contracts.getContractsLockDetails();
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
  { title: "Type", key: "deploymentType" },
  { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Farm ID", key: "farmId" },
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
  { title: "Farm ID", key: "farmId" },
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
