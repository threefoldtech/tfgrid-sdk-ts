<template>
  <weblet-layout ref="layout" @mount="() => {}">
    <!-- Data Table -->
    <v-data-table
      :loading="$props.loading.value"
      :headers="$props.tableHeaders"
      :items="$props.contracts.value"
      item-value="name"
      select-strategy="single"
      show-select
    >
      <template #loading>
        <div class="text-center">
          <small> {{ capitalize(`Loading ${$props.contractsType} contracts...`) }}</small>
        </div>
      </template>

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
  </weblet-layout>
</template>

<script lang="ts" setup>
import { ContractStates, type GridClient } from "@threefold/grid_client";
import type { NodeStatus } from "@threefold/gridproxy_client";
import type { ContractLock } from "@threefold/tfchain_client";
import { defineComponent, type PropType, type Ref, ref } from "vue";
import { capitalize } from "vue";

import type { VDataTableHeader } from "@/types";
import { ContractType, getNodeStateColor, getStateColor } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { normalizeError } from "@/utils/helpers";

const props = defineProps({
  contracts: {
    type: Object as PropType<Ref<any[]>>,
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

const layout = ref();
const contractLocked = ref<ContractLock>();

const deleting = ref<boolean>(false);
const loadingShowDetails = ref<boolean>(false);
const contractStateDialog = ref<boolean>(false);

const failedContractId = ref<number>();
const loadingContractId = ref<number>();

async function showDetails(value: any) {
  failedContractId.value = undefined;
  if (value.type === "name" || value.type === "rent") {
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
</script>

<script lang="ts">
export default defineComponent({
  name: "TfContractsList",
  components: {},
});
</script>
