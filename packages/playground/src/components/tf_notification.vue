<template>
  <div></div>
</template>

<script lang="ts" setup>
import "mosha-vue-toastify/dist/style.css";

import { ContractStates } from "@threefold/grid_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted } from "vue";
import { ref } from "vue";

import { useProfileManager } from "../stores";
import { getUserContracts, type NormalizedContract } from "../utils/contracts";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();
const contracts = ref<NormalizedContract[]>([]);

onMounted(async () => {
  contracts.value = [];
  const grid = await getGrid(profileManager.profile!);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    contracts.value = await getUserContracts(grid!);

    for (const contract of contracts.value) {
      if (contract.state == ContractStates.GracePeriod) {
        createToast("Contract " + contract.contractId + " is in grace period", {
          position: "top-right",
          hideProgressBar: true,
          toastBackgroundColor: "red",
          timeout: 5000,
        });
      }
    }
    await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
  }
});
</script>

<script lang="ts">
export default {
  name: "TFNotification",
};
</script>
