<template>
  <weblet-layout ref="layout" @mount="() => {}">
    <v-data-table-server
      v-if="$props.tableHeaders"
      :headers="$props.tableHeaders"
      :loading="$props.loading.value"
      loading-text="Loading nodes..."
      v-model="selectedContracts"
      :deleting="deleting"
      v-bind:onClick:row="loading || deleting ? undefined : onClickRow"
      :no-data-text="capitalize(`No ${props.contractsType} contracts found on your account.`)"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
        { value: 50, title: '50' },
      ]"
      class="elevation-1 v-data-table-header"
      density="compact"
      :items-length="$props.count.value"
      :items-per-page="$props.size"
      :page="$props.page"
      :items="contracts"
      @update:options="updateOptions"
      return-object
      show-select
    >
      <template #[`item.nodeId`]="{ item }">
        <span v-if="['node', 'rent'].includes(item.type)">{{ item.details.nodeId }}</span>
      </template>

      <template #[`item.created_at`]="{ item }">
        {{ toHumanDate(item.created_at) }}
      </template>

      <template #[`item.consumption`]="{ item }">
        <p v-if="item?.consumption !== 0 && item?.consumption !== undefined">
          {{ item.consumption.toFixed(3) }} TFT/hour
        </p>
        <p v-else>No Data Available</p>
      </template>

      <template #[`item.farm_id`]="{ item }">
        <span v-if="['node', 'rent'].includes(item.type)">
          {{ item.details.farm_id ? item.details.farm_id : "-" }}
        </span>
      </template>

      <template #[`item.solutionType`]="{ item }">
        <span v-if="item.type === 'node'">
          {{ item.solutionType }}
        </span>
      </template>

      <template #[`item.nodeStatus`]="{ item }">
        <v-chip
          v-if="$props.nodeStatus && !$props.loading.value"
          :color="getNodeStateColor($props.nodeStatus[item.details.nodeId])"
          class="text-capitalize"
        >
          {{ $props.nodeStatus[item.details.nodeId] }}
        </v-chip>
        <p v-else>-</p>
      </template>

      <template #[`item.state`]="{ item }">
        <v-tooltip
          v-if="item && item.state === ContractStates.GracePeriod"
          :text="'Click here to check the amount of tokens needed to unlock your contract and resume your workload.'"
          location="top center"
        >
          <template #activator="{ props }">
            <v-chip @click.stop="contractLockDetails(item)" v-bind="props" :color="getStateColor(item.state)">
              {{ item.state === ContractStates.GracePeriod ? "Grace Period" : item.state }}
            </v-chip>
          </template>
        </v-tooltip>
        <v-chip v-else :color="getStateColor(item.state)">
          {{ item.state }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-tooltip :text="failedContractId == item.contract_id ? 'Retry' : 'Show Details'">
          <template #activator="{ props }">
            <v-btn
              :color="failedContractId == item.contract_id ? 'error' : ''"
              variant="tonal"
              @click="showDetails(item)"
              :disabled="(loadingShowDetails && loadingContractId !== item.contract_id) || deleting"
              :loading="loadingContractId == item.contract_id"
              v-bind="props"
            >
              <v-icon class="pt-1" v-if="failedContractId == item.contract_id">mdi-refresh</v-icon>
              <v-icon v-else>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-data-table-server>

    <template #footer-actions>
      <v-btn
        variant="outlined"
        color="anchor"
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

  <v-dialog width="800" v-model="contractStateDialog">
    <v-card>
      <v-card-title class="text-h5 mt-2"> Contract lock Details</v-card-title>
      <v-card-text>
        <v-row class="d-flex justify-center">
          Amount Locked:
          {{ getAmountLocked() }}
          TFTs.
        </v-row>
        <v-alert
          v-if="contractLocked?.amountLocked == 0 && isNodeInRentContracts"
          class="ma-4"
          type="warning"
          variant="tonal"
        >
          This contract is in a grace period because it's on a dedicated machine also in a grace period. That's why this
          node is locked with zero TFTS and no billing rate.
        </v-alert>

        <v-alert class="ma-4" type="info" variant="tonal"
          >The Contracts in Grace Period, which means that your workloads are suspended but not deleted; in order to
          resume your workloads and restore their functionality, Please fund your account with the amount mentioned
          above.</v-alert
        >

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="anchor" class="mr-2 px-3" @click="contractStateDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog width="800" v-model="deletingDialog">
    <v-card>
      <v-card-title class="text-h5 mt-2"> Delete the following contracts? </v-card-title>
      <v-alert class="ma-4" type="warning" variant="tonal"
        >It is advisable to remove the contract from its solution page, especially when multiple contracts may be linked
        to the same instance.</v-alert
      >

      <v-alert class="mx-4" type="warning" variant="tonal">Deleting contracts may take a while to complete.</v-alert>
      <v-card-text>
        <v-chip class="ma-1" color="primary" label v-for="c in selectedContracts" :key="c.contract_id">
          {{ c.contract_id }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="anchor" variant="outlined" @click="deletingDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="outlined" @click="onDelete"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
// Import necessary types and libraries
import { ContractStates, type GridClient } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import type { ContractLock } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError, TFChainErrors } from "@threefold/types";
import { capitalize, computed, defineComponent, type PropType, type Ref, ref } from "vue";

import type { VDataTableHeader } from "@/types";
import { ContractType, getNodeStateColor, getStateColor, type NormalizedContract } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import toHumanDate from "@/utils/date";
import { downloadAsJson, normalizeError } from "@/utils/helpers";

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
    type: Object as PropType<GridClient>,
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
  size: {
    required: true,
    type: Number,
  },
  page: {
    required: true,
    type: Number,
  },
  count: {
    required: true,
    type: Object as PropType<Ref<number>>,
  },
});

