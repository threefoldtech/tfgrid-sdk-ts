<template>
  <weblet-layout ref="layout" @mount="onMount">
    <template #title>Contracts List</template>
    <template #subtitle>
      <a class="app-link" href="https://manual.grid.tf/tfchain/tfchain_external_service_contract.html" target="_blank"
        >Quick start documentation</a
      >
    </template>

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
    >
      <template #[`item.index`]="{ item }">
        {{ contracts.indexOf(item.value) + 1 }}
      </template>

      <template #[`item.state`]="{ item }">
        <v-chip :color="getStateColor(item.value.state)">
          {{ item.value.state }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn
          color="secondary"
          variant="tonal"
          @click="
            item.value.type !== 'name'
              ? onShowDetails(item.value.contractId)
              : layout.openDialog(item.value, false, true)
          "
          :disabled="(loading && loadingContractId !== item.value.contractId) || deleting"
          :loading="loadingContractId == item.value.contractId"
        >
          Show Details
        </v-btn>
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
      <v-card-title class="text-h5"> Are you sure you want to delete the following contracts? </v-card-title>
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
  { title: "#", key: "index" },
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contractId" },
  { title: "Type", key: "type" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Created At", key: "createdAt" },
  { title: "Expiration", key: "expiration" },
  { title: "Actions", key: "actions", sortable: false },
];

async function onMount() {
  loading.value = true;
  contracts.value = [];
  const grid = await getGrid(profileManager.profile!);
  contracts.value = await getUserContracts(grid!);
  loading.value = false;
}

const loadingContractId = ref<number>();
async function onShowDetails(contractId: number) {
  loading.value = true;
  loadingContractId.value = contractId;
  try {
    const grid = await getGrid(profileManager.profile!);
    const deployment = await grid!.zos.getDeployment({ contractId });
    layout.value.openDialog(deployment, false, true);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, `Failed to load details of contract(${contractId})`));
  }
  loadingContractId.value = undefined;
  loading.value = false;
}

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

const deletingDialog = ref(false);
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
    layout.value.setStatus("failed", normalizeError(e, `Failed to delete some of the selected contracts.`));
  }
  deleting.value = false;
}
</script>

<script lang="ts">
import ListTable from "../components/list_table.vue";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfContractsList",
  components: {
    ListTable,
  },
};
</script>
