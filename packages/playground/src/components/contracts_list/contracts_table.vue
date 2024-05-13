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
          v-if="$props.nodeStatus && item.nodeId !== '-' && !$props.loading.value"
          :color="getNodeStateColor($props.nodeStatus[item.nodeId])"
          class="text-capitalize"
        >
          {{ $props.nodeStatus[item.nodeId] }}
        </v-chip>
        <p v-else>-</p>
      </template>

      <template #[`item.state`]="{ item }">
        <v-tooltip
          v-if="item && item.state === ContractStates.GracePeriod && loadingShowDetails && item == selectedItem"
          :text="'Click here to check the amount of tokens needed to unlock your contract and resume your workload.'"
          location="top center"
        >
          <template #activator="{ props }">
            <VProgressCircular v-bind="props" :color="getStateColor(item.state)" indeterminate size="20" width="3" />
          </template>
        </v-tooltip>
        <v-tooltip
          v-else-if="item && item.state === ContractStates.GracePeriod"
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

      <template #[`item.consumption`]="{ item }">
        <p v-if="item.consumption !== 0">{{ item.consumption.toFixed(3) }} TFT/hour</p>
        <p v-else>No Data Available</p>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-tooltip :text="failedContractId == item.contractId ? 'Retry' : 'Show Details'">
          <template #activator="{ props }">
            <v-btn
              :color="failedContractId == item.contractId ? 'error' : ''"
              variant="tonal"
              @click="showDetails(item)"
              :disabled="(loadingShowDetails && loadingContractId !== item.contractId) || deleting"
              :loading="loadingContractId == item.contractId"
              v-bind="props"
            >
              <v-icon class="pt-1" v-if="failedContractId == item.contractId">mdi-refresh</v-icon>
              <v-icon v-else>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </list-table>

    <template #footer-actions>
      <v-btn
        v-if="Object.keys(props.lockedContracts).length > 0"
        :disabled="!selectedLockedContracts"
        color="warning"
        variant="outlined"
        @click="openUnlockDialog"
        >Unlock</v-btn
      >

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
          {{ getAmountLocked }}
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
          <v-tooltip
            :text="
              freeBalance < getAmountLocked
                ? `You don't have enough balance to unlock this contract`
                : `Get your contract ready again`
            "
            location="top center"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-btn
                  v-if="!isNodeInRentContracts"
                  :disabled="freeBalance < getAmountLocked"
                  variant="outlined"
                  color="warning"
                  class="mr-2 px-3"
                  @click="unlockContract([selectedItem.contractId])"
                  :loading="unlockContractLoading"
                >
                  Unlock Contract
                </v-btn>
              </div>
            </template>
          </v-tooltip>
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
        <v-chip class="ma-1" color="primary" label v-for="c in selectedContracts" :key="c.contractId">
          {{ c.contractId }}
        </v-chip>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="anchor" variant="outlined" @click="deletingDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="outlined" @click="onDelete"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog width="500" v-model="unlockDialog">
    <v-card>
      <v-card-title class="bg-primary">
        Unlock the following Contract<span v-if="selectedContracts.length > 1">s</span>
      </v-card-title>
      <v-card-text
        class="d-flex flex-column justify-center align-center"
        style="height: 20vh"
        v-if="loadingShowDetails"
      >
        <v-progress-circular indeterminate />

        <div class="text-subtitle-2">Loading contracts lock details</div>
      </v-card-text>
      <v-card-text v-else>
        <v-alert class="my-4" type="warning" variant="tonal">
          <div v-if="selectedLockedAmount < freeBalance">
            You have enough balance to unlock your contract<span v-if="selectedContracts.length > 1">s</span>!
          </div>
          <div v-else-if="selectedLockedAmount > 0">
            You need to fund your account with
            <span class="font-weight-bold">{{ Math.ceil(selectedLockedAmount - freeBalance) }} TFTs</span> to resume
            your contracts
          </div>
        </v-alert>
        <v-chip class="ma-1" color="primary" label v-for="c in selectedContracts" :key="c.contractId">
          {{ c.contractId }}
        </v-chip>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="anchor" variant="outlined" @click="unlockDialog = false"> Cancel </v-btn>
          <v-tooltip
            :text="
              freeBalance < selectedLockedAmount
                ? `You don't have enough balance to unlock your contract${selectedContracts.length > 1 ? `s` : ``}`
                : `Get your contracts ready again`
            "
            location="top center"
          >
            <template #activator="{ props }">
              <div v-bind="props">
                <v-btn
                  :disabled="selectedLockedAmount > freeBalance"
                  color="warning"
                  variant="outlined"
                  class="ml-2"
                  :loading="unlockContractLoading"
                  @click="
                    unlockContract([...selectedContracts.map(contract => contract.contractId), ...rentContractIds])
                  "
                >
                  Unlock
                </v-btn>
              </div>
            </template>
          </v-tooltip>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
