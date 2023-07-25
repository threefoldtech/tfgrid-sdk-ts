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
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();
const contractsCount = ref(0);

onMounted(async () => {
  while (profileManager.profile) {
    const grid = await getGrid(profileManager.profile!);
    const contracts: any = await grid!.contracts.listMyContracts({ state: [ContractStates.GracePeriod] });

    if (
      contracts.nameContracts.length != 0 ||
      contracts.nodeContracts.length != 0 ||
      contracts.rentContracts.length != 0
    ) {
      contractsCount.value =
        contracts.nameContracts.length + contracts.nodeContracts.length + contracts.rentContracts.length;
      createToast("You have " + contractsCount.value + " contracts in grace period", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "red",
        timeout: 5000,
      });
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
