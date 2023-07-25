<template>
  <div></div>
</template>

<script lang="ts" setup>
import "mosha-vue-toastify/dist/style.css";

import { ContractStates } from "@threefold/grid_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted } from "vue";

import { useProfileManager } from "../stores";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();

onMounted(async () => {
  while (profileManager.profile) {
    const grid = await getGrid(profileManager.profile!);
    const contracts: any = await grid!.contracts.listMyContracts({ state: [ContractStates.GracePeriod] });

    if (
      contracts.nameContracts.length != 0 ||
      contracts.nodeContracts.length != 0 ||
      contracts.rentContracts.length != 0
    ) {
      createToast("Contracts are in grace period", {
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
