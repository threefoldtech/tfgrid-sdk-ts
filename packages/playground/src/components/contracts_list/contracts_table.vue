<template>
  <weblet-layout ref="layout" @mount="() => {}">
    <list-table
      v-if="$props.tableHeaders"
      :headers="$props.tableHeaders"
      :items="contracts"
      :loading="$props.loading.value"
      :deleting="deleting"
      v-model="selectedContracts"
      :no-data-text="capitalize(`No ${props.contractsType} contracts found on your account.`)"
      v-bind:onClick:row="loading || deleting ? undefined : onClickRow"
    >
      <template #[`item.nodeStatus`]="{ item }">
        <v-chip
          v-if="$props.nodeStatus && item.value.nodeId !== '-' && !$props.loading.value"
          :color="getNodeStateColor($props.nodeStatus[item.value.nodeId])"
          class="text-capitalize"
        >
          {{ $props.nodeStatus[item.value.nodeId] }}
        </v-chip>
        <p v-else>-</p>
      </template>

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

      <template #[`item.consumption`]="{ item }">
        <p v-if="item.raw.consumption !== 0">{{ item.raw.consumption.toFixed(3) }} TFT/hour</p>
        <p v-else>No Data Available</p>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-tooltip :text="failedContractId == item.value.contractId ? 'Retry' : 'Show Details'">
          <template #activator="{ props }">
            <v-btn
              :color="failedContractId == item.value.contractId ? 'error' : ''"
              variant="tonal"
              @click="showDetails(item.value)"
              :disabled="(loadingShowDetails && loadingContractId !== item.value.contractId) || deleting"
              :loading="loadingContractId == item.value.contractId"
              v-bind="props"
            >
              <v-icon class="pt-1" v-if="failedContractId == item.value.contractId">mdi-refresh</v-icon>
              <v-icon v-else>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </list-table>

    <template #footer-actions>
      <v-btn
        variant="outlined"
        color="error"
        prepend-icon="mdi-export-variant"
        :disabled="isExporting || !contracts || contracts.length === 0 || loadingDelete || deleting"
        @click="exportData"
      >
        Export
      </v-btn>

      <v-btn
        variant="outlined"
        color="error"
        :disabled="!selectedContracts.length || loadingDelete || deleting"
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
        <v-btn color="error" variant="tonal" @click="deletingDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="text" @click="onDelete"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
// Import necessary types and libraries
import { ContractStates, type GridClient } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import type { ContractLock } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError, InsufficientBalanceError } from "@threefold/types";
import { defineComponent, type PropType, type Ref, ref } from "vue";
import { capitalize } from "vue";

import type { VDataTableHeader } from "@/types";
import { ContractType, getNodeStateColor, getStateColor, type NormalizedContract } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { downloadAsJson, normalizeError } from "@/utils/helpers";

import ListTable from "../../components/list_table.vue";

const props = defineProps({
  contracts: {
    type: Object as PropType<Ref<NormalizedContract[]>>,
    required: true,
  },
  nodeStatus: {
    type: Object as PropType<{ [x: number]: NodeStatus }>,
    required: true,
  },
  grid: {
    type: Object as PropType<Ref<GridClient | undefined>>,
    required: true,
  },
  loading: {
    type: Object as PropType<Ref<boolean>>,
    required: true,
  },
  tableHeaders: {
    type: Array as PropType<VDataTableHeader>,
    required: false,
  },
  contractsType: {
    type: Object as PropType<ContractType>,
    required: true,
  },
});

const emits = defineEmits(["update:deleted-contracts"]);

const layout = ref();
const contractLocked = ref<ContractLock>();
const deleting = ref<boolean>(false);
const snackbar = ref<boolean>(false);
const loadingShowDetails = ref<boolean>(false);
const loadingDelete = ref<boolean>(false);
const contractStateDialog = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const deletingDialog = ref<boolean>(false);
const failedContractId = ref<number>();
const loadingContractId = ref<number>();
const selectedContracts = ref<NormalizedContract[]>([]);
const contracts = ref<Ref<NormalizedContract[]>>(props.contracts);

// Function to show details of a contract
async function showDetails(value: any) {
  failedContractId.value = undefined;
  if (value.type === ContractType.NAME || value.type === ContractType.RENT) {
    return layout.value.openDialog(value, false, true);
  }

  loadingShowDetails.value = true;
  const contractId: number = value.contractId;
  loadingContractId.value = contractId;

  try {
    const deployment = await props.grid.value?.zos.getDeployment({ contractId });
    return layout.value.openDialog(deployment, false, true);
  } catch (e) {
    failedContractId.value = contractId;
    createCustomToast(`Failed to load details of contract ID: ${contractId}`, ToastType.danger);
  } finally {
    loadingContractId.value = undefined;
    loadingShowDetails.value = false;
  }
}

// Function to fetch contract lock details
async function contractLockDetails(contractId: number) {
  contractStateDialog.value = true;
  loadingShowDetails.value = true;
  await props.grid.value?.contracts
    .contractLock({ id: contractId })
    .then((data: ContractLock) => {
      contractLocked.value = data;
    })
    .catch(err => {
      layout.value.setStatus("failed", normalizeError(err, `Failed to fetch the contract ${contractId} lock details.`));
      contractStateDialog.value = false;
    });
  loadingShowDetails.value = false;
}

// Function to export contract data as JSON
function exportData() {
  isExporting.value = true;
  downloadAsJson(contracts.value);
  isExporting.value = false;
}

// Function called on clicking a row to show details
const onClickRow = (_: any, data: any) => showDetails(data.item.value);

// Function to handle contract deletion
async function onDelete() {
  deletingDialog.value = false;
  deleting.value = true;

  try {
    await props.grid.value?.contracts.batchCancelContracts({
      ids: selectedContracts.value.map(c => c.contractId),
    });
    contracts.value = contracts.value.filter(c => !selectedContracts.value.includes(c));
    emits("update:deleted-contracts", contracts.value);
    selectedContracts.value = [];
  } catch (e) {
    if (e instanceof DeploymentKeyDeletionError) {
      contracts.value = contracts.value.filter(c => !selectedContracts.value.includes(c));
      selectedContracts.value = [];
      createCustomToast("Failed to delete some keys, You don't have enough tokens", ToastType.danger);
    } else {
      layout.value.setStatus("failed", normalizeError(e, `Failed to delete some of the selected contracts.`));
    }
  }
  deleting.value = false;
}
</script>

<script lang="ts">
export default defineComponent({
  name: "TfContractsList",
  components: {},
});
</script>
