<script lang="ts" setup>
import { ContractStates, type GqlContracts, type GqlNodeContract, type GqlRentContract } from "@threefold/grid_client";
import type { GridNode } from "@threefold/gridproxy_client";
import uniq from "lodash/fp/uniq.js";
import { onMounted, ref } from "vue";

import { gridProxyClient } from "../clients";
import { useGrid } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import GracePeriodToast from "./mosha_toast/grace_period_toast.vue";
import OfflineNodesToast from "./mosha_toast/offline_nodes_toast.vue";

const gridStore = useGrid();
const contractsCount = ref(0);

async function checkOfflineDeployments() {
  try {
    const myContracts: GqlContracts = await gridStore.client.contracts.listMyContracts();
    type Contract = GqlNodeContract | GqlRentContract;
    const contracts: Contract[] = [...myContracts.nodeContracts, ...myContracts.rentContracts];

    const ids = uniq(contracts.map(c => c.nodeID));
    const settledNodes = await Promise.allSettled(ids.map(id => gridProxyClient.nodes.byId(id)));

    const offlineAndStandbyNodes = settledNodes.map(n =>
      n.status === "fulfilled" && n.value.status !== "up" ? n.value.nodeId : -1,
    );

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
  } catch (error) {
    console.log("Error in checkOfflineDeployments", error);
  }
}
async function checkGracePeriodDeployments() {
  try {
    const contracts: any = await gridStore.client.contracts.listMyContracts({ state: [ContractStates.GracePeriod] });
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
  } catch (error) {
    console.log("Error in checkGracePeriodDeployments", error);
  }
}

onMounted(async () => {
  while (gridStore.client) {
    await checkOfflineDeployments();
    await checkGracePeriodDeployments();

    await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
  }
});
</script>

<script lang="ts">
export default {
  name: "TFNotification",
};
</script>