const getAmountLocked = (): number => {
  const amountLocked = contractLocked?.value?.amountLocked ?? 0;
  return amountLocked > 0 ? parseFloat(amountLocked.toFixed(3)) : 0;
};

const isNodeInRentContracts = computed(() => {
  if (props.contractsType == ContractType.Rent) {
    const nodeIds = contracts.value
      .map(contract => contract.details.nodeId)
      .filter(nodeId => nodeId !== undefined) as number[];
    if (contractLocked.value && contractLocked.value.amountLocked === 0) {
      return nodeIds.includes(selectedItem.value.nodeId);
    }
  }
  return false;
});

const emits = defineEmits(["update:deleted-contracts", "update:options"]);

function updateOptions(options: any) {
  emits("update:options", { ...options, contractType: props.contractsType });
}
const layout = ref();
const contractLocked = ref<ContractLock>();
const deleting = ref<boolean>(false);
const loadingShowDetails = ref<boolean>(false);
const loadingDelete = ref<boolean>(false);
const contractStateDialog = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const deletingDialog = ref<boolean>(false);
const failedContractId = ref<number>();
const loadingContractId = ref<number>();
const selectedContracts = ref<NormalizedContract[]>([]);
const contracts = ref<Ref<NormalizedContract[]>>(props.contracts);
const selectedItem = ref();

// Function to show details of a contract
async function showDetails(value: any) {
  failedContractId.value = undefined;
  if (value.type === ContractType.Name || value.type === ContractType.Rent) {
    return layout.value.openDialog(value, false, true);
  }

  loadingShowDetails.value = true;
  const contractId: number = value.contract_id;
  loadingContractId.value = contractId;

  try {
    const deployment = await props.grid?.zos.getDeployment({ contractId });
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
async function contractLockDetails(item: any) {
  contractStateDialog.value = true;
  loadingShowDetails.value = true;
  selectedItem.value = item;
  await props.grid?.contracts
    .contractLock({ id: item.contract_id })
    .then((data: ContractLock) => {
      contractLocked.value = data;
    })
    .catch((err: any) => {
      layout.value.setStatus(
        "failed",
        normalizeError(err, `Failed to fetch the contract ${item.contract_id} lock details.`),
      );
      contractStateDialog.value = false;
    });
  loadingShowDetails.value = false;
}

// Function to export contract data as JSON
function exportData() {
  isExporting.value = true;
  downloadAsJson(contracts.value, `${props.contractsType}_contracts`);
  isExporting.value = false;
}

// Function called on clicking a row to show details
const onClickRow = (_: any, data: any) => showDetails(data.item);

// Function to handle contract deletion
async function onDelete() {
  deletingDialog.value = false;
  deleting.value = true;

  try {
    await props.grid?.contracts.batchCancelContracts({
      ids: selectedContracts.value.map(c => c.contract_id),
    });
    contracts.value = contracts.value.filter(c => !selectedContracts.value.includes(c));
    emits("update:deleted-contracts", contracts.value);
    selectedContracts.value = [];
  } catch (e) {
    if (e instanceof DeploymentKeyDeletionError) {
      contracts.value = contracts.value.filter(c => !selectedContracts.value.includes(c));
      selectedContracts.value = [];
      createCustomToast("Failed to delete some keys, You don't have enough tokens", ToastType.danger);
    } else if (e instanceof TFChainErrors.smartContractModule.NodeHasActiveContracts) {
      layout.value.setStatus(
        "failed",
        "Some of the chosen rent contracts could not be deleted as there are active contracts linked to the rented node. Please ensure that any active contracts associated with a rented node are removed before attempting to delete its rent contract.",
      );
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
