<template>
  <weblet-layout ref="layout" @mount="onMount">
    <template #title>Contracts List</template>

    <template #header-actions="{ hasProfile }">
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        :disabled="loading || deleting || !hasProfile"
        @click="onMount"
      >
        refresh
      </v-btn>
    </template>
    <ListTable
      :headers="headers"
      :items="contracts"
      :loading="loading"
      :deleting="deleting"
      v-model="selectedContracts"
      no-data-text="No contracts found on this account."
      v-bind:onClick:row="loading || deleting ? undefined : onClickRow"
    >
      <template #[`item.state`]="{ item }">
        <v-tooltip
          v-if="item && item.value.state === ContractStates.GracePeriod"
          :text="'Click here to check the amount of tokens needed to unlock your contract and resume your workload.'"
          location="top center"
        >
          <template #activator="{ props }">
            <v-chip
              @click.stop="contractLockDetails(item.value.contractId)"
              v-bind="props"
              :color="getStateColor(item.value.state)"
            >
              {{ item.value.state === ContractStates.GracePeriod ? "Grace Period" : item.value.state }}
            </v-chip>
          </template>
        </v-tooltip>
        <v-chip v-else :color="getStateColor(item.value.state)">
          {{ item.value.state }}
        </v-chip>
      </template>
      <template #[`item.type`]="{ item }">
        {{ capitalize(item.value.type) }}
      </template>
      <template #[`item.solutionType`]="{ item }">
        {{ solutionType[item.value.solutionType] ?? item.value.solutionType }}
      </template>
      <template #[`item.nodeStatus`]="{ item }">
        <v-chip
          v-if="item.value.nodeId !== '-' && !loading"
          :color="getNodeStateColor(nodeStatus[item.value.nodeId])"
          class="text-capitalize"
        >
          {{ nodeStatus[item.value.nodeId] }}
        </v-chip>
        <p v-else>-</p>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-tooltip :text="failedContractId == item.value.contractId ? 'Retry' : 'Show Details'">
          <template #activator="{ props }">
            <v-btn
              :color="failedContractId == item.value.contractId ? 'error' : ''"
              variant="tonal"
              @click="showDetails(item.value)"
              :disabled="(loading && loadingContractId !== item.value.contractId) || deleting"
              :loading="loadingContractId == item.value.contractId"
              v-bind="props"
            >
              <v-icon class="pt-1" v-if="failedContractId == item.value.contractId">mdi-refresh</v-icon>
              <v-icon v-else>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </ListTable>
    <div class="pt-4">
      <v-alert variant="tonal" color="secondary" class="pt-4" v-if="contracts.length && totalCost"
        >Total Cost: {{ totalCost }} TFT/hour ≈ {{ (totalCost * 24 * 30).toFixed(3) }} TFT/month</v-alert
      >
    </div>

    <template #footer-actions>
      <v-btn
        variant="outlined"
        color="error"
        prepend-icon="mdi-export-variant"
        :disabled="isExporting || contracts.length === 0"
        @click="exportData"
      >
        Export My Data
      </v-btn>
      <v-btn
        variant="outlined"
        color="error"
        :disabled="!selectedContracts.length || loading || deleting"
        prepend-icon="mdi-trash-can-outline"
        @click="deletingDialog = true"
      >
        Delete
      </v-btn>
    </template>
  </weblet-layout>
  <v-dialog width="70%" v-model="deletingDialog">
    <v-card>
      <v-card-title class="text-h5 mt-2"> Are you sure you want to delete the following contracts? </v-card-title>
      <v-alert class="ma-4" type="warning" variant="tonal"
        >It is advisable to remove the contract from its solution page, especially when multiple contracts may be linked
        to the same instance.</v-alert
      >
      <v-alert class="mx-4" type="warning" variant="tonal">Deleting contracts may take a while to complete.</v-alert>
      <v-card-text>
        <v-chip class="ma-1" color="primary" label v-for="c in selectedContracts" :key="c.contractId">
          {{ c.contractId }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="onDelete"> Delete </v-btn>
        <v-btn color="error" variant="tonal" @click="deletingDialog = false"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog width="70%" v-model="contractStateDialog">
    <v-card>
      <v-card-title class="text-h5">Contract lock Detalis</v-card-title>
      <v-card-text>
        <p v-if="loading" class="text-center">
          <strong>Loading The Locked Amount...</strong>
        </p>
        <p v-else class="text-center">
          Amount Locked <strong>{{ contractLocked?.amountLocked }} TFT</strong>
        </p>
        <br />
        <v-alert type="info" variant="tonal">
          The contract is in Grace Period, which means that your workloads are suspended but not deleted; in order to
          resume your workloads and restore their functionality, Please fund your account with the amount mentioned
          above.
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="tonal" @click="contractStateDialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar variant="tonal" color="error" v-model="snackbar" :timeout="5000">
    Failed to delete some keys, You don't have enough tokens
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ContractStates, type GridClient } from "@threefold/grid_client";
import { Decimal } from "decimal.js";
import { computed, type Ref, ref } from "vue";

import { useProfileManager } from "../stores";
import type { VDataTableHeader } from "../types";
import { getUserContracts, type NormalizedContract } from "../utils/contracts";
import { getGrid } from "../utils/grid";

