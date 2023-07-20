<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="disks.reduce((total, disk) => total + disk.size, diskSize + 2)"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
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
          <input-tooltip tooltip="Instance name.">
            <v-text-field label="Name" v-model="name" v-bind="props" />
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
          <input-tooltip tooltip="The number of virtual cores allocated to your instance.">
            <v-text-field label="CPU (vCores)" type="number" v-model.number="cpu" v-bind="props" />
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
          <input-tooltip tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
            <v-text-field label="Memory (MB)" type="number" v-model.number="memory" v-bind="props" />
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
            tooltip="The storage capacity allocated to your instance, indicating the amount of space available to store files, data, and applications."
          >
            <v-text-field label="Disk Size (GB)" type="number" v-model.number="diskSize" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <Network
          required
          ref="network"
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:wireguard="wireguard"
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
        <SelectFarm
          v-if="!hasGPU"
          :filters="{
            cpu,
            memory,
            publicIp: ipv4,
            ssd: disks.reduce((total, disk) => total + disk.size, diskSize + 2),
            dedicated: dedicated,
            certified: certified,
          }"
          v-model="farm"
        />
        <SelectGPUNode
          v-if="hasGPU"
          v-model="selectedNodewithCards"
          :filters="{
            cpu,
            memory,
            ipv4: ipv4,
            ssd: disks.reduce((total, disk) => total + disk.size, diskSize + 2),
            ipv6: ipv4,
            name: name,
            flist: flist,
            disks: disks,
            disk: diskSize,
            hasGPU: hasGPU,
            planetary: planetary,
            wireguard: wireguard,
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
        />
        <SelectNode
          v-else
          v-model="selectedNode"
          :filters="{
            farmId: farm?.farmID,
            cpu,
            memory,
            ipv4: ipv4,
            ssd: disks.reduce((total, disk) => total + disk.size, diskSize + 2),
            ipv6: ipv4,
            name: name,
            flist: flist,
            disks: disks,
            disk: disks.reduce((total, disk) => total + disk.size, diskSize + 2),
            hasGPU: hasGPU,
            planetary: planetary,
            wireguard: wireguard,
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
        />
      </template>

      <template #disks>
        <ExpandableLayout
          v-model="disks"
          @add="addDisk"
          title="Add additional disk space to your full virtual machine"
          #="{ index }"
        >
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
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="tabs?.invalid || network?.error">Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { type Ref, ref, watch } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM, type Disk } from "../utils/deploy_vm";
import type { Node } from "../utils/filter_nodes";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName } from "../utils/strings";

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

const name = ref(generateName(8, { prefix: "vm" }));
const flist = ref<Flist>();
const cpu = ref(4);
const memory = ref(8192);
const diskSize = ref(50);
const ipv4 = ref(false);
const ipv6 = ref(false);
const planetary = ref(true);
const wireguard = ref(false);
const dedicated = ref(false);
const certified = ref(false);
const farm = ref() as Ref<Farm>;
const disks = ref<Disk[]>([]);
const network = ref();
const hasGPU = ref(false);
const selectedNodewithCards = ref() as Ref<GPUNodeType>;
const selectedNode = ref() as Ref<Node>;

function addDisk() {
  const name = generateName(7);
  disks.value.push({
    name: "disk" + name,
    size: 50,
    mountPoint: "/mnt/" + name,
  });
}

watch(
  dedicated,
  dedicated => {
    if (dedicated === false) {
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
    }
  },
  { immediate: true },
);

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
          hasGPU: hasGPU.value,
          nodeId: hasGPU.value ? selectedNodewithCards.value.nodeId : selectedNode.value.nodeId,
          gpus: hasGPU.value ? selectedNodewithCards.value.cards.map(card => card.id) : undefined,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
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
import SelectGPUNode from "../components/select_gpu_node.vue";
import SelectNode from "../components/select_node.vue";
import SelectVmImage, { type VmImage } from "../components/select_vm_image.vue";
import { deploymentListEnvironments } from "../constants";
import type { GPUNodeType } from "../utils/filter_node_with_gpu";

export default {
  name: "FullVm",
  components: {
    SelectVmImage,
    SelectFarm,
    ExpandableLayout,
    SelectGPUNode,
    SelectNode,
  },
};
</script>
