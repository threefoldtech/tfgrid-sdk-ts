<template>
  <weblet-layout
    ref="layout"
    :cpu="workers.reduce((cpu, worker) => cpu + worker.cpu, master.cpu)"
    :memory="workers.reduce((memory, worker) => memory + worker.memory, master.memory)"
    :disk="
      workers.reduce((disk, worker) => disk + worker.diskSize + worker.rootFsSize, master.diskSize + master.rootFsSize)
    "
    :ivp4="master.ipv4"
    title-image="images/icons/kubernetes.png"
  >
    <template #title>Deploy a Kubernetes</template>
    <template #subtitle>
      Kubernetes is the standard container orchestration tool. On the TF grid, Kubernetes clusters can be deployed out
      of the box. We have implemented K3S, a full-blown Kubernetes offering that uses only half of the memory footprint.
      It is packaged as a single binary and made more lightweight to run workloads in resource-constrained locations
      (fits e.g. IoT, edge, ARM workloads).
      <a href="https://manual.grid.tf/weblets/weblets_k8s.html" target="_blank" class="app-link">
        Quick start documentation
      </a>
    </template>

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
            name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
            validators.isAlphanumeric('Name should consist of alphabets & numbers only.'),
            validators.minLength('Name minimum length is 2 chars.', 2),
            validators.maxLength('Name max length is 15 chars.', 15),
          ]"
          #="{ props }"
        >
          <v-text-field label="Name" v-model="name" v-bind="props" />
        </input-validator>

        <input-validator
          :value="clusterToken"
          :rules="[
            validators.required('Token is required.'),
            validators.minLength('Token minimum length is 6 chars.', 6),
            validators.maxLength('Token max length is 15 chars.', 15),
            validators.isAlphanumeric('Token cannot contain any characters other than alphabets and numbers.'),
          ]"
          #="{ props }"
        >
          <password-input-wrapper>
            <v-text-field label="Cluster Token" v-bind="props" v-model="clusterToken" />
          </password-input-wrapper>
        </input-validator>
      </template>

      <template #master>
        <K8SWorker v-model="master" />
      </template>

      <template #workers>
        <ExpandableLayout v-model="workers" @add="addWorker" #="{ index }">
          <K8SWorker v-model="workers[index]" />
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn variant="tonal" color="primary" @click="deploy" :disabled="tabs?.invalid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from "@threefold/grid_client";
import { ref } from "vue";

import { createWorker } from "../components/k8s_worker.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { K8SWorker as K8sWorker } from "../types";
import { deployK8s } from "../utils/deploy_k8s";
import { getGrid } from "../utils/grid";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref("K8S" + generateString(8));
const clusterToken = ref(generateString(10));
const master = ref(createWorker("MR" + generateString(9)));
const workers = ref<K8sWorker[]>([]);

function addWorker() {
  workers.value.push(createWorker());
}

async function deploy() {
  layout.value.setStatus("deploy");

  try {
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
