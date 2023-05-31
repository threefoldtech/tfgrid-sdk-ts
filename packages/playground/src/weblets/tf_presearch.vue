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
    <template #subtitle
      >Presearch is a community-powered, decentralized search engine that provides better results while protecting your
      privacy and rewarding you when you search. This weblet deploys a Presearch node. Presearch Nodes are used to
      process user search requests, and node operators earn Presearch PRE tokens for joining and supporting the network.
      <a class="app-link" href="https://manual.grid.tf/weblets/weblets_presearch.html" target="_blank">
        Quick start documentation
      </a>
    </template>

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
            validators.isAlphanumeric('Name should consist of letters only.'),
            name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
            validators.minLength('Name must be at least 2 characters.', 2),
            validators.maxLength('Name cannot exceed 15 characters.', 15),
          ]"
          #="{ props }"
        >
          <v-text-field label="Name" v-model="name" v-bind="props" />
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
            <v-text-field label="Presearch Registeration Code" v-bind="props" v-model="code" />
          </password-input-wrapper>
        </input-validator>

        <v-switch color="primary" inset label="Public IPv4" v-model="ipv4" />
        <v-switch color="primary" inset label="Planetary Network" v-model="planetary" />
        <v-alert v-show="networkError" class="mb-2" type="warning" variant="tonal">
          You must enable at least one of network options.
        </v-alert>
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
        <v-textarea label="Private Presearch Restore Key" v-model="privateRestoreKey" no-resize :spellcheck="false" />
        <v-textarea label="Public Presearch Restore Key" v-model="publicRestoreKey" no-resize :spellcheck="false" />
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" :disabled="tabs?.invalid || networkError" @click="deploy"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from "@threefold/grid_client";
import { type Ref, ref, watch } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref("ps" + generateString(8));
const code = ref("");
const ipv4 = ref(false);
const planetary = ref(true);
const cpu = 1;
const memory = 512;
const rootFsSize = rootFs(cpu, memory);
const farm = ref() as Ref<Farm>;
const privateRestoreKey = ref("");
const publicRestoreKey = ref("");
const networkError = ref(false);

watch([planetary, ipv4], ([planetary, ipv4]) => {
  if (!(ipv4 || planetary)) networkError.value = true;
  else networkError.value = false;
});
async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Presearch.toLowerCase();

  try {
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
