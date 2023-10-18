<template>
  <div></div>
</template>

<script lang="ts" setup>
import "mosha-vue-toastify/dist/style.css";

import { ContractStates, GridClient, type NodeInfo } from "@threefold/grid_client";
import { onMounted } from "vue";
import { ref } from "vue";

import { getOfflineNodes } from "@/utils/get_offline_nodes";

import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();
const contractsCount = ref(0);

async function isThereAnOfflineNodes(grid: GridClient | null) {
  const deploymentsNodeIds: number[] = [];
  const nodesWithPubIps: number[] = [];

  const offlineNodes: NodeInfo[] = await getOfflineNodes(grid);
  const userContracts: any = await grid!.contracts.listMyContracts();
  userContracts.nodeContracts.map((contract: any) => {
    deploymentsNodeIds.push(contract.nodeID);
    if (contract.numberOfPublicIPs > 0) {
      nodesWithPubIps.push(contract.nodeID);
    }
  });

  const userOfflineDeployments: NodeInfo[] = offlineNodes
    .map(node => JSON.parse(JSON.stringify(node)))
    .filter(node => deploymentsNodeIds.includes(node.nodeId));

  const withPubIp = userOfflineDeployments.filter(node => nodesWithPubIps.includes(node.nodeId));

  const deps = userOfflineDeployments.length;
  if (deps) {
    const withPublicIpsMessage = `${withPubIp.length} of them with public ${withPubIp.length > 1 ? "IPs" : "IP"}`;
    createCustomToast(
      `You have ${deps} ${deps > 1 ? "contracts" : "contract"} on an offline ${deps > 1 ? "nodes" : "node"}${
        withPubIp.length ? withPublicIpsMessage : ""
      }`,
      ToastType.warning,
    );
  }
}

onMounted(async () => {
  while (profileManager.profile) {
    const grid = await getGrid(profileManager.profile!);
    const contracts: any = await grid!.contracts.listMyContracts({ state: [ContractStates.GracePeriod] });

    await isThereAnOfflineNodes(grid);

    if (
      contracts.nameContracts.length != 0 ||
      contracts.nodeContracts.length != 0 ||
      contracts.rentContracts.length != 0
    ) {
      contractsCount.value =
        contracts.nameContracts.length + contracts.nodeContracts.length + contracts.rentContracts.length;
      createCustomToast("You have " + contractsCount.value + " contracts in grace period", ToastType.warning);
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
