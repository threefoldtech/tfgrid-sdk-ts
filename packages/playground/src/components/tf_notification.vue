<template>
  <div></div>
</template>

<script lang="ts" setup>
import "mosha-vue-toastify/dist/style.css";

import {
  ContractStates,
  type GqlContracts,
  type GqlNodeContract,
  type GqlRentContract,
  GridClient,
  type NodeInfo,
} from "@threefold/grid_client";
import { onMounted } from "vue";
import { ref } from "vue";

import { getOfflineNodes } from "@/utils/get_offline_nodes";

import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

const profileManager = useProfileManager();
const contractsCount = ref(0);

async function checkOfflineDeployments(grid: GridClient | null) {
  const deploymentsNodeIds: number[] = [];
  const nodesWithPubIps: number[] = [];

  const offlineNodes: NodeInfo[] = await getOfflineNodes(grid);
  const myContracts: GqlContracts = await grid!.contracts.listMyContracts();
  const contracts: (GqlNodeContract | GqlRentContract)[] = [...myContracts.nodeContracts, ...myContracts.rentContracts];

  contracts.map(contract => {
    deploymentsNodeIds.push(contract.nodeID);
    if ("numberOfPublicIPs" in contract && contract.numberOfPublicIPs > 0) {
      nodesWithPubIps.push(contract.nodeID);
    }
  });

  const userOfflineDeployments = [];
  const withPubIp = [];

  offlineNodes.map(node => {
    if (deploymentsNodeIds.includes(node.nodeId)) {
      userOfflineDeployments.push(node);
    }

    if (nodesWithPubIps.includes(node.nodeId)) {
      withPubIp.push(node);
    }
  });

  const deplen = userOfflineDeployments.length;
  if (deplen) {
    const withPublicIpsMessage = `${withPubIp.length} of them with public ${withPubIp.length > 1 ? "IPs" : "IP"}`;
    createCustomToast(
      `You have ${deplen} ${deplen > 1 ? "contracts" : "contract"} on an offline ${deplen > 1 ? "nodes" : "node"}${
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

    await checkOfflineDeployments(grid);

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
