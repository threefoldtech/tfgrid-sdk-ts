<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :ipv4="ipv4"
    :disk="disks.reduce((total, disk) => total + disk.size, solution?.disk + 2)"
    :dedicated="dedicated"
    :rentedBy="rentedBy"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/openwebui.png"
  >
    <template #title> Deploy an Open WebUI Instance </template>

    <d-tabs :tabs="[{ title: 'Config', value: 'config' }]">
      <template #config>
        <input-validator
          :value="name"
          :rules="[
              validators.required('Name is required.'),
              validators.IsAlphanumericExpectUnderscore('Name should consist of letters ,numbers and underscores only.'),
              (name: string) => validators.isAlpha('Name must start with an alphabetical character.')(name[0]),
              validators.minLength('Name must be at least 2 characters.', 2),
              validators.maxLength('Name cannot exceed 35 characters.', 35),
            ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Instance name.">
            <v-text-field label="Name" v-model="name" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <SelectSolutionFlavor
          :small="{ cpu: 2, memory: 8, disk: 25 }"
          :medium="{ cpu: 4, memory: 16, disk: 50 }"
          :large="{ cpu: 8, memory: 32, disk: 100 }"
          v-model="solution"
        />

        <Networks
          required
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:mycelium="mycelium"
          v-model:wireguard="wireguard"
          :has-custom-domain="selectionDetails?.domain?.enabledCustomDomain"
          require-domain
        />
        <input-tooltip
          inline
          tooltip="
            Selecting a Node with GPU.
            When selecting a node with GPU resources, please make sure that you have a rented node. To rent a node and gain access to GPU capabilities, you can use our dashboard.
            "
        >
          <v-switch color="primary" inset label="GPU" v-model="hasGPU" hide-details />
        </input-tooltip>

        <v-switch color="primary" inset label="Rented By Me" v-model="rentedByMe" hide-details />

        <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
          <v-switch color="primary" inset label="Rentable" v-model="dedicated" hide-details />
        </input-tooltip>

        <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
          <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
        </input-tooltip>

        <TfSelectionDetails
          :filters="{
            ipv4,
            ipv6,
            hasGPU,
            certified,
            dedicated,
            rentedBy,
            cpu: solution?.cpu,
            ssdDisks: disks.map(disk => disk.size),
            solutionDisk: solution?.disk,
            memory: solution?.memory,
            rootFilesystemSize,
            planetary,
            mycelium,
            wireguard,
          }"
          require-domain
          v-model="selectionDetails"
        />

        <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn
        variant="elevated"
        class="text-primery px-10 py-3 h-auto text-subtitle-1"
        @click="validateBeforeDeploy(deploy)"
        text="Deploy"
      />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref, watch } from "vue";

import { manual } from "@/utils/manual";

import Networks, { useNetworks } from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useGrid, useProfileManager } from "../stores";
import type { solutionFlavor as SolutionFlavor } from "../types";
import { type Flist, ProjectName } from "../types";
import { deployVM, type Disk } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";

const selectionDetails = ref<SelectionDetails>();

const layout = useLayout();
const profileManager = useProfileManager();
const solution = ref() as Ref<SolutionFlavor>;
const selectedSSHKeys = ref("");
const name = ref(generateName({ prefix: "oi" }));
const flist = ref<Flist>({
  name: "Ubuntu-24.04 Open WebUI Instance",
  value: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-24.04_fullvm_oi.flist",
  entryPoint: "",
});
const { ipv4, ipv6, mycelium, planetary, wireguard } = useNetworks();
const dedicated = ref(false);
const rentedByMe = ref(false);
const rentedBy = computed(() => (rentedByMe.value ? grid.twinId : undefined));
const certified = ref(false);
const disks = ref<Disk[]>([]);
const hasGPU = ref(false);
const rootFilesystemSize = computed(() => solution.value?.disk);
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

watch(
  [dedicated, rentedByMe],
  ([dedicated, rentedByMe]) => {
    if (dedicated === false && rentedByMe === false) {
      hasGPU.value = dedicated;
    }
  },
  { immediate: true },
);

watch(
  hasGPU,
  hasGPU => {
    if (hasGPU) {
      dedicated.value = true;
      rentedByMe.value = true;
    }
  },
  { immediate: true },
);

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus(
    "success",
    `Successfully deployed an Open WebUI instance. Please keep in mind that the installation may take a few minutes to finish. If you encounter a "Bad Gateway" message while accessing the webpage, just wait a moment and refresh the page.`,
  );
  layout.value.openDialog(deployment, deploymentListEnvironments.openwebui);
}
async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Openwebui.toLowerCase() + "/" + name.value;

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });

  const domain = selectionDetails.value!.domain!.enabledCustomDomain
    ? selectionDetails.value!.domain!.customDomain
    : subdomain + "." + selectionDetails.value!.domain!.selectedDomain?.publicConfig.domain;

  let vm: any;
  try {
    layout.value?.validateSSH();
    updateGrid(grid, { projectName });

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          flist: flist.value!.value,
          entryPoint: flist.value!.entryPoint,
          disks: [...disks.value],
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          planetary: planetary.value,
          mycelium: mycelium.value,
          envs: [
            { key: "SSH_KEY", value: selectedSSHKeys.value },
            { key: "OPENWEBUI_DOMAIN", value: domain },
          ],
          rootFilesystemSize: rootFilesystemSize.value,
          hasGPU: hasGPU.value,
          nodeId: selectionDetails.value?.node?.nodeId,
          gpus: hasGPU.value ? selectionDetails.value?.gpuCards.map(card => card.id) : undefined,
          rentedBy: rentedBy.value,
          certified: certified.value,
        },
      ],
      network: {
        addAccess: wireguard.value || selectionDetails.value!.domain!.enableSelectedDomain,
        accessNodeId: selectionDetails.value?.domain?.selectedDomain?.nodeId,
      },
    });
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy an Open WebUI instance."));
  }

  if (!selectionDetails.value?.domain?.enableSelectedDomain) {
    vm[0].customDomain = selectionDetails.value!.domain!.customDomain;
    finalize(vm);
    return;
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid, selectionDetails.value?.domain, {
      subdomain,
      ip: vm[0].interfaces[0].ip,
      port: 8080,
      network: vm[0].interfaces[0].network,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy an Open WebUI instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}
</script>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";

import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";

export default {
  name: "TfOpenwebui",
  components: {
    SelectSolutionFlavor,
    ManageSshDeployemnt,
  },
};
</script>
