<template>
  <weblet-layout :class="'mt-0 pt-0'" ref="layout" @mount="onMount">
    <template #title>Contracts List</template>

    <template #header-actions="{ hasProfile }">
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        class="mt-3"
        :disabled="isLoading || !hasProfile"
        @click="onMount"
      >
        refresh
      </v-btn>
    </template>

    <v-expansion-panels v-model="panel" multiple>
      <!-- Node Contracts -->
      <contract-type-panel
        v-if="grid"
        title="Node Contracts"
        icon="mdi-file"
        :contracts="nodeContracts"
        :grid="grid"
        :type="ContractType.NODE"
        :is-loading="isLoading"
      />

      <!-- Name Contracts -->
      <contract-type-panel
        v-if="grid"
        title="Name Contracts"
        icon="mdi-note-edit-outline"
        :contracts="nameContracts"
        :grid="grid"
        :type="ContractType.NAME"
        :is-loading="isLoading"
      />

      <!-- Rent Contracts -->
      <contract-type-panel
        v-if="grid"
        title="Rent Contracts"
        icon="mdi-newspaper-variant"
        :contracts="rentContracts"
        :grid="grid"
        :type="ContractType.RENT"
        :is-loading="isLoading"
      />
    </v-expansion-panels>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { defineComponent, ref } from "vue";

import ContractTypePanel from "@/components/contracts_list/contract_type_panel.vue";
import { useProfileManager } from "@/stores/profile_manager";
import { ContractType, getUserContracts } from "@/utils/contracts";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getGrid } from "@/utils/grid";

const isLoading = ref<boolean>(false);
const profileManager = useProfileManager();
const grid = ref<GridClient>();

const nameContracts = ref<any[]>([]);
const nodeContracts = ref<any[]>([]);
const rentContracts = ref<any[]>([]);

const panel = ref<number[]>([0, 1]);

async function onMount() {
  isLoading.value = true;
  if (profileManager.profile) {
    const _grid = await getGrid(profileManager.profile);
    if (_grid) {
      grid.value = _grid;
      const contracts = await getUserContracts(grid.value);
      nodeContracts.value = contracts.filter(c => c.type === ContractType.NODE);
      nameContracts.value = contracts.filter(c => c.type === ContractType.NAME);
      rentContracts.value = contracts.filter(c => c.type === ContractType.RENT);
    } else {
      createCustomToast("Failed to initialize an instance of grid type.", ToastType.danger, {});
    }
  } else {
    createCustomToast(
      "Failed to initialize an instance of the profile manager, please make sure that you have a stable connection.",
      ToastType.danger,
      {},
    );
  }
  isLoading.value = false;
}
</script>

<script lang="ts">
export default defineComponent({
  name: "TfContractsList",
  components: {
    ContractTypePanel,
  },
});
</script>
