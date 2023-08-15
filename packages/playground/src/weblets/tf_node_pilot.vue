<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="32"
    :certified="certified"
    :dedicated="dedicated"
    ipv4
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

      <input-validator
        :value="cpu"
        :rules="[
          validators.required('CPU is required.'),
          validators.isInt('CPU must be a valid integer.'),
          validators.min('CPU min is 8 cores.', 8),
          validators.max('CPU max is 32 cores.', 32),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="The number of virtual cores allocated to your instance.">
          <v-text-field label="CPU (vCores)" type="number" v-model.number="cpu" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="memory"
        :rules="[
          validators.required('Memory is required.'),
          validators.isInt('Memory must be a valid integer.'),
          validators.min('Minimum allowed memory is 8192 MB.', 8192),
          validators.max('Maximum allowed memory is 256 GB.', 256 * 1024),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
          <v-text-field
            label="Memory (MB)"
            type="number"
            v-model.number="memory"
            v-bind="props"
            :disabled="loadingFarm"
          />
        </input-tooltip>
      </input-validator>

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
        <SelectFarmId
          :filters="{
            cpu,
            memory,
            ssd: 30 + rootFilesystemSize,
            publicIp: true,
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
            cpu,
            memory,
            ipv4: true,
            diskSizes: [15, 15],
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
          :root-file-system-size="rootFilesystemSize"
        />
      </SelectFarmManager>
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { generateName } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();
const loadingFarm = ref(false);
const name = ref(generateName(8, { prefix: "np" }));
const cpu = ref(8);
const memory = ref(8192);
const farm = ref() as Ref<Farm>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
  entryPoint: "/",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const rootFilesystemSize = 2;
async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.NodePilot.toLowerCase();

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu.value,
          memory: memory.value,
          flist: flist.value,
          entryPoint: flist.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          publicIpv4: true,
          publicIpv6: true,
          planetary: false,
          envs: [{ key: "SSH_KEY", value: profileManager.profile!.ssh }],
          rootFilesystemSize,
          disks: [
            {
              size: 15,
              mountPoint: "/mnt/" + generateName(10),
            },
            {
              size: 15,
              mountPoint: "/mnt/" + generateName(10),
            },
          ],
          nodeId: selectedNode.value.nodeId,
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
</script>

<script lang="ts">
import SelectFarmId from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";

export default {
  name: "NodePilot",
  components: {
    SelectFarmId,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
