<template>
  <!-- Error Alert -->
  <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="loadingErrorMessage">
    Error while listing contracts due: {{ loadingErrorMessage }}
  </v-alert>

  <v-alert type="success" variant="tonal" class="mt-2 mb-4" v-if="loadingTablesMessage">
    {{ loadingTablesMessage }}
  </v-alert>

  <!-- Contracts List Card -->
  <v-card variant="text" class="mb-4">
    <section class="d-flex align-center">
      <v-card-title class="font-weight-bold d-flex align-center title ma-0 pa-0"> Contracts List </v-card-title>
      <v-spacer />
      <v-btn
        v-if="lockedContracts?.totalAmountLocked && !isLoading"
        class="mr-2"
        color="warning"
        @click="openUnlockDialog"
        :loading="unlockContractLoading"
      >
        Unlock All
      </v-btn>
      <v-btn
        prepend-icon="mdi-refresh"
        color="info"
        @click="
          contractsTable.forEach(t => t.reset());
          loadContracts();
        "
        :disabled="totalCost === undefined"
      >
        refresh
      </v-btn>
    </section>
  </v-card>

  <!-- Total Cost Card -->
  <v-card :loading="totalCost === undefined" variant="tonal" class="mb-3 mt-5 bg-blue-primary-lighten-3">
    <template #title>
      <v-row>
        <v-col class="d-flex justify-start">
          <p class="text-subtitle-1">Total cost of contracts</p>
        </v-col>
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
        <v-container>
          <v-row v-if="loadingLockDetails" class="d-flex flex-column justify-center align-center py-4">
            <v-progress-circular indeterminate />
            <div class="text-subtitle-2 pt-2">Loading contracts lock details</div>
          </v-row>
          <v-row class="d-flex" v-else>
            <v-alert class="ma-4" type="warning" variant="tonal">
              <div v-if="lockedContracts?.totalAmountLocked < freeBalance" class="font-weigh-black">
                You have enough balance to unlock your contracts!
              </div>
              <div v-else>
                You need to fund your account with
                <span class="font-weight-black">
                  {{ Math.ceil(lockedContracts?.totalAmountLocked - freeBalance) }}
                  TFTs
                </span>
                to resume your contracts
              </div>
            </v-alert>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-end my-1 mr-2">
        <v-btn color="anchor" @click="unlockDialog = false"> Close </v-btn>
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
          :count="table.count"
          :page="table.page"
          :size="table.size"
          @update:unlock-contracts="loadContracts"
          @update:deleted-contracts="onDeletedContracts"
          @update:lock-details="getContractsLockDetails"
          @update:page="
            newPage => {
              table.page.value = newPage;
              loadContracts(table.type);
            }
          "
          @update:size="
            newSize => {
              table.size.value = newSize;
              loadContracts(table.type);
            }
          "
          @update:sort="
            sort => {
              loadContracts(table.type, { sort });
            }
          "
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import type { GridClient, LockContracts } from "@threefold/grid_client";
import { type Contract, ContractState, NodeStatus } from "@threefold/gridproxy_client";
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
  normalizeContract,
  type NormalizedContract,
} from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { manual } from "@/utils/manual";

import { gridProxyClient, queryClient } from "../clients";
import { useGrid } from "../stores";

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
const loadingTablesMessage = ref<string>();

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
  return [...new Set(contracts.value.map(contract => contract.details.nodeId) || [])];
});
// To avoid multiple requests
const cachedNodeIDs = ref<number[]>([]);

onMounted(loadContracts);

async function _normalizeContracts(
  contracts: Contract[],
  contractType: ContractType.Node | ContractType.Name | ContractType.Rent,
): Promise<NormalizedContract[]> {
  const normalizedContracts = await Promise.all(
    contracts.map(async contract => {
      try {
        return await normalizeContract(grid, contract, contractType);
      } catch (error) {
        loadingErrorMessage.value = `Error normalizing contract: ${error}`;
        throw new Error(loadingErrorMessage.value);
      }
    }),
  );
  return normalizedContracts.filter(Boolean) as NormalizedContract[];
}

