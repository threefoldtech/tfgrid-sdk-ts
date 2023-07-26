<template>
  <weblet-layout
    ref="layout"
    @mount="layoutMount"
    :cpu="cpu"
    :memory="memory"
    :disk="disks.reduce((total, disk) => total + disk.size, rootFsSize)"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/vm.png"
  >
    <template #title>Deploy a Micro Virtual Machine </template>

    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Environment Variables', value: 'env' },
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

        <SelectVmImage :images="images" v-model="flist" />

        <RootFsSize :cpu="cpu" :memory="memory" v-model.number="rootFsSize" />

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
          tooltip="Click to know more about dedicated nodes."
          href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
        >
          <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
        </input-tooltip>

        <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
          <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
        </input-tooltip>

        <SelectFarmManager>
          <SelectFarm
            :filters="{
              cpu,
              memory,
              publicIp: ipv4,
              ssd: disks.reduce((total, disk) => total + disk.size, rootFsSize),
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
            v-model="farm"
          />
          <SelectNode
            v-model="selectedNode"
            :filters="{
              farmId: farm?.farmID,
              cpu,
              memory,
              ipv4: ipv4,
              ipv6: ipv4,
              disks: disks,
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
          />
        </SelectFarmManager>
      </template>

      <template #env>
        <ExpandableLayout
          v-model="envs"
          @add="envs.push({ key: '', value: '' })"
          #="{ index, isRequired }"
          :required="[0]"
        >
          <input-validator
            :value="envs[index].key"
            :rules="[
              validators.required('Key name is required.'),
              key => validators.isAlpha('Key must start with alphabet char.')(key[0]),
              validators.pattern('Invalid key format.', { pattern: /^[^0-9_\s][a-zA-Z0-9_]+$/ }),
              validators.maxLength('Key max length is 128 chars.', 128),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="Environment key.">
              <v-text-field label="Name" v-model="envs[index].key" :disabled="isRequired" v-bind="props" />
            </input-tooltip>
          </input-validator>

          <input-validator
            :value="envs[index].value"
            :rules="[validators.required('Value is required.')]"
            #="{ props }"
          >
            <input-tooltip tooltip="Environment Value.">
              <v-textarea label="Value" v-model="envs[index].value" no-resize :spellcheck="false" />
            </input-tooltip>
          </input-validator>
        </ExpandableLayout>
      </template>

      <template #disks>
        <ExpandableLayout
          v-model="disks"
          @add="addDisk"
          title="Add additional disk space to your micro virtual machine"
          #="{ index }"
        >
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
      <v-btn color="primary" variant="tonal" :disabled="tabs?.invalid || network?.error" @click="deploy">Deploy</v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM, type Disk, type Env } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { generateName } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const images = [
  {
    name: "Ubuntu-22.04",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
    entryPoint: "/sbin/zinit init",
  },
  {
    name: "Alpine-3",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-alpine-3.flist",
    entryPoint: "/entrypoint.sh",
  },
  {
    name: "CentOS-8",
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-centos-8.flist",
    entryPoint: "/entrypoint.sh",
  },
  {
    name: "Nixos",
    flist: "https://hub.grid.tf/tf-official-vms/nixos-micro-latest.flist",
    entryPoint: "/entrypoint.sh",
  },
];

const name = ref(generateName(8, { prefix: "vm" }));
const flist = ref<Flist>();
const rootFsSize = ref(2) as Ref<number>;
const cpu = ref(4);
const memory = ref(8192);
const ipv4 = ref(false);
const ipv6 = ref(false);
const planetary = ref(true);
const wireguard = ref(false);
const farm = ref() as Ref<Farm>;
const envs = ref<Env[]>([]);
const disks = ref<Disk[]>([]);
const network = ref();
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;

function layoutMount() {
  if (envs.value.length > 0) {
    envs.value.splice(0, 1);
  }

  envs.value.unshift({
    key: "SSH_KEY",
    value: profileManager.profile!.ssh,
  });
}

function addDisk() {
  const name = generateName(5);
  disks.value.push({
    name: "disk" + name,
    size: 50,
    mountPoint: "/mnt/" + name,
  });
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.VM.toLowerCase();

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
          cpu: cpu.value,
          memory: memory.value,
          flist: flist.value!.value,
          entryPoint: flist.value!.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          disks: disks.value,
          envs: envs.value,
          planetary: planetary.value,
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          rootFilesystemSize: rootFsSize.value,
          nodeId: selectedNode.value.nodeId,
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
import RootFsSize from "../components/root_fs_size.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import SelectVmImage from "../components/select_vm_image.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";

export default {
  name: "MicroVm",
  components: {
    SelectVmImage,
    RootFsSize,
    SelectFarm,
    SelectNode,
    ExpandableLayout,
    SelectFarmManager,
  },
};
</script>
