<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="disks.reduce((total, disk) => total + disk.size, rootFilesystemSize)"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/vm.png"
  >
    <template #title>Deploy Holochain</template>

    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Disks', value: 'disks' },
      ]"
      ref="tabs"
    >
      <template #config>
        <input-validator
          :value="name"
          :rules="[
            validators.required('Name is required.'),
            validators.isLowercase('Name should consist of lowercase letters only.'),
            validators.isAlphanumeric('Name should consist of alphabets & numbers only.'),
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
            <input-tooltip tooltip="Admin password.">
              <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
            </input-tooltip>
          </input-validator>
        </password-input-wrapper>

        <SelectSolutionFlavor
          :small="{ cpu: 4, memory: 8, disk: 30 }"
          :medium="{ cpu: 6, memory: 16, disk: 60 }"
          :large="{ cpu: 12, memory: 32, disk: 120 }"
          v-model="solution"
        />

        <Network
          required
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:wireguard="wireguard"
          ref="network"
        />
        <input-tooltip
          inline
          tooltip="Click to know more about dedicated machines."
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
            ipv6,
            certified,
            dedicated,
            cpu: solution?.cpu,
            ssdDisks: disks.map(disk => disk.size),
            solutionDisk: solution?.disk,
            memory: solution?.memory,
            rootFilesystemSize,
          }"
          v-model="selectionDetails"
        />
      </template>

      <template #disks>
        <ExpandableLayout v-model="disks" @add="addDisk" title="Add additional disk space" #="{ index }">
          <p class="text-h6 mb-4">Disk #{{ index + 1 }}</p>
          <input-validator
            :value="disks[index].name"
            :rules="[
              validators.required('Disk name is required.'),
              validators.pattern('Disk name can\'t start with a number, a non-alphanumeric character or a whitespace', {
                pattern: /^[A-Za-z]/,
              }),
              validators.minLength('Disk minLength is 2 chars.', 2),
              validators.isAlphanumeric('Disk name only accepts alphanumeric chars.'),
              validators.maxLength('Disk maxLength is 15 chars.', 15),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Disk name.">
              <v-text-field label="Name" v-model="disks[index].name" v-bind="props" />
            </input-tooltip>
          </input-validator>
          <input-validator
            :value="disks[index].size"
            :rules="[
              validators.required('Disk size is required.'),
              validators.isInt('Disk size must be a valid integer.'),
              validators.min('Minimum allowed disk size is 1 GB.', 1),
              validators.max('Maximum allowed disk size is 10000 GB.', 10000),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Disk Size.">
              <v-text-field label="Size (GB)" type="number" v-model.number="disks[index].size" v-bind="props" />
            </input-tooltip>
          </input-validator>
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="secondary" variant="outlined" :disabled="tabs?.invalid || network?.error" @click="deploy"
        >Deploy</v-btn
      >
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";

import Network from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Flist, ProjectName } from "../types";
import { deployVM, type Disk, type Env } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();
const name = ref(generateName({ prefix: "hc" }));
const password = ref(generatePassword());
const flist: Flist = {
  value: "https://hub.grid.tf/mariobassem1.3bot/threefolddev-holochain-latest.flist",
  entryPoint: "/usr/local/bin/entrypoint.sh",
};
const ipv4 = ref(false);
const ipv6 = ref(false);
const planetary = ref(true);
const wireguard = ref(false);
const disks = ref<Disk[]>([]);
const network = ref();
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = computed(() => solution.value?.disk);
const selectionDetails = ref<SelectionDetails>();

function addDisk() {
  const name = generateName();
  disks.value.push({
    name: "disk" + name,
    size: 50,
    mountPoint: "/mnt/" + name,
  });
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.VM.toLowerCase() + "/" + name.value;

  try {
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
          flist: flist.value,
          entryPoint: flist.entryPoint,
          disks: disks.value,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            {
              key: "CODE_SERVER_PASSWORD",
              value: password.value,
            },
          ],
          planetary: planetary.value,
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          rootFilesystemSize: rootFilesystemSize.value,
          nodeId: selectionDetails.value?.node?.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a micro virtual machine.");
    layout.value.openDialog(vm, deploymentListEnvironments.vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy micro virtual machine instance."));
  }
}
</script>

<script lang="ts">
import ExpandableLayout from "../components/expandable_layout.vue";
import { deploymentListEnvironments } from "../constants";
import type { solutionFlavor as SolutionFlavor } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { normalizeError } from "../utils/helpers";

const solution = ref() as Ref<SolutionFlavor>;

export default {
  name: "MicroVm",
  components: {
    SelectSolutionFlavor,
    ExpandableLayout,
  },
};
</script>
