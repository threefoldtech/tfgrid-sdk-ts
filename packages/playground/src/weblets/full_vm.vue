<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="disks.reduce((total, disk) => total + disk.size, diskSize + 2)"
    :ivp4="ipv4"
    title-image="images/icons/vm.png"
  >
    <template #title> Deploy a Full Virtual Machine </template>
    <template #subtitle
      >Deploy a new full virtual machine on the Threefold Grid
      <a class="app-link" href="https://manual.grid.tf/weblets/weblets_fullVm.html" target="_blank">
        Quick start documentation
      </a>
      .
    </template>

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
            validators.isAlphanumeric('Name should consist of letters and numbers only.'),
            name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
            validators.minLength('Name must be at least 2 characters.', 2),
            validators.maxLength('Name cannot exceed 15 characters.', 15),
          ]"
          #="{ props }"
        >
          <input-tooltip #="{ tooltipProps }" tooltip="Solution name.">
            <v-text-field label="Name" v-model="name" v-bind="{ ...props, ...tooltipProps }" />
          </input-tooltip>
        </input-validator>

        <SelectVmImage :images="images" v-model="flist" />

        <input-validator
          :value="cpu"
          :rules="[
            validators.required('CPU is required.'),
            validators.isInt('CPU must be a valid integer.'),
            validators.min('CPU min is 1 cores.', 1),
            validators.max('CPU max is 32 cores.', 32),
          ]"
          #="{ props }"
        >
          <input-tooltip #="{ tooltipProps }" tooltip="the number of virtual cores allocated to your solution.">
            <v-text-field
              label="CPU (vCores)"
              type="number"
              v-model.number="cpu"
              v-bind="{ ...props, ...tooltipProps }"
            />
          </input-tooltip>
        </input-validator>

        <input-validator
          :value="memory"
          :rules="[
            validators.required('Memory is required.'),
            validators.isInt('Memory must be a valid integer.'),
            validators.min('Minimum allowed memory is 256 MB.', 256),
            validators.max('Maximum allowed memory is 256 GB.', 256 * 1024),
          ]"
          #="{ props }"
        >
          <input-tooltip
            #="{ tooltipProps }"
            tooltip="Memory (MB) refers to the amount of RAM (Random Access Memory) allocated to your solution."
          >
            <v-text-field
              label="Memory (MB)"
              type="number"
              v-model.number="memory"
              v-bind="{ ...props, ...tooltipProps }"
            />
          </input-tooltip>
        </input-validator>

        <input-validator
          :value="diskSize"
          :rules="[
            validators.required('Disk size is required.'),
            validators.isInt('Disk size must be a valid integer.'),
            validators.min('Minimum allowed disk size is 15 GB.', 15),
            validators.max('Maximum allowed disk size is 10000 GB.', 10000),
          ]"
          #="{ props }"
        >
          <input-tooltip
            #="{ tooltipProps }"
            tooltip="Disk Size (GB) refers to the storage capacity allocated to your solution, indicating the amount of space available to store files, data, and applications."
          >
            <v-text-field
              label="Disk Size (GB)"
              type="number"
              v-model.number="diskSize"
              v-bind="{ ...props, ...tooltipProps }"
            />
          </input-tooltip>
        </input-validator>

        <v-tooltip
          location="top"
          text="Public IPv4 refers to an Internet Protocol version 4 address that is globally unique and accessible over the internet."
        >
          <template v-slot:activator="{ props }">
            <v-switch color="primary" inset label="Public IPv4" v-model="ipv4" v-bind="props" />
          </template>
        </v-tooltip>

        <v-tooltip
          location="top"
          text="Public IPv6 is the next-generation Internet Protocol that offers an expanded address space to connect a vast number of devices."
        >
          <template v-slot:activator="{ props }">
            <v-switch color="primary" inset label="Public IPv6" v-model="ipv6" v-bind="props" />
          </template>
        </v-tooltip>

        <v-tooltip
          location="top"
          text="The Planetary Network is a distributed network infrastructure that spans across multiple regions and countries, providing global connectivity."
        >
          <template v-slot:activator="{ props }">
            <v-switch color="primary" inset label="Planetary Network" v-model="planetary" v-bind="props" />
          </template>
        </v-tooltip>

        <v-tooltip
          location="top"
          text="Enabling WireGuard Access allows you to establish secure and encrypted connections to your network resources."
        >
          <template v-slot:activator="{ props }">
            <v-switch color="primary" inset label="Add Wireguard Access" v-model="wireguard" v-bind="props" />
          </template>
        </v-tooltip>

        <v-alert v-show="networkError" class="mb-2" type="warning" variant="tonal">
          You must enable at least one of network options.
        </v-alert>
        <SelectFarm
          :filters="{
            cpu,
            memory,
            publicIp: ipv4,
            ssd: disks.reduce((total, disk) => total + disk.size, diskSize + 2),
          }"
          v-model="farm"
        />
      </template>

      <template #disks>
        <ExpandableLayout v-model="disks" @add="addDisk" #="{ index }">
          <p class="text-h6 mb-4">Disk #{{ index + 1 }}</p>
          <input-validator
            :value="disks[index].name"
            :rules="[
              validators.required('Disk name is required.'),
              name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
              validators.minLength('Disk minLength is 2 chars.', 2),
              validators.isAlphanumeric('Disk name only accepts alphanumeric chars.'),
              validators.maxLength('Disk maxLength is 15 chars.', 15),
            ]"
            #="{ props }"
          >
            <input-tooltip #="{ tooltipProps }" tooltip="Disk name.">
              <v-text-field label="Name" v-model="disks[index].name" v-bind="{ ...props, ...tooltipProps }" />
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
            <input-tooltip #="{ tooltipProps }" tooltip="Disk Size.">
              <v-text-field
                label="Size (GB)"
                type="number"
                v-model.number="disks[index].size"
                v-bind="{ ...props, ...tooltipProps }"
              />
            </input-tooltip>
          </input-validator>
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="tabs?.invalid || networkError"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from "@threefold/grid_client";
import { type Ref, ref, watch } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM, type Disk } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const images: VmImage[] = [
  {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-22.04.flist",
    entryPoint: "/init.sh",
  },
  {
    name: "Ubuntu-20.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-20.04-lts.flist",
    entryPoint: "/init.sh",
  },
  {
    name: "Ubuntu-18.04",
    flist: "https://hub.grid.tf/tf-official-vms/ubuntu-18.04-lts.flist",
    entryPoint: "/init.sh",
  },
  {
    name: "Nixos-22.11",
    flist: "https://hub.grid.tf/tf-official-vms/nixos-22.11.flist",
    entryPoint: "/init.sh",
  },
];