async function loadContractsByType(
  contractType: ContractType.Node | ContractType.Name | ContractType.Rent,
  contractsRef: Ref<NormalizedContract[]>,
  options?: { sort: { key: string; order: "asc" | "desc" }[] },
) {
  const table = contractsTables.find(table => table.type === contractType);
  if (!table) {
    loadingErrorMessage.value = `No table found for contract type: ${contractType}`;
    throw new Error(loadingErrorMessage.value);
  }

  table.loading.value = true;
  try {
    const response = await gridProxyClient.contracts.list({
      twinId: profileManager.profile!.twinId,
      state: [ContractState.Created, ContractState.GracePeriod],
      size: table.size.value,
      page: table.page.value,
      type: contractType,
      retCount: true,
    });

    table.count.value = response.count ?? 0;
    const normalizedContracts = await _normalizeContracts(response.data, contractType);

    if (options && options.sort.length) {
      contractsRef.value = sortContracts(normalizedContracts, options.sort);
    }

    contractsRef.value = normalizedContracts;
  } catch (error: any) {
    loadingErrorMessage.value = `Error while listing ${contractType} contracts: ${error.message}`;
    createCustomToast(loadingErrorMessage.value, ToastType.danger, {});
  } finally {
    table.loading.value = false;
  }
}

function sortContracts(
  contracts: NormalizedContract[],
  sort: { key: string; order: "asc" | "desc" }[],
): NormalizedContract[] {
  const sortKey = sort[0].key;
  const sortOrder = sort[0].order;

  contracts = contracts.sort((a, b) => {
    const aValue = Reflect.get(a, sortKey) ?? Reflect.get(a.details, sortKey);
    const bValue = Reflect.get(b, sortKey) ?? Reflect.get(b.details, sortKey);
    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });
  return contracts;
}

async function loadContracts(type?: ContractType, options?: { sort: { key: string; order: "asc" | "desc" }[] }) {
  totalCost.value = undefined;
  totalCostUSD.value = undefined;
  loadingErrorMessage.value = undefined;
  loadingTablesMessage.value = undefined;
  nodeInfo.value = {};
  contracts.value = [];
  cachedNodeIDs.value = [];

  try {
    if (type) {
      switch (type) {
        case ContractType.Name:
          await loadContractsByType(ContractType.Name, nameContracts, options);
          break;
        case ContractType.Node:
          await loadContractsByType(ContractType.Node, nodeContracts, options);
          break;
        case ContractType.Rent:
          await loadContractsByType(ContractType.Rent, rentContracts, options);
          break;
      }
    } else {
      await Promise.all([
        loadContractsByType(ContractType.Name, nameContracts, options),
        loadContractsByType(ContractType.Node, nodeContracts, options),
        loadContractsByType(ContractType.Rent, rentContracts, options),
      ]);
    }

    contracts.value = [...nodeContracts.value, ...nameContracts.value, ...rentContracts.value];

    // Update the total cost of the contracts.
    await getTotalCost();
    // Get the node info e.g. node status.
    nodeInfo.value = await getNodeInfo(nodeIDs.value, cachedNodeIDs.value);
    cachedNodeIDs.value.push(...nodeIDs.value);
  } catch (error: any) {
    loadingErrorMessage.value = `Error while loading contracts: ${error.message}`;
    createCustomToast(loadingErrorMessage.value, ToastType.danger, {});
  }
}

async function openUnlockDialog() {
  loadingLockDetails.value = true;
  unlockDialog.value = true;
  try {
    await getContractsLockDetails();
    await profileManagerController.reloadBalance();
  } catch (e) {
    loadingErrorMessage.value = `Failed to get contracts lock details`;
    createCustomToast(loadingErrorMessage.value, ToastType.danger, {});
  } finally {
    loadingLockDetails.value = false;
  }
}

