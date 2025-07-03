<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="disks.reduce((total, disk) => total + disk.size, solution?.disk ?? 0)"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :rented-by="rentedBy"
    :selected-node="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/vm.png"
    @mount="layoutMount"
  >
    <template #title> Deploy a Micro Virtual Machine </template>

    <d-tabs
      ref="tabs"
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Environment Variables', value: 'env' },
        { title: 'Disks', value: 'disks' },
      ]"
    >
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
            <v-text-field v-model="name" label="Name" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <SelectVmImage v-model="flist" :images="images" />
        <SelectSolutionFlavor
          v-model="solution"
          :small="{ cpu: 1, memory: 2, disk: 25 }"
          :medium="{ cpu: 2, memory: 4, disk: 50 }"
          :large="{ cpu: 4, memory: 16, disk: 100 }"
        />

        <Networks
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:mycelium="mycelium"
          v-model:wireguard="wireguard"
          required
        />

        <!-- <input-tooltip inline tooltip="" :href="manual"> -->
        <v-switch v-model="rentedByMe" color="primary" inset label="Rented By Me" hide-details />
        <!-- </input-tooltip> -->

        <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
          <v-switch v-model="dedicated" color="primary" inset label="Rentable" hide-details />
        </input-tooltip>

        <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
          <v-switch v-model="certified" color="primary" inset label="Certified" hide-details />
        </input-tooltip>

        <TfSelectionDetails
          v-model="selectionDetails"
          :filters="{
            ipv4,
            ipv6,
            certified,
            dedicated,
            rentedBy,
            cpu: solution?.cpu,
            ssdDisks: disks.map(disk => disk.size),
            memory: solution?.memory,
            rootFilesystemSize: solution?.disk,
            planetary,
            mycelium,
            wireguard,
          }"
        />

        <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
      </template>

      <template #env>
        <ExpandableLayout
          v-model="envs"
          #="{ index, isRequired }"
          :required="[0]"
          @add="envs.push({ key: '', value: '' })"
        >
          <input-validator
            :value="envs[index].key"
            :rules="[
              validators.required('Key name is required.'),
              (key: string) => validators.isAlpha('Key must start with alphabetical character.')(key[0]),
              validators.pattern('Invalid key format.', { pattern: /^[^0-9_\s][a-zA-Z0-9_]+$/ }),
              validators.maxLength('Key maximum length is 128 characters.', 128),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Environment key.">
              <v-text-field v-model="envs[index].key" label="Name" :disabled="isRequired" v-bind="props" />
            </input-tooltip>
          </input-validator>

          <input-validator
            :value="envs[index].value"
            :rules="[validators.required('Value is required.')]"
            #="{ props }"
          >
            <input-tooltip tooltip="Environment Value.">
              <v-textarea v-model="envs[index].value" label="Value" no-resize :spellcheck="false" />
            </input-tooltip>
          </input-validator>
        </ExpandableLayout>
      </template>

      <template #disks>
        <ExpandableLayout
          v-model="disks"
          title="Add additional disk space to your micro virtual machine"
          #="{ index }"
          @add="addDisk"
        >
          <p class="text-h6 mb-4">Disk #{{ index + 1 }}</p>
          <input-validator
            :value="disks[index].name"
            :rules="[
              validators.required('Disk name is required.'),
              validators.pattern('Disk name can\'t start with a number, a non-alphanumeric character or a whitespace', {
                pattern: /^[A-Za-z]/,
              }),
              validators.minLength('Disk name minimum length is 2 characters.', 2),
              validators.isAlphanumeric('Disk name only accepts alphanumeric characters.'),
              validators.maxLength('Disk name maximum length is 35 characters.', 35),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Disk name.">
              <v-text-field v-model="disks[index].name" label="Name" v-bind="props" />
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
              <v-text-field v-model.number="disks[index].size" label="Size (GB)" type="number" v-bind="props" />
            </input-tooltip>
          </input-validator>
          <input-validator
            :value="disks[index].mountPoint"
            :rules="[
              validators.required('Mount Point is required.'),
              validators.pattern('Mount Point should start with / and have additional characters', {
                pattern: /^\/.+/,
              }),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Disk Size.">
              <v-text-field v-model="disks[index].mountPoint" label="Mount Point" type="text" v-bind="props" />
            </input-tooltip>
          </input-validator>
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn
        variant="elevated"
        class="text-primery px-10 py-3 h-auto text-subtitle-1"
        text="Deploy"
        @click="validateBeforeDeploy(deploy)"
      />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";

import { manual } from "@/utils/manual";

import Networks, { useNetworks } from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useGrid } from "../stores";
import { type Flist, ProjectName } from "../types";
import { deployVM, type Disk, type Env } from "../utils/deploy_vm";
import { generateName } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const flists = [
  FLISTS.MICROVMS_UBUNTU_24,
  FLISTS.MICROVMS_UBUNTU_23,
  FLISTS.MICROVMS_UBUNTU_22,
  // FLISTS.MICROVMS_NIXOS,
  FLISTS.MICROVMS_DEBIAN_12,
  FLISTS.MICROVMS_CENTOS_9,
  FLISTS.MICROVMS_ARCH,
  FLISTS.MICROVMS_ALPINE_3,
];
const images: VmImage[] = flists;

const name = ref(generateName({ prefix: "vm" }));
const flist = ref<Flist>();
const { ipv4, ipv6, planetary, mycelium, wireguard } = useNetworks();
const envs = ref<Env[]>([]);
const disks = ref<Disk[]>([]);
const dedicated = ref(false);
const rentedByMe = ref(false);
const rentedBy = computed(() => (rentedByMe.value ? grid.twinId : undefined));
const certified = ref(false);
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

function layoutMount() {
  if (envs.value.length > 0) {
    envs.value.splice(0, 1);
  }

  envs.value.unshift({
    key: "SSH_KEY",
    value: selectedSSHKeys.value,
  });
}

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
    updateGrid(grid, { projectName });

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
          flist: flist.value!.value,
          entryPoint: flist.value!.entryPoint,
          disks: disks.value,
          envs: envs.value,
          planetary: planetary.value,
          mycelium: mycelium.value,
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          rootFilesystemSize: solution.value?.disk,
          nodeId: selectionDetails.value?.node?.nodeId,
          rentedBy: rentedBy.value,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a micro virtual machine instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy micro virtual machine instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
  layoutMount();
}
</script>

<script lang="ts">
import { FLISTS, type GridClient } from "@threefold/grid_client";

import ExpandableLayout from "../components/expandable_layout.vue";
import type { VmImage } from "../components/select_vm_image.vue";
import SelectVmImage from "../components/select_vm_image.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { solutionFlavor as SolutionFlavor } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const solution = ref() as Ref<SolutionFlavor>;

export default {
  name: "MicroVm",
  components: {
    SelectVmImage,
    SelectSolutionFlavor,
    ExpandableLayout,
  },
};
</script>
