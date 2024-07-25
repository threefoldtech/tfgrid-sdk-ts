<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    :ipv4="ipv4"
    :ipv6="ipv6"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/dashboardsuite.png"
  >
    <template #title>Deploy a Dashboard Suite Instance </template>
    <d-tabs :tabs="[{ title: 'Config', value: 'config' }]">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.IsAlphanumericExpectUnderscore('Name should consist of letters ,numbers and underscores only.'),
          name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
          validators.minLength('Name must be at least 2 characters.', 2),
          validators.maxLength('Name cannot exceed 50 characters.', 50),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Instance name.">
          <v-text-field label="Name" v-model="name" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <input-tooltip tooltip="Select the network of the grid instance.">
        <v-select
          label="Dashboard Network"
          :items="[
            { title: 'Mainnet', value: 'main' },
            { title: 'Testnet', value: 'test' },
            { title: 'QAnet', value: 'qa' },
            { title: 'Devnet', value: 'dev' },
          ]"
          v-model="network"
        />
      </input-tooltip>

      <input-validator
        :value="seedPhrase"
        :rules="[validators.required('Token is required.')]"
        #="{ props: validationProps }"
      >
        <password-input-wrapper #="{ props }">
          <input-tooltip
            tooltip="Set a TFChain seedphrase of an active account with at least 10 TFT on the network of the grid instance."
          >
            <v-text-field label="Seed Phrase" v-bind="{ ...props, ...validationProps }" v-model="seedPhrase" />
          </input-tooltip>
        </password-input-wrapper>
      </input-validator>

      <SelectSolutionFlavor
        v-model="solution"
        :small="{ cpu: 2, memory: 4, disk: 100 }"
        :medium="{ cpu: 4, memory: 16, disk: 500 }"
        :large="{ cpu: 8, memory: 32, disk: 1000 }"
      />
      <Networks v-model:planetary="planetary" v-model:mycelium="mycelium" />
      <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
      </input-tooltip>
      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
      </input-tooltip>
      <TfSelectionDetails
        :filters="{
          ipv4,
          ipv6,
          certified,
          dedicated,
          cpu: solution?.cpu,
          solutionDisk: solution?.disk,
          memory: solution?.memory,
          rootFilesystemSize,
        }"
        require-domain
        v-model="selectionDetails"
      />
      <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
    </d-tabs>
    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn color="secondary" @click="validateBeforeDeploy(deploy)" text="Deploy" />
    </template>
  </weblet-layout>
</template>
<script lang="ts" setup>
import { calculateRootFileSystem, type GridClient } from "@threefold/grid_client";
import { computed, type Ref, ref } from "vue";

import { manual } from "@/utils/manual";

import { useLayout } from "../components/weblet_layout.vue";
import { useGrid, useProfileManager } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";
const layout = useLayout();
const profileManager = useProfileManager();
const name = ref(generateName({ prefix: "ds" }));
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/idrnd.3bot/logismosis-dashboard_suite-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const ipv4 = ref(true);
const ipv6 = ref(true);
const network = ref("main");
const seedPhrase = ref("");
const mycelium = ref(true);
const planetary = ref(false);
const rootFilesystemSize = computed(() =>
  calculateRootFileSystem({ CPUCores: solution.value?.cpu ?? 0, RAMInMegaBytes: solution.value?.memory ?? 0 }),
);
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;
function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Dashboard Suite instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.dashboardsuite);
}
async function deploy() {
  layout.value.setStatus("deploy");
  const projectName = ProjectName.DashboardSuite.toLowerCase() + "/" + name.value;
  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = selectionDetails.value?.domain?.enabledCustomDomain
    ? selectionDetails.value.domain.customDomain
    : subdomain + "." + selectionDetails.value?.domain?.selectedDomain?.publicConfig.domain;
  let vm: any;
  try {
    layout.value?.validateSSH();
    updateGrid(grid, { projectName });
    await layout.value.validateBalance(grid!);
    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: selectionDetails.value!.domain!.enableSelectedDomain,
        accessNodeId: selectionDetails.value?.domain?.selectedDomain?.nodeId,
      },
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: [{ size: solution?.value.disk, mountPoint: "/data" }],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          mycelium: mycelium.value,
          planetary: planetary.value,
          envs: [
            { key: "SSH_KEY", value: selectedSSHKeys.value },
            { key: "DOMAIN", value: domain },
            { key: "NETWORK", value: network.value },
            { key: "SEED", value: seedPhrase.value },
          ],
          nodeId: selectionDetails.value!.node!.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
          rootFilesystemSize: rootFilesystemSize.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Dashboard Suite instance."));
  }
  if (!selectionDetails.value?.domain?.enableSelectedDomain) {
    vm[0].customDomain = selectionDetails.value?.domain?.customDomain;
    finalize(vm);
    return;
  }
  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");
    await deployGatewayName(grid, selectionDetails.value.domain, {
      subdomain,
      ip: vm[0].interfaces[0].ip,
      port: 80,
      network: vm[0].interfaces[0].network,
    });
    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Dashboard Suite instance."));
  }
}
function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}
</script>
<script lang="ts">
import Networks from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
export default {
  name: "TFDashboardSuite",
  components: { SelectSolutionFlavor, Networks, ManageSshDeployemnt },
};
</script>