const layout = ref();
const profileManager = useProfileManager();
const contracts = ref<NormalizedContract[]>([]);
const loading = ref(false);
const isExporting = ref(false);
const grid = ref<GridClient | null>();
const selectedContracts = ref<NormalizedContract[]>([]);
const nodeStatus = ref() as Ref<{ [x: number]: NodeStatus }>;
const totalCost = ref(0);
const headers: VDataTableHeader = [
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contractId" },
  { title: "Type", key: "type" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Created At", key: "createdAt" },
  { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false },
];

async function onMount() {
  selectedContracts.value = [];
  loading.value = true;
  failedContractId.value = undefined;
  contracts.value = [];
  grid.value = await getGrid(profileManager.profile!);
  contracts.value = await getUserContracts(grid.value!);
  totalCost.value = getTotalCost(contracts.value);
  nodeStatus.value = await getNodeStatus(nodeIDs.value);
  loading.value = false;
}

const nodeIDs = computed(() => {
  const allNodes = contracts.value.map(contract => contract.nodeId);
  return [...new Set(allNodes)];
});

const loadingContractId = ref<number>();
const failedContractId = ref<number>();
const contractLocked = ref<ContractLock>();

async function showDetails(value: any) {
  failedContractId.value = undefined;
  if (value.type === "name" || value.type === "rent") {
    return layout.value.openDialog(value, false, true);
  }
  loading.value = true;
  const contractId: number = value.contractId;
  loadingContractId.value = contractId;
  try {
    const deployment = await grid.value?.zos.getDeployment({ contractId });
    return layout.value.openDialog(deployment, false, true);
  } catch (e) {
    failedContractId.value = contractId;
    createCustomToast(`Failed to load details of contract ID: ${contractId}`, ToastType.danger);
  } finally {
    loadingContractId.value = undefined;
    loading.value = false;
  }
}

const onClickRow = (_: any, data: any) => showDetails(data.item.value);

function getStateColor(state: ContractStates): string {
  switch (state) {
    case ContractStates.Created:
      return "success";
    case ContractStates.Deleted:
      return "error";
    case ContractStates.GracePeriod:
      return "warning";
    case ContractStates.OutOfFunds:
      return "info";
  }
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function exportData() {
  isExporting.value = true;
  downloadAsJson(contracts?.value);
  isExporting.value = false;
}

async function contractLockDetails(contractId: number) {
  contractStateDialog.value = true;
  loading.value = true;
  await grid.value?.contracts
    .contractLock({ id: contractId })
    .then((data: ContractLock) => {
      contractLocked.value = data;
    })
    .catch(err => {
      layout.value.setStatus("failed", normalizeError(err, `Failed to fetch the contract ${contractId} lock details.`));
      contractStateDialog.value = false;
    });
  loading.value = false;
}
const snackbar = ref(false);
const deletingDialog = ref(false);
const contractStateDialog = ref(false);
const deleting = ref(false);
async function onDelete() {
  deletingDialog.value = false;
  deleting.value = true;
  try {
    if (selectedContracts.value.length === contracts.value.length) {
      await grid.value?.contracts.cancelMyContracts();
    } else {
      await grid.value?.contracts.batchCancelContracts({
        ids: selectedContracts.value.map(c => c.contractId),
      });
    }
    contracts.value = contracts.value!.filter(c => !selectedContracts.value.includes(c));
    totalCost.value = getTotalCost(contracts.value);
    selectedContracts.value = [];
  } catch (e) {
    if ((e as Error).message.includes("Inability to pay some fees")) {
      contracts.value = contracts.value!.filter(c => !selectedContracts.value.includes(c));
      selectedContracts.value = [];
      snackbar.value = true;
    } else {
      layout.value.setStatus("failed", normalizeError(e, `Failed to delete some of the selected contracts.`));
    }
  }
  deleting.value = false;
}

async function getNodeStatus(nodeIDs: (number | undefined)[]) {
  const resultPromises = nodeIDs.map(async nodeId => {
    if (typeof nodeId !== "number") return {};
    const status = (await gridProxyClient.nodes.byId(nodeId)).status;
    return { [nodeId]: status };
  });

  const resultsArray = await Promise.all(resultPromises);

  return resultsArray.reduce((acc, obj) => Object.assign(acc, obj), {});
}
function getNodeStateColor(state: NodeStatus): string {
  switch (state) {
    case NodeStatus.Up:
      return "success";
    case NodeStatus.Down:
      return "error";
    case NodeStatus.Standby:
      return "warning";
  }
}

function getTotalCost(contracts: NormalizedContract[]) {
  totalCost.value = 0;
  for (const contract of contracts) {
    const matching = contract.consumption.match(/(\d+(\.\d+)?) TFT\/hour/);
    if (matching) {
      const value = new Decimal(matching[1]);
      totalCost.value = +new Decimal(totalCost.value).add(value);
    }
  }
  return +totalCost.value.toFixed(3);
}
</script>

<script lang="ts">
import { NodeStatus } from "@threefold/gridproxy_client";
import type { ContractLock } from "@threefold/tfchain_client";

import { gridProxyClient } from "../clients";
import ListTable from "../components/list_table.vue";
import { solutionType } from "../types/index";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { downloadAsJson, normalizeError } from "../utils/helpers";

export default {
  name: "TfContractsList",
  components: {
    ListTable,
  },
};
</script>
