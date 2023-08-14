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
      <template #[`item.actions`]="{ item }">
        <v-tooltip text="Show Details">
          <template #activator="{ props }">
            <v-btn
              variant="tonal"
              @click="showDetails(item.value)"
              :disabled="(loading && loadingContractId !== item.value.contractId) || deleting"
              :loading="loadingContractId == item.value.contractId"
              v-bind="props"
            >
              <v-icon>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </ListTable>

    <template #footer-actions>
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
      <v-alert class="ma-4" type="warning" variant="tonal">Deleting contracts may take a while to complete.</v-alert>
      <v-card-text>
        <v-chip class="ma-1" color="primary" label v-for="c in selectedContracts" :key="c.contractId">
          {{ c.contractId }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="onDelete"> Remove </v-btn>
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
import { ContractStates } from "@threefold/grid_client";
import { ref } from "vue";

import { useProfileManager } from "../stores";
import type { VDataTableHeader } from "../types";
import { getUserContracts, type NormalizedContract } from "../utils/contracts";
import { getGrid } from "../utils/grid";

const layout = ref();
const profileManager = useProfileManager();
const contracts = ref<NormalizedContract[]>([]);
const loading = ref(false);
const selectedContracts = ref<NormalizedContract[]>([]);
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
  { title: "Details", key: "actions", sortable: false },
];

async function onMount() {
  loading.value = true;
  contracts.value = [];
  const grid = await getGrid(profileManager.profile!);
  contracts.value = await getUserContracts(grid!);
  loading.value = false;
}

const loadingContractId = ref<number>();
const contractLocked = ref<ContractLock>();

async function showDetails(value: any) {
  if (value.type === "name" || value.type === "rent") {
    return layout.value.openDialog(value, false, true);
  }
  loading.value = true;
  const contractId: number = value.contractId;
  loadingContractId.value = contractId;
  try {
    const grid = await getGrid(profileManager.profile!);
    const deployment = await grid!.zos.getDeployment({ contractId });
    return layout.value.openDialog(deployment, false, true);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, `Failed to load details of contract(${contractId})`));
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

async function contractLockDetails(contractId: number) {
  contractStateDialog.value = true;
  loading.value = true;
  const grid = await getGrid(profileManager.profile!);
  await grid?.contracts
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
    const grid = await getGrid(profileManager.profile!);
    if (selectedContracts.value.length === contracts.value.length) {
      await grid!.contracts.cancelMyContracts();
    } else {
      await grid!.contracts.batchCancelContracts({
        ids: selectedContracts.value.map(c => c.contractId),
      });
    }
    contracts.value = contracts.value!.filter(c => !selectedContracts.value.includes(c));
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
</script>

<script lang="ts">
import type { ContractLock } from "@threefold/tfchain_client";

import ListTable from "../components/list_table.vue";
import { solutionType } from "../types/index";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfContractsList",
  components: {
    ListTable,
  },
};
</script>
