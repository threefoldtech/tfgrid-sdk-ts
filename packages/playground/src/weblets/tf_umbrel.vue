<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + 10 + rootFilesystemSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/umbrel.png"
  >
    <template #title>Deploy an Umbrel Instance </template>

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
        :value="username"
        :rules="[
          validators.required('Username is required.'),
          validators.isLowercase('Username should consist of lowercase letters only.'),
          validators.isAlphanumeric('Username should consist of letters and numbers only.'),
          username => validators.isAlpha('Username must start with alphabet char.')(username[0]),
          validators.minLength('Username must be at least 2 characters.', 2),
          validators.maxLength('Username cannot exceed 15 characters.', 15),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Umbrel admin username.">
          <v-text-field label="Username" v-model="username" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <password-input-wrapper #="{ props }">
        <input-validator
          :value="password"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password must be at least 6 characters.', 6),
            validators.maxLength('Password cannot exceed 15 characters.', 15),
          ]"
          #="{ props: validatorProps }"
        >
          <input-tooltip tooltip="Umbrel admin password.">
            <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
          </input-tooltip>
        </input-validator>
      </password-input-wrapper>

      <Network v-model:ipv4="ipv4" :disabled="loadingFarm" />

      <SelectSolutionFlavor
        v-model="solution"
        :minimum="{ cpu: 2, memory: 1024 * 2, disk: 10 }"
        :standard="{ cpu: 2, memory: 1024 * 4, disk: 50 }"
        :recommended="{ cpu: 4, memory: 1024 * 4, disk: 100 }"
        :disabled="loadingFarm"
      />

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
            ssd: (solution?.disk ?? 0) + 10 + rootFilesystemSize,
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
            diskSizes: [10, solution?.disk],
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
import { computed, type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "um" }));
const username = ref("admin");
const password = ref(generatePassword());
const ipv4 = ref(false);
const solution = ref() as Ref<SolutionFlavor>;
const farm = ref() as Ref<Farm>;
const loadingFarm = ref(false);
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Umbrel.toLowerCase();

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: [
            {
              size: 10,
              mountPoint: "/var/lib/docker",
            },
            {
              size: solution.value.disk,
              mountPoint: "/umbrelDisk",
            },
          ],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          planetary: true,
          publicIpv4: ipv4.value,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "USERNAME", value: username.value },
            { key: "PASSWORD", value: password.value },
            { key: "UMBREL_DISK", value: "/umbrelDisk" },
          ],
          rootFilesystemSize: rootFilesystemSize.value,
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed an Umbrel instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.umbrel);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy an Umbrel instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";

export default {
  name: "TfUmbrel",
  components: {
    SelectSolutionFlavor,
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
