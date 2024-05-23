<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    :dedicated="dedicated"
    ipv4
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/vm.png"
  >
    <template #title>Deploy a Node Pilot</template>
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
        :small="{ cpu: 4, memory: 8, disk: 500 }"
        :medium="{ cpu: 8, memory: 16, disk: 1000 }"
        :large="{ cpu: 8, memory: 32, disk: 2000 }"
        v-model="solution"
      />

      <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
      </input-tooltip>

      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
      </input-tooltip>

      <TfSelectionDetails
        :filters="{
          ipv4: true,
          certified,
          dedicated,
          cpu: solution?.cpu,
          memory: solution?.memory,
          solutionDisk: solution?.disk,
          rootFilesystemSize,
        }"
        v-model="selectionDetails"
      />

      <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
    </form-validator>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn color="secondary" variant="outlined" @click="validateBeforeDeploy(deploy)" text="Deploy" />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";

import { manual } from "@/utils/manual";

import { useLayout } from "../components/weblet_layout.vue";
import { useGrid } from "../stores";
import { type Flist, ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { generateName } from "../utils/strings";
const layout = useLayout();
const valid = ref(false);
const name = ref(generateName({ prefix: "np" }));
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
  entryPoint: "/",
};
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = 2;
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.NodePilot.toLowerCase() + "/" + name.value;

  try {
    layout.value?.validateSSH();
    updateGrid(grid, { projectName });

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          flist: flist.value,
          entryPoint: flist.entryPoint,
          publicIpv4: true,
          publicIpv6: true,
          planetary: false,
          envs: [{ key: "SSH_KEY", value: selectedSSHKeys.value }],
          rootFilesystemSize,
          disks: [
            {
              size: solution.value.disk,
              mountPoint: "/",
            },
          ],
          nodeId: selectionDetails.value!.node!.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a node pilot instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Node Pilot instance."));
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
import type { solutionFlavor as SolutionFlavor } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export default {
  name: "NodePilot",
  components: { ManageSshDeployemnt, SelectSolutionFlavor },
};
</script>
