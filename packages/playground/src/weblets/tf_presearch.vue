<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="rootFsSize"
    :ipv4="ipv4"
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
        <Network required v-model:ipv4="ipv4" v-model:planetary="planetary" ref="network" />
        <SelectFarm
          :filters="{
            cpu,
            memory,
            ssd: rootFsSize,
            publicIp: ipv4,
          }"
          exclusive-for="research"
          v-model="farm"
        />
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
import { type Ref, ref, watch } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, ProjectName } from "../types";
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
const rootFsSize = rootFs(cpu, memory);
const farm = ref() as Ref<Farm>;
const privateRestoreKey = ref("");
const publicRestoreKey = ref("");
const network = ref();

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Presearch.toLowerCase();

  try {
    layout.value.validateSsh();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu,
          memory: memory,
          flist: "https://hub.grid.tf/tf-official-apps/presearch-v2.2.flist",
          entryPoint: "/sbin/zinit init",
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
          rootFilesystemSize: rootFsSize,
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
import { deploymentListEnvironments } from "../constants";

export default {
  name: "TFPresearch",
  components: {
    SelectFarm,
  },
};
</script>
