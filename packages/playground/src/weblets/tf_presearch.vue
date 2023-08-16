<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="rootFilesystemSize + dockerDiskSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/presearch.png"
  >
    <template #title>Deploy a Presearch Instance</template>

    <d-tabs
      :tabs="[
        { title: 'Base', value: 'base' },
        { title: 'Restore', value: 'restore' },
      ]"
      ref="tabs"
    >
      <template #base>
        <v-alert type="warning" variant="tonal" class="mb-6">
          You can deploy only one Presearch node per farm without reserving a dedicated public IP. So if a Presearch
          node is deployed without public IP and didn't show up in the Presearch's Dashboard that means there is another
          node deployed and you have to add public IP to your deployment.
        </v-alert>
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
          :value="code"
          :rules="[
            validators.required('Presearch registration code is required.'),
            validators.equal('Presearch registration code must be 32 characters long.', 32),
          ]"
          #="{ props }"
        >
          <password-input-wrapper>
            <input-tooltip tooltip="Presearch Registeration Code.">
              <v-text-field label="Presearch Registeration Code" v-bind="props" v-model="code" />
            </input-tooltip>
          </password-input-wrapper>
        </input-validator>
        <Network required v-model:ipv4="ipv4" v-model:planetary="planetary" ref="network" :disabled="loadingFarm" />

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
              cpu,
              memory,
              ssd: rootFilesystemSize + dockerDiskSize,
              publicIp: ipv4,
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
            exclusive-for="research"
            v-model="farm"
            v-model:loading="loadingFarm"
          />

          <SelectNode
            v-model="selectedNode"
            :filters="{
              farmId: farm?.farmID,
              cpu,
              memory,
              ipv4: ipv4,
              diskSizes: [dockerDiskSize],
              rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
              certified: certified,
            }"
            :root-file-system-size="rootFilesystemSize"
          />
        </SelectFarmManager>
      </template>

      <template #restore>
        <input-tooltip
          tooltip="The Private Presearch Restore Key is a unique cryptographic key associated with your Presearch account."
        >
          <v-textarea label="Private Presearch Restore Key" v-model="privateRestoreKey" no-resize :spellcheck="false" />
        </input-tooltip>

        <input-tooltip
          tooltip="The Public Presearch Restore Key is a unique cryptographic key associated with your Presearch account."
        >
          <v-textarea label="Public Presearch Restore Key" v-model="publicRestoreKey" no-resize :spellcheck="false" />
        </input-tooltip>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" :disabled="tabs?.invalid || network?.error" @click="deploy">
        Deploy
      </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";
import { generateName } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName(8, { prefix: "ps" }));
const code = ref("");
const ipv4 = ref(false);
const planetary = ref(true);
const cpu = 1;
const memory = 512;
const rootFilesystemSize = rootFs(cpu, memory);
const loadingFarm = ref(false);
const dockerDiskSize = 10;
const farm = ref() as Ref<Farm>;
const privateRestoreKey = ref("");
const publicRestoreKey = ref("");
const network = ref();
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/presearch-v2.3.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Presearch.toLowerCase();

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu,
          memory: memory,
          flist: flist.value,
          entryPoint: flist.entryPoint,
          disks: [
            {
              name: "docker",
              mountPoint: "/var/lib/docker",
              size: dockerDiskSize,
            },
          ],
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          planetary: planetary.value,
          publicIpv4: ipv4.value,
          country: farm.value.country,
          envs: [
            {
              key: "SSH_KEY",
              value: profileManager.profile!.ssh,
            },
            {
              key: "PRESEARCH_REGISTRATION_CODE",
              value: code.value,
            },
            {
              key: "PRESEARCH_BACKUP_PRI_KEY",
              value: privateRestoreKey.value,
            },
            {
              key: "PRESEARCH_BACKUP_PUB_KEY",
              value: publicRestoreKey.value,
            },
          ],
          rootFilesystemSize: rootFilesystemSize,
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a Presearch instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.presearch);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Presearch instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";

export default {
  name: "TFPresearch",
  components: {
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
