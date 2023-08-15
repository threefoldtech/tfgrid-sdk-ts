<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    :certified="certified"
    :dedicated="dedicated"
    :ipv4="ipv4"
    title-image="images/icons/freeflow.png"
  >
    <template #title>Deploy a Freeflow Instance </template>

    <form-validator v-model="valid">
      <input-validator
        :value="threebotName"
        :rules="[
          validators.required('Name is required.'),
          validators.isAlphanumeric('Name should consist of letters and numbers only.'),
          validators.minLength('Name must be at least 4 characters.', 4),
          validators.maxLength('Name cannot exceed 15 characters.', 15),
        ]"
        #="{ props }"
      >
        <input-tooltip
          tooltip="
          To locate your 3Bot name, please follow these steps:
          
          1. Open the ThreeFold Connect app on your device.
          2. Access the app's settings section.
          3. Within the settings, you will find your registered 3Bot name.

          Please note that your 3Bot name is the name you provided during the registration process in the ThreeFold Connect app. Should you encounter any difficulties or have further questions, please don't hesitate to reach out for assistance.
          "
        >
          <v-text-field label="3bot name" v-model="threebotName" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <SelectSolutionFlavor
        v-model="solution"
        :minimum="{ cpu: 1, memory: 1024 * 4, disk: 100 }"
        :standard="{ cpu: 2, memory: 1024 * 16, disk: 500 }"
        :recommended="{ cpu: 4, memory: 1024 * 32, disk: 1000 }"
        :disabled="loadingFarm"
      />
      <Networks v-model:ipv4="ipv4" :disabled="loadingFarm"></Networks>
      <FarmGatewayManager>
        <input-tooltip
          inline
          tooltip="Click to know more about dedicated nodes."
          href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
        >
          <v-switch color="primary" inset label="Dedicated" v-model="dedicated" :disabled="loadingFarm" hide-details />
        </input-tooltip>

        <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
          <v-switch color="primary" inset label="Certified" v-model="certified" :disabled="loadingFarm" hide-details />
        </input-tooltip>

        <SelectFarmManager>
          <SelectFarm
            :filters="{
              cpu: solution?.cpu,
              memory: solution?.memory,
              ssd: (solution?.disk ?? 0) + rootFileSystemSize,
              publicIp: ipv4,
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
            v-model="farm"
            v-model:loading="loadingFarm"
          />

          <SelectNode
            v-model="selectedNode"
            :filters="{
              farmId: farm?.farmID,
              cpu: solution?.cpu,
              memory: solution?.memory,
              diskSizes: disks.map(disk => disk.size),
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
            :root-file-system-size="rootFileSystemSize"
          />
        </SelectFarmManager>
        <DomainName :hasIPv4="ipv4" ref="domainNameCmp"></DomainName>
      </FarmGatewayManager>
    </form-validator>

    <template #footer-actions>
      <v-btn
        color="primary"
        variant="tonal"
        @click="deploy(domainNameCmp?.domain, domainNameCmp?.customDomain)"
        :disabled="!valid"
      >
        Deploy
      </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { computed, onMounted, type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, Flist, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM, type Disk } from "../utils/deploy_vm";
import { deployGatewayName, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const threebotName = ref<string>("");
const solution = ref() as Ref<SolutionFlavor>;
const farm = ref() as Ref<Farm>;
const flist = ref<Flist>();
const disks = ref<Disk[]>([]);
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const ipv4 = ref(false);
const rootFileSystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
const loadingFarm = ref(false);
onMounted(() => {
  disks.value.push({
    name: "disk",
    size: solution?.value?.disk,
    mountPoint: "/disk",
  });

  flist.value = {
    value: "https://hub.grid.tf/lennertapp2.3bot/threefoldjimber-freeflow-latest.flist",
    entryPoint: "/sbin/zinit init",
  };
});
const domainNameCmp = ref();
function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Freeflow instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.freeflow);
}
async function deploy(gatewayName: GatewayNode, customDomain: boolean) {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.FreeFlow.toLowerCase();

  const domain = customDomain ? gatewayName.domain : threebotName.value + "." + gatewayName.domain;

  let grid: GridClient | null;
  let vm: any;

  try {
    layout.value?.validateSSH();
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: threebotName.value,
      network: {
        addAccess: !!gatewayName.id,
        accessNodeId: gatewayName.id,
      },
      machines: [
        {
          name: threebotName.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: disks.value,
          flist: flist?.value!.value,
          entryPoint: flist.value!.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          publicIpv4: ipv4.value,
          country: farm.value.country,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "USER_ID", value: threebotName.value },
            { key: "DIGITALTWIN_APPID", value: domain },
            { key: "NODE_ENV", value: "staging" },
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
          rootFilesystemSize: rootFileSystemSize.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Freeflow instance."));
  }
  if (customDomain && ipv4.value) {
    vm[0].customDomain = gatewayName.domain;
    finalize(vm);
    return;
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid!, {
      name: threebotName.value,
      nodeId: gatewayName.id!,
      ip: vm[0].interfaces[0].ip,
      port: 80,
      networkName: vm[0].interfaces[0].network,
      fqdn: gatewayName?.useFQDN ? gatewayName?.domain : undefined,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, threebotName.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Freeflow instance."));
  }
}
</script>

<script lang="ts">
import DomainName from "../components/domain_name.vue";
import FarmGatewayManager from "../components/farm_gateway_manager.vue";
import Networks from "../components/networks.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import rootFs from "../utils/root_fs";

export default {
  name: "TFFreeflow",
  components: {
    SelectSolutionFlavor,
    SelectFarm,
    DomainName,
    FarmGatewayManager,
    Networks,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
