<template>
  <v-dialog
    width="800"
    :model-value="props.deletingDialog"
    @update:model-value="!$event && $emit(`close`)"
    attach="#modals"
  >
    <v-card>
      <v-card-title class="bg-primary"> Delete the following contracts? </v-card-title>
      <v-alert class="ma-4" type="warning" variant="tonal"
        >It is advisable to remove the contract from its solution page, especially when multiple contracts may be linked
        to the same instance.</v-alert
      >

      <v-alert class="mx-4" type="warning" variant="tonal">Deleting contracts may take a while to complete.</v-alert>
      <v-container v-if="loading" class="text-center">
        <v-progress-circular class="my-auto" indeterminate color="white" size="20" width="2" />
      </v-container>
      <v-card-text v-else>
        <v-chip class="ma-1" label v-for="c in props.selectedContracts" :key="c.contract_id">
          {{ c.contract_id }}
        </v-chip>
        <v-container class="pl-2">
          <v-divider class="mb-3" />
          <p>Other contracts linked to the selected contracts:</p>
          <v-chip class="ma-1" color="gray" label v-for="c in relatedContracts" :key="c">
            {{ c }}
          </v-chip>
        </v-container>

        <v-divider class="mt-3" />
      </v-card-text>
      <v-card-actions class="justify-end mb-1 mr-2">
        <v-btn color="anchor" @click="$emit('close')"> Cancel </v-btn>
        <v-btn color="error" @click="onDelete"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { GridClient } from "@threefold/grid_client";
import { ContractState, ContractType } from "@threefold/gridproxy_client";
import { TFChainError } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError } from "@threefold/types";
import { PropType, Ref, ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import { NormalizedContract } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { normalizeError } from "@/utils/helpers";

import { WebletLayout } from "../weblet_layout.vue";

const props = defineProps({
  deletingDialog: {
    type: Boolean,
    required: true,
  },
  selectedContracts: {
    type: Object as PropType<NormalizedContract[]>,
    required: true,
  },
  grid: {
    type: Object as PropType<GridClient>,
    required: true,
  },
  layout: {
    type: Object as PropType<Ref<WebletLayout>>,
    required: true,
  },
});
const loading = ref(false);

const emits = defineEmits([
  "close",
  "delete",
  "update:delete-loading",
  "update:deleted-contracts",
  "update:selected-contracts",
]);

const relatedContracts = ref<number[]>([]);
watch(
  () => props.deletingDialog,
  val => {
    if (val) {
      getRelatedContracts();
    }
  },
);
async function onDelete() {
  emits("update:delete-loading", true);
  try {
    const deletedContracts = await props.grid?.contracts.batchCancelContracts({
      ids: [...relatedContracts.value, ...props.selectedContracts.map(c => c.contract_id)],
    });
    emits("update:selected-contracts", []);
    emits("update:deleted-contracts", deletedContracts);
  } catch (e) {
    if (e instanceof DeploymentKeyDeletionError) {
      emits("update:selected-contracts", []);
      createCustomToast("Failed to delete some keys, You don't have enough tokens", ToastType.danger);
    } else if (e instanceof TFChainError && e.keyError === "NodeHasActiveContracts") {
      createCustomToast(
        "Some of the chosen rent contracts could not be deleted as there are active contracts linked to the rented node. Please ensure that any active contracts associated with a rented node are removed before attempting to delete its rent contract.",
        ToastType.danger,
      );
    } else {
      createCustomToast(normalizeError(e, `Failed to delete some of the selected contracts.`), ToastType.danger);
    }
  } finally {
    emits("update:delete-loading", false);
  }
}

async function getRelatedContracts() {
  loading.value = true;
  relatedContracts.value = [];
  const contracts = new Set<number>();
  for (const contract of props.selectedContracts) {
    if (contract.type != ContractType.Rent) {
      continue;
    }
    const nodeContracts = await gridProxyClient.contracts.list({
      nodeId: contract.details.nodeId,
      state: [ContractState.Created, ContractState.GracePeriod],
    });
    nodeContracts.data.forEach(nodeContract => {
      contracts.add(nodeContract.contract_id);
    });
  }
  relatedContracts.value = Array.from(contracts).filter(
    contract_id => !props.selectedContracts.some(c => c.contract_id == contract_id),
  );
  loading.value = false;
}
</script>
<script lang="ts">
export default {
  name: "DeleteContractsDialog",
};
</script>
