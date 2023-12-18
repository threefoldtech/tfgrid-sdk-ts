<template>
  <div></div>
</template>

<script lang="ts" setup>
import {
  ContractStates,
  type GqlContracts,
  type GqlNodeContract,
  type GqlRentContract,
  GridClient,
  NodeStatus,
} from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { getAllNodes } from "@/utils/get_nodes";

import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";
import GracePeriodToast from "./mosha_toast/grace_period_toast.vue";
import OfflineNodesToast from "./mosha_toast/offline_nodes_toast.vue";

const profileManager = useProfileManager();
const contractsCount = ref(0);

async function checkOfflineDeployments(grid: GridClient | null) {
  const offlineNodesids = (await getAllNodes(grid, { flat: true, status: NodeStatus.down })) as number[];
  const standByNodesids = (await getAllNodes(grid, { flat: true, status: NodeStatus.standBy })) as number[];
  const offlineAndStandbyNodes = [...offlineNodesids, ...standByNodesids];

  const myContracts: GqlContracts = await grid!.contracts.listMyContracts();
  const contracts: (GqlNodeContract | GqlRentContract)[] = [...myContracts.nodeContracts, ...myContracts.rentContracts];

  const userOfflineDeployments = [];
  const withPubIp = [];

  for (const contract of contracts) {
    if (offlineAndStandbyNodes.includes(contract.nodeID)) {
      userOfflineDeployments.push(contract.nodeID);
      if ("numberOfPublicIPs" in contract && contract.numberOfPublicIPs > 0) {
        withPubIp.push(contract.contractID);
      }
    }
  }

  // Get the deployments length.
  const deploymentLen = userOfflineDeployments.length;

  if (deploymentLen) {
    const props = { deploymentLen, withPubIpLen: withPubIp.length };
    createCustomToast(OfflineNodesToast, ToastType.warning, props);
  }
}
async function checkGracePeriodDeployments(grid: GridClient | null) {
  const contracts: any = await grid!.contracts.listMyContracts({ state: [ContractStates.GracePeriod] });
  if (
    contracts.nameContracts.length != 0 ||
    contracts.nodeContracts.length != 0 ||
    contracts.rentContracts.length != 0
  ) {
    contractsCount.value =
      contracts.nameContracts.length + contracts.nodeContracts.length + contracts.rentContracts.length;
    const props = { deploymentLen: contractsCount.value };
    createCustomToast(GracePeriodToast, ToastType.warning, props);
  }
}

onMounted(async () => {
  while (profileManager.profile) {
    const grid = await getGrid(profileManager.profile!);

    await checkOfflineDeployments(grid);
    await checkGracePeriodDeployments(grid);

    await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
  }
});
</script>

<script lang="ts">
export default {
  name: "TFNotification",
};
</script>
