<template>
  <weblet-layout
    ref="layout"
    :cpu="workers.reduce((cpu, worker) => cpu + worker.cpu, master.cpu)"
    :memory="workers.reduce((memory, worker) => memory + worker.memory, master.memory)"
    :disk="
      workers.reduce((disk, worker) => disk + worker.diskSize + worker.rootFsSize, master.diskSize + master.rootFsSize)
    "
    :ipv4="master.ipv4"
    :certified="master.certified"
    :dedicated="master.dedicated"
    title-image="images/icons/kubernetes.png"
  >
    <template #title>Deploy a Kubernetes cluster</template>
    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Master', value: 'master' },
        { title: 'Workers', value: 'workers' },
      ]"
      ref="tabs"
    >
      <template #config>
        <input-validator
          :value="name"
          :rules="[
            validators.required('Name is required.'),
            validators.isLowercase('Name should consist of lowercase letters only.'),
            name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
            validators.isAlphanumeric('Name should consist of alphabets & numbers only.'),
            validators.minLength('Name minimum length is 2 chars.', 2),
            validators.maxLength('Name max length is 15 chars.', 15),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Instance name.">
            <v-text-field label="Name" v-model="name" v-bind="{ ...props }" />
          </input-tooltip>
        </input-validator>

        <input-validator
          :value="clusterToken"
          :rules="[
            validators.required('Token is required.'),
            validators.minLength('Token minimum length is 6 chars.', 6),
            validators.maxLength('Token max length is 15 chars.', 15),
          ]"
          #="{ props: validationProps }"
        >
          <password-input-wrapper #="{ props }">
            <input-tooltip
              tooltip="The Kubernetes Cluster Token is a specially generated authentication token used for accessing and managing a Kubernetes cluster."
            >
              <v-text-field label="Cluster Token" v-bind="{ ...props, ...validationProps }" v-model="clusterToken" />
            </input-tooltip>
          </password-input-wrapper>
        </input-validator>
      </template>

      <template #master>
        <K8SWorker v-model="master" loadingFarm />
      </template>

      <template #workers>
        <ExpandableLayout v-model="workers" @add="addWorker" #="{ index }" :disabled="loadingFarm">
          <K8SWorker v-model="workers[index]" v-model:loading="loadingFarm" />
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn variant="tonal" color="primary" @click="deploy" :disabled="tabs?.invalid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { createWorker } from "../components/k8s_worker.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { K8SWorker as K8sWorker } from "../types";
import { deployK8s } from "../utils/deploy_k8s";
import { getGrid } from "../utils/grid";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();
const name = ref(generateName(8, { prefix: "k8s" }));
const clusterToken = ref(generatePassword(10));
const master = ref(createWorker(generateName(9, { prefix: "mr" })));
const workers = ref<K8sWorker[]>([]);
const loadingFarm = ref(false);
function addWorker() {
  workers.value.push(createWorker());
}

async function deploy() {
  layout.value.setStatus("deploy");

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!);

    await layout.value.validateBalance(grid!);

    const k8s = await deployK8s(grid!, {
      name: name.value,
      clusterToken: clusterToken.value,
      master: master.value!,
      workers: workers.value,
      sshKey: profileManager.profile!.ssh,
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a Kubernetes cluster.");
    layout.value.openDialog(k8s, deploymentListEnvironments.k8s);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy kubernetes cluster."));
  }
}
</script>

<script lang="ts">
import ExpandableLayout from "../components/expandable_layout.vue";
import K8SWorker from "../components/k8s_worker.vue";
import { deploymentListEnvironments } from "../constants";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfKubernetes",
  components: {
    K8SWorker,
    ExpandableLayout,
  },
};
</script>