const name = ref("vm" + generateString(8));
const flist = ref<Flist>();
const cpu = ref(4);
const memory = ref(8192);
const diskSize = ref(50);
const ipv4 = ref(false);
const ipv6 = ref(false);
const planetary = ref(true);
const wireguard = ref(false);
const farm = ref() as Ref<Farm>;
const disks = ref<Disk[]>([]);
const networkError = ref(false);

function addDisk() {
  const name = generateString(7);
  disks.value.push({
    name: "DISK" + name,
    size: 50,
    mountPoint: "/mnt/" + name,
  });
}
watch([planetary, ipv4, ipv6, wireguard], ([planetary, ipv4, ipv6, wireguard]) => {
  if (!(ipv6 || ipv4 || planetary || wireguard)) networkError.value = true;
  else networkError.value = false;
});
async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Fullvm.toLowerCase();

  try {
    layout.value.validateSsh();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu.value,
          memory: memory.value,
          flist: flist.value!.value,
          entryPoint: flist.value!.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          disks: [{ size: diskSize.value, mountPoint: "/" }, ...disks.value],
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          planetary: planetary.value,
          envs: [{ key: "SSH_KEY", value: profileManager.profile!.ssh }],
          rootFilesystemSize: 2,
        },
      ],
      network: { addAccess: wireguard.value },
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a full virtual machine instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a full virtual machine instance."));
  }
}
</script>

<script lang="ts">
import ExpandableLayout from "../components/expandable_layout.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectVmImage, { type VmImage } from "../components/select_vm_image.vue";
import { deploymentListEnvironments } from "../constants";

export default {
  name: "FullVm",
  components: {
    SelectVmImage,
    SelectFarm,
    ExpandableLayout,
  },
};
</script>