// Import necessary types and libraries
import { ContractStates, type GridClient, type LockDetails } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import type { ContractLock } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError, TFChainErrors } from "@threefold/types";
import { capitalize, computed, defineComponent, type PropType, type Ref, ref, watch } from "vue";

import type { VDataTableHeader } from "@/types";
import { ContractType, getNodeStateColor, getStateColor, type NormalizedContract } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { downloadAsJson, normalizeError } from "@/utils/helpers";

import ListTable from "../../components/list_table.vue";
import { useProfileManagerController } from "../profile_manager_controller.vue";

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
  lockedContracts: {
    type: Object as PropType<LockDetails>,
    required: true,
  },
});
const getAmountLocked = computed(() => {
  const amountLocked = contractLocked?.value?.amountLocked ?? 0;
  return amountLocked > 0 ? parseFloat(amountLocked.toFixed(3)) : 0;
});

const isNodeInRentContracts = computed(() => {
  if (props.contractsType == ContractType.NODE && selectedItem.value) {
    const nodeIds = contracts.value.map(contract => contract.nodeId).filter(nodeId => nodeId !== undefined) as number[];
    if (contractLocked.value && contractLocked.value.amountLocked === 0) {
      return nodeIds.includes(selectedItem.value.nodeId);
    }
  }
  return false;
});

const emits = defineEmits(["update:deleted-contracts", "update:unlock-contracts"]);

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
const profileManagerController = useProfileManagerController();
const balance = profileManagerController.balance;
const freeBalance = computed(() => balance.value?.free ?? 0 - (balance.value?.locked ?? 0));
const unlockContractLoading = ref(false);
const unlockDialog = ref(false);
const selectedLockedContracts = computed(() => {
  if (selectedContracts.value.length == 0) return false;
  for (const contract of selectedContracts.value) {
    if (contract.state != ContractStates.GracePeriod) return false;
  }
  return true;
});
const rentContractIds = ref<number[]>([]);
const selectedLockedAmount = ref(0);
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

async function openUnlockDialog() {
  loadingShowDetails.value = true;
  unlockDialog.value = true;
  rentContractIds.value = [];
  selectedLockedAmount.value = 0;
  const nodeIDsGracePeriod = new Set<number>();
  try {
    // get actual locked amount
    for (const contract of selectedContracts.value) {
      if (contract.consumption == 0 && contract.type == ContractType.NODE && contract.nodeId) {
        nodeIDsGracePeriod.add(contract.nodeId);
      } else {
        selectedLockedAmount.value += (await getLockDetails(contract.contractId)).amountLocked || 0;
      }
    }
    for (const nodeId of nodeIDsGracePeriod) {
      const rentContractId = await props.grid.nodes.getRentContractId({ nodeId });
      if (rentContractId) {
        rentContractIds.value.push(rentContractId);
        selectedLockedAmount.value += (await getLockDetails(rentContractId)).amountLocked || 0;
      }
    }
  } catch (e) {
    console.log("errror", e);
  } finally {
    loadingShowDetails.value = false;
  }
}

async function getLockDetails(contractId: number) {
  return await props.grid.contracts.contractLock({ id: contractId });
}
// Function to fetch contract lock details
async function contractLockDetails(item: any) {
  selectedItem.value = item;
  loadingShowDetails.value = true;
  await getLockDetails(item.contractId)
    .then((data: ContractLock) => {
      contractLocked.value = data;
      contractStateDialog.value = true;
    })
    .catch((err: any) => {
      layout.value.setStatus(
        "failed",
        normalizeError(err, `Failed to fetch the contract ${item.contractId} lock details.`),
      );
      contractStateDialog.value = false;
    })
    .finally(() => {
      loadingShowDetails.value = false;
    });
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

// function to unlock grace period contracts
async function unlockContract(contractId: number[]) {
  try {
    unlockContractLoading.value = true;
    await props.grid.contracts.unlockContract(contractId.filter(id => props.lockedContracts[id]?.amountLocked !== 0));
    createCustomToast(
      `your request to unlock contract ${contractId} has been processed successfully, Changes may take few minuets to reflect`,
      ToastType.info,
    );
    setTimeout(() => emits("update:unlock-contracts"), 30000);
    contractStateDialog.value = false;
    unlockDialog.value = false;
    rentContractIds.value = [];
  } catch (e) {
    createCustomToast(`Failed to unlock contract ${contractId}`, ToastType.danger);
    console.error(e);
  } finally {
    unlockContractLoading.value = false;
  }
}
watch(contractStateDialog, contractStateDialog => {
  if (!contractStateDialog) selectedItem.value = undefined;
});
defineExpose({
  reset() {
    selectedContracts.value = [];
  },
});
</script>

<script lang="ts">
export default defineComponent({
  name: "TfContractsList",
  components: {},
});
</script>
