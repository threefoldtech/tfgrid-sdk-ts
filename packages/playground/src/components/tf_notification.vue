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
} from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { getOfflineNodes } from "@/utils/get_offline_nodes";

import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";
import TFNotificationContent from "./tf_notification_content.vue";

const profileManager = useProfileManager();
const contractsCount = ref(0);

async function checkOfflineDeployments(grid: GridClient | null) {
  const offlineNodesids = (await getOfflineNodes(grid, { flat: true })) as number[];

  const myContracts: GqlContracts = await grid!.contracts.listMyContracts();
  const contracts: (GqlNodeContract | GqlRentContract)[] = [...myContracts.nodeContracts, ...myContracts.rentContracts];

  const userOfflineDeployments = [];
  const withPubIp = [];

  for (const contract of contracts) {
    if (offlineNodesids.includes(contract.nodeID)) {
      userOfflineDeployments.push(contract.nodeID);
      if ("numberOfPublicIPs" in contract && contract.numberOfPublicIPs > 0) {
        withPubIp.push(contract.contractID);
      }
    }
  }

  // Get the deployments length.
  const deploymentLength = userOfflineDeployments.length;

  if (deploymentLength) {
    const contractIpsMsg = `${withPubIp.length} ${deploymentLength > 1 ? "of them" : ""} with public ${
      withPubIp.length > 1 ? "IPs" : "IP"
    }`;

    const offlineNodeMsg = `You have ${deploymentLength} ${
      deploymentLength > 1 ? "contracts" : "contract"
    } on an offline ${deploymentLength > 1 ? "nodes " : "node "}${withPubIp.length ? contractIpsMsg : ""}`;

    const props = { content: offlineNodeMsg, linkContent: "See in contracts page", link: `/contractslist` };

    createCustomToast(TFNotificationContent, ToastType.warning, props);
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
