<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/subsquid.png"
  >
    <template #title>Deploy an Expose Instance </template>

    <d-tabs :tabs="[{ title: 'Config', value: 'config' }]">
      {{ selectionDetails }}
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

      <SelectSolutionFlavor
        v-model="solution"
        :small="{ cpu: 1, memory: 2, disk: 50 }"
        :medium="{ cpu: 2, memory: 4, disk: 100 }"
      />

      <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
      </input-tooltip>

      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
      </input-tooltip>

      <TfSelectionDetails
        require-domain
        :filters="{
          certified,
          dedicated,
          cpu: solution?.cpu,
          solutionDisk: solution?.disk,
          memory: solution?.memory,
          rootFilesystemSize,
        }"
        v-model="selectionDetails"
      />
      <input-tooltip tooltip="Selecting custom domain sets subdomain as gateway name.">
        <input-validator
          :value="subdomain"
          :rules="[
            validators.required('Subdomain is required.'),
            validators.isLowercase('Subdomain should consist of lowercase letters only.'),
            validators.isAlphanumeric('Subdomain should consist of letters and numbers only.'),
            subdomain => validators.isAlpha('Subdomain must start with alphabet char.')(subdomain[0]),
            validators.minLength('Subdomain must be at least 4 characters.', 4),
            subdomain => validators.maxLength('Subdomain cannot exceed 50 characters.', 50)(subdomain),
          ]"
          #="{ props }"
        >
          <v-text-field label="Subdomain" v-model.trim="subdomain" v-bind="props" />
        </input-validator>
      </input-tooltip>

      <input-tooltip tooltip="Port used to access the machine.">
        <input-validator
          :value="port"
          :rules="[validators.required('Port is required.'), validators.isPort('Please provide a valid port.')]"
          #="{ props }"
        >
          <v-text-field label="Port" v-model.number="port" type="number" v-bind="props" />
        </input-validator>
      </input-tooltip>

      <input-tooltip
        tooltip="User's machine's public IP , It could be Mycelium IP, Yggdrasil IP, or a public IP (IPv4 or IPv6)."
      >
        <input-validator :value="ip" :rules="[validators.required('Public IP is required.')]" #="{ props }">
          <v-text-field label="Public IP" v-model="ip" v-bind="props" />
        </input-validator>
      </input-tooltip>

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
import { useGrid } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, rollbackDeployment } from "../utils/gateway";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";

const layout = useLayout();
const name = ref(generateName({ prefix: "ex" }));
const ip = ref();
const mycelium = ref(true);
const solution = ref() as Ref<SolutionFlavor>;
const subdomain = ref("");
const port = ref(80);
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist",
  entryPoint: "/init.sh",
};
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = computed(() =>
  calculateRootFileSystem({ CPUCores: solution.value?.cpu ?? 0, RAMInMegaBytes: solution.value?.memory ?? 0 }),
);
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed an Expose instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.expose);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Expose.toLowerCase() + "/" + name.value;
  console.log(projectName);
  const domain = selectionDetails.value?.domain?.enabledCustomDomain
    ? selectionDetails.value.domain.customDomain
    : subdomain.value + "." + selectionDetails.value?.domain?.selectedDomain?.publicConfig.domain;

  let vm: any;

  try {
    layout.value?.validateSSH();
    updateGrid(grid, { projectName });
    console.log(name.value);

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
          disks: [
            {
              size: solution.value.disk,
              mountPoint: "/var/lib/docker",
            },
          ],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          publicIpv4: false,
          publicIpv6: false,
          mycelium: mycelium.value,
          planetary: false,
          envs: [
            { key: "SSH_KEY", value: selectedSSHKeys.value },
            { key: "EXPOSE_WEBSERVER_HOSTNAME", value: domain },
          ],
          nodeId: selectionDetails.value!.node!.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
          rootFilesystemSize: rootFilesystemSize.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Subsquid instance."));
  }

  if (!selectionDetails.value?.domain?.enableSelectedDomain) {
    vm[0].customDomain = selectionDetails.value?.domain?.customDomain;
    finalize(vm);
    return;
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid, selectionDetails.value.domain, {
      subdomain: subdomain.value,
      ip: ip.value,
      port: port.value,
      network: vm[0].interfaces[0].network,
    });
    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Subsquid instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}
</script>

<script lang="ts">
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
export default {
  name: "TfExpose",
  components: { SelectSolutionFlavor, ManageSshDeployemnt },
};
</script>
