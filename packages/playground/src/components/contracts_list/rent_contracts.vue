<template>
  <!-- Data Table -->
  <v-data-table
    :loading="$props.loading"
    :headers="tableHeaders"
    :items="contracts"
    item-value="name"
    select-strategy="single"
    show-select
  >
    <template #loading>
      <div class="text-center">
        <small>Loading rent contracts...</small>
      </div>
    </template>

    <template #[`item.consumption`]="{ item }">
      <p v-if="item.raw.consumption !== 0">{{ item.raw.consumption.toFixed(3) }} TFT/hour</p>
      <p v-else>No Data Available</p>
    </template>

    <!-- Custom Item State -->
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

    <template #[`item.nodeStatus`]="{ item }">
      <v-chip
        v-if="item.value.nodeId !== '-' && !$props.loading"
        :color="getNodeStateColor(item.value.nodeStatus)"
        class="text-capitalize"
      >
        {{ item.value.nodeStatus }}
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
  </v-data-table>
</template>

<script lang="ts" setup>
import { ContractStates, GridClient } from "@threefold/grid_client";
import type { ContractLock } from "@threefold/tfchain_client";
import { defineComponent, defineProps, type PropType, ref } from "vue";

import type { VDataTableHeader } from "@/types";
import { getNodeStateColor, getStateColor, type NormalizedContract } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { normalizeError } from "@/utils/helpers";

const props = defineProps({
  contracts: Array as PropType<any[]>,
  grid: Object as PropType<GridClient>,
  loading: Boolean,
});

const contracts = ref<NormalizedContract[]>([]);
const layout = ref();
const contractLocked = ref<ContractLock>();

const deleting = ref<boolean>(false);
const loadingShowDetails = ref<boolean>(false);
const contractStateDialog = ref<boolean>(false);

const failedContractId = ref<number>();
const loadingContractId = ref<number>();

const tableHeaders: VDataTableHeader = [
  { title: "PLACEHOLDER", key: "data-table-select" },
  { title: "ID", key: "contractId" },
  { title: "State", key: "state" },
  { title: "Billing Rate", key: "consumption" },
  { title: "Solution Type", key: "solutionType" },
  { title: "Solution Name", key: "solutionName" },
  { title: "Created At", key: "createdAt" },
  // { title: "Expiration", key: "expiration" },
  { title: "Node ID", key: "nodeId" },
  { title: "Node Status", key: "nodeStatus", sortable: false },
  { title: "Details", key: "actions", sortable: false },
];
async function showDetails(value: any) {
  failedContractId.value = undefined;
  if (value.type === "name" || value.type === "rent") {
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

async function contractLockDetails(contractId: number) {
  contractStateDialog.value = true;
  loadingShowDetails.value = true;
  await props.grid?.contracts
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
</script>

<script lang="ts">
export default defineComponent({
  name: "TfRentContractsList",
  components: {},
});
</script>
