<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + rootFilesystemSize"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/nextcloud.png"
  >
    <template #title>Deploy a Nextcloud All-in-One Instance </template>

    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.isLowercase('Name should consist of lowercase letters only.'),
          validators.isAlphanumeric('Name should consist of letters and numbers only.'),
          name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
          validators.minLength('Name must be at least 2 characters.', 2),
          validators.maxLength('Name cannot exceed 15 characters.', 15),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Instance name.">
          <v-text-field label="Name" v-model="name" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <SelectSolutionFlavor
        :small="{ cpu: 2, memory: 4, disk: 50 }"
        :medium="{ cpu: 4, memory: 8, disk: 500 }"
        :large="{ cpu: 4, memory: 16, disk: 1000 }"
        v-model="solution"
      />
      <Networks v-model:ipv4="ipv4" v-model:mycelium="mycelium" />

      <input-tooltip
        inline
        tooltip="Click to know more about dedicated machines."
        href="https://www.manual.grid.tf/documentation/dashboard/deploy/dedicated_machines.html"
      >
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
      </input-tooltip>

      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
      </input-tooltip>

      <TfSelectionDetails
        :filters="{
          ipv4,
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
    </form-validator>

    <template #footer-actions>
      <v-btn color="secondary" variant="outlined" @click="deploy()" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { computed, type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const name = ref(generateName({ prefix: "nc" }));
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/threefoldtech-nextcloudaio-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const ipv4 = ref(false);
const mycelium = ref(false);
const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
const selectionDetails = ref<SelectionDetails>();

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus(
    "success",
    "Successfully deployed a Nextcloud instance. Under Actions, click on the button Nextcloud Setup to set up Nextcloud. After installation, you can access the Nextcloud instance by clicking on the Open Nextcloud button or navigating to your Nextcloud domain.",
  );
  layout.value.openDialog(deployment, deploymentListEnvironments.nextcloud);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Nextcloud.toLowerCase() + "/" + name.value;

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });

  const domain = selectionDetails.value!.domain!.enabledCustomDomain
    ? selectionDetails.value!.domain!.customDomain
    : subdomain + "." + selectionDetails.value!.domain!.selectedDomain?.publicConfig.domain;

  const has_gateway = !(selectionDetails.value!.domain!.enabledCustomDomain && ipv4.value);
  const aio_link = domain + "/aio";

  let grid: GridClient | null;
  let vm: any;

  try {
    layout.value?.validateSSH();
    grid = await getGrid(profileManager.profile!, projectName);

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
              mountPoint: "/mnt/data",
            },
          ],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          publicIpv4: ipv4.value,
          mycelium: mycelium.value,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "NEXTCLOUD_DOMAIN", value: domain },
            { key: "NEXTCLOUD_AIO_LINK", value: aio_link },
            { key: "GATEWAY", value: String(has_gateway) },
            { key: "IPV4", value: String(ipv4.value) },
          ],
          nodeId: selectionDetails.value!.node!.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
          rootFilesystemSize: rootFilesystemSize.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Nextcloud instance."));
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
    layout.value.setStatus("deploy", "Rolling back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Nextcloud instance."));
  }
}
</script>

<script lang="ts">
import Networks from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import rootFs from "../utils/root_fs";

export default {
  name: "TFNextcloud",
  components: { SelectSolutionFlavor, Networks },
};
</script>
