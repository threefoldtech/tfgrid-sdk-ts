<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + 10 + rootFilesystemSize"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
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
            validators.pattern('Password should not contain whitespaces.', {
              pattern: /^[^\s]+$/,
            }),
          ]"
          #="{ props: validatorProps }"
        >
          <input-tooltip tooltip="Umbrel admin password.">
            <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
          </input-tooltip>
        </input-validator>
      </password-input-wrapper>

      <Network required ref="network" v-model:ipv4="ipv4" v-model:planetary="planetary" v-model:wireguard="wireguard" />

      <SelectSolutionFlavor
        v-model="solution"
        :small="{ cpu: 1, memory: 2, disk: 10 }"
        :medium="{ cpu: 2, memory: 4, disk: 50 }"
        :large="{ cpu: 4, memory: 16, disk: 100 }"
      />

      <input-tooltip
        inline
        tooltip="Click to know more about dedicated nodes."
        href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
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
          ssdDisks: [10],
          memory: solution?.memory,
          rootFilesystemSize,
        }"
        v-model="selectionDetails"
      />
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();
const name = ref(generateName({ prefix: "um" }));
const username = ref("admin");
const password = ref(generatePassword());
const ipv4 = ref(false);
const planetary = ref(true);
const wireguard = ref(false);
const network = ref();
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
const selectionDetails = ref<SelectionDetails>();

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Umbrel.toLowerCase() + "/" + name.value;

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: wireguard.value,
      },
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
          planetary: planetary.value,
          publicIpv4: ipv4.value,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "USERNAME", value: username.value },
            { key: "PASSWORD", value: password.value },
            { key: "UMBREL_DISK", value: "/umbrelDisk" },
          ],
          rootFilesystemSize: rootFilesystemSize.value,
          nodeId: selectionDetails.value!.node!.nodeId,
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
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";

export default {
  name: "TfUmbrel",
  components: { SelectSolutionFlavor },
};
</script>
