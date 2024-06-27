<template>
  <weblet-layout
    ref="layout"
    @mount="layoutMount"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="disks.reduce((total, disk) => total + disk.size, rootFilesystemSize)"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/gitea.png"
  >
    <template #title>Deploy a Gitea Machine </template>

    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Mail Server', value: 'mail' },
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

        <SelectSolutionFlavor
          :small="{ cpu: 1, memory: 2, disk: 25 }"
          :medium="{ cpu: 2, memory: 4, disk: 50 }"
          :large="{ cpu: 4, memory: 16, disk: 100 }"
          v-model="solution"
        />

        <Network
          required
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:mycelium="mycelium"
          ref="network"
        />
        <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
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

        <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
      </template>
      <template #mail>
        <SmtpServer v-model="smtp" :persistent="true" :tls="true">
          Gitea needs SMTP service so please configure these settings properly.
        </SmtpServer>
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn color="secondary" variant="outlined" @click="validateBeforeDeploy(deploy)" text="Deploy" />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref, watch } from "vue";

import { manual } from "@/utils/manual";

import Network from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useGrid } from "../stores";
import { ProjectName } from "../types";
import { deployVM, type Disk, type Env } from "../utils/deploy_vm";
import { generateName } from "../utils/strings";

const layout = useLayout();
const tabs = ref();

const name = ref(generateName({ prefix: "gt" }));
const ipv4 = ref(false);
const ipv6 = ref(false);
const planetary = ref(true);
const mycelium = ref(true);
const envs = ref<Env[]>([]);
const disks = ref<Disk[]>([]);
const network = ref();
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = computed(() => solution.value?.disk);
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const smtp = ref(createSMTPServer());
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

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Gitea.toLowerCase() + "/" + name.value;

  try {
    updateGrid(grid, { projectName });

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: false,
      },
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          flist: "https://hub.grid.tf/tf-official-apps/gitea-mycelium.flist",
          entryPoint: "/sbin/zinit init",
          disks: disks.value,
          envs: envs.value,
          planetary: planetary.value,
          mycelium: mycelium.value,
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
    layout.value.setStatus("success", "Successfully deployed a Gitea machine.");
    layout.value.openDialog(vm, deploymentListEnvironments.gitea);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy Gitea machine instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}

watch(selectedSSHKeys, layoutMount, { deep: true });
</script>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";

import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { solutionFlavor as SolutionFlavor } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const solution = ref() as Ref<SolutionFlavor>;

export default {
  name: "Gitea",
  components: {
    SelectSolutionFlavor,
    SmtpServer,
  },
};
</script>