async function unlockAllContracts() {
  try {
    unlockContractLoading.value = true;
    await grid.contracts.unlockMyContracts();
    loadingTablesMessage.value =
      "Your request to unlock your contracts has been processed successfully. Changes may take a few minutes to reflect";
    createCustomToast(loadingTablesMessage.value, ToastType.info);
    setTimeout(() => {
      loadContracts();
      loadingTablesMessage.value = undefined;
    }, 30000);
    unlockDialog.value = false;
  } catch (e) {
    loadingErrorMessage.value = `Failed to unlock contract your contracts`;
    createCustomToast(loadingErrorMessage.value, ToastType.danger, {});
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
async function getTotalCost() {
  totalCost.value = 0;
  for (const contract of contracts.value) {
    totalCost.value = +new Decimal(totalCost.value).add(contract.consumption?.valueOf() || 0);
  }
  totalCost.value = +totalCost.value.toFixed(3);
  const TFTInUSD = await queryClient.tftPrice.get();
  totalCostUSD.value = totalCost.value * (TFTInUSD / 1000);
}

// Handle updates when contracts are deleted
async function onDeletedContracts(_contracts: NormalizedContract[]) {
  if (_contracts.length) {
    switch (_contracts[0].type) {
      case ContractType.Name:
        nameContracts.value = _contracts;
        break;
      case ContractType.Rent:
        rentContracts.value = _contracts;
        break;
      case ContractType.Node:
        nodeContracts.value = _contracts;
        break;
    }
  }
  loadingTablesMessage.value =
    "The contracts have been successfully deleted. Please note that all tables will be reloaded in 30 seconds.";
  createCustomToast(loadingTablesMessage.value, ToastType.info);
  setTimeout(() => {
    loadContracts();
    loadingTablesMessage.value = undefined;
  }, 30000);
  await getTotalCost();
  contracts.value = [...rentContracts.value, ...nameContracts.value, ...nodeContracts.value];
  totalCost.value = undefined;
}
async function getContractsLockDetails() {
  lockedContracts.value = await grid.contracts.getContractsLockDetails();
}

// Define base table headers for contracts tables
const baseTableHeaders: VDataTableHeader = [
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contract_id" },
  { title: "State", key: "state", sortable: false },
  { title: "Billing Rate", key: "consumption" },
  { title: "Created At", key: "created_at" },
];

// Define specific table headers for each contract type
const nodeTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  {
    title: "Solution",
    key: "solution",
    sortable: false,
    children: [
      { title: "Type", key: "solutionType", sortable: false },
      { title: "Name", key: "solutionName", sortable: false },
    ],
  },
  { title: "Type", key: "deploymentType", sortable: false },
  { title: "Expiration", key: "expiration" },
  { title: "Farm ID", key: "farm_id" },
  {
    title: "Node",
    key: "node",
    sortable: false,
    children: [
      { title: "ID", key: "nodeId" },
      { title: "Status", key: "nodeStatus", sortable: false },
    ],
  },
  { title: "Details", key: "actions", sortable: false },
];

const nameTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Solution Name", key: "solutionName", sortable: false },
  { title: "Expiration", key: "expiration" },
  { title: "Details", key: "actions", sortable: false },
];

const RentTableHeaders: VDataTableHeader = [
  ...baseTableHeaders,
  { title: "Farm ID", key: "farm_id" },
  {
    title: "Node",
    key: "node",
    sortable: false,
    children: [
      { title: "ID", key: "nodeId" },
      { title: "Status", key: "nodeStatus", sortable: false },
    ],
  },
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
    loading: ref(false),
    count: ref(0),
    page: ref(1),
    size: ref(5),
  },
  {
    headers: nameTableHeaders,
    type: ContractType.Name,
    contracts: nameContracts,
    icon: "mdi-note-edit-outline",
    title: "Name Contracts",
    grid: grid,
    loading: ref(false),
    count: ref(0),
    page: ref(1),
    size: ref(5),
  },
  {
    headers: RentTableHeaders,
    type: ContractType.Rent,
    contracts: rentContracts,
    icon: "mdi-newspaper-variant",
    title: "Rent Contracts",
    grid: grid,
    loading: ref(false),
    count: ref(0),
    page: ref(1),
    size: ref(5),
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
