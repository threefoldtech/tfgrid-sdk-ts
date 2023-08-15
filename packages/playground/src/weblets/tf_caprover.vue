<template>
  <weblet-layout
    ref="layout"
    :cpu="workers.reduce((cpu, worker) => cpu + (worker.solution?.cpu ?? 0), leader.solution?.cpu ?? 0)"
    :memory="workers.reduce((memory, worker) => memory + (worker.solution?.memory ?? 0), leader.solution?.memory ?? 0)"
    :disk="
      workers.reduce(
        (disk, worker) =>
          disk + (worker.solution?.disk ?? 0) + rootFs(worker.solution?.cpu ?? 0, worker.solution?.memory ?? 0),
        leader.solution?.disk ?? 0 + rootFs(leader.solution?.cpu ?? 0, leader.solution?.memory ?? 0),
      )
    "
    :ipv4="true"
    :certified="leader.certified"
    :dedicated="leader.dedicated"
    title-image="images/icons/caprover.png"
  >
    <template #title>Deploy a Caprover Instance</template>
    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Leader', value: 'leader' },
        { title: 'Workers', value: 'workers' },
      ]"
      ref="tabs"
    >
      <template #config>
        <input-validator
          :value="domain"
          :rules="[
            validators.required('Domain is required.'),
            validators.pattern('Please provide a valid domain.', {
              pattern: /^\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b$/,
            }),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Domain name.">
            <v-text-field label="Domain" v-model="domain" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <v-alert type="warning" variant="tonal" class="mb-6">
          <p :style="{ maxWidth: '880px' }">
            You will need to point a wildcard DNS entry for the domain you entered above to this CapRover instance IP
            Address after deployment, otherwise, you won't be able to access the CapRover dashboard using this domain.
          </p>

          <p class="font-weight-bold mt-4">
            If you don't know what Captain root domain is, make sure to visit the
            <a
              target="_blank"
              href="https://manual.grid.tf/weblets/weblets_caprover.html?highlight=caprover#caprover"
              :style="{ color: 'inherit' }"
            >
              Quick start documentation.
            </a>
          </p>
        </v-alert>

        <password-input-wrapper #="{ props }">
          <input-validator
            :value="password"
            :rules="[
              validators.required('Password is required.'),
              validators.minLength('Password must be at least 6 characters.', 6),
              validators.maxLength('Password cannot exceed 15 characters.', 15),
            ]"
            #="{ props: validationProps }"
          >
            <input-tooltip tooltip="Instance admin password.">
              <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validationProps }" />
            </input-tooltip>
          </input-validator>
        </password-input-wrapper>
      </template>

      <template #leader>
        <CaproverWorker v-model="leader" />
      </template>

      <template #workers>
        <ExpandableLayout v-model="workers" @add="addWorker" #="{ index }" :disabled="loadingFarm">
          <CaproverWorker v-model="workers[index]" v-model:loading="loadingFarm" />
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="tabs?.invalid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type CaproverWorker as CW, ProjectName } from "../types";
import { deployVM, type Env, type Machine } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();
const loadingFarm = ref(false);
const domain = ref("");
const password = ref(generatePassword(10));
const leader = ref(createWorker(generateName(9, { prefix: "cr" })));
const workers = ref<CW[]>([]);

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Caprover.toLowerCase();

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: leader.value.name,
      machines: [
        normalizeCaproverWorker(leader.value, [
          { key: "SWM_NODE_MODE", value: "leader" },
          { key: "CAPROVER_ROOT_DOMAIN", value: domain.value },
          { key: "CAPTAIN_IMAGE_VERSION", value: "latest" },
          { key: "PUBLIC_KEY", value: profileManager.profile!.ssh },
          { key: "DEFAULT_PASSWORD", value: password.value },
          { key: "CAPTAIN_IS_DEBUG", value: "true" },
        ]),
        ...workers.value.map(worker =>
          normalizeCaproverWorker(worker, [
            { key: "SWM_NODE_MODE", value: "worker" },
            { key: "PUBLIC_KEY", value: profileManager.profile!.ssh },
          ]),
        ),
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a caprover instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.caprover);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a caprover instance."));
  }
}

function addWorker() {
  workers.value.push(createWorker());
}

function normalizeCaproverWorker(worker: CW, envs: Env[]): Machine {
  return {
    name: worker.name,
    cpu: worker.solution!.cpu,
    memory: worker.solution!.memory,
    flist: "https://hub.grid.tf/tf-official-apps/tf-caprover-latest.flist",
    entryPoint: "/sbin/zinit init",
    farmId: worker.farm!.farmID,
    farmName: worker.farm!.name,
    country: worker.farm!.country,
    publicIpv4: true,
    planetary: true,
    rootFilesystemSize: rootFs(worker.solution!.cpu, worker.solution!.memory),
    disks: [
      {
        name: "data0",
        size: worker.solution!.disk,
        mountPoint: "/var/lib/docker",
      },
    ],
    envs,
    nodeId: worker.selectedNode?.nodeId,
    rentedBy: worker.dedicated ? profileManager.profile?.twinId : undefined,
    certified: worker.certified,
  };
}
</script>

<script lang="ts">
import CaproverWorker, { createWorker } from "../components/caprover_worker.vue";
import ExpandableLayout from "../components/expandable_layout.vue";
import { deploymentListEnvironments } from "../constants";
import rootFs from "../utils/root_fs";

export default {
  name: "TfCaprover",
  components: {
    CaproverWorker,
    ExpandableLayout,
  },
};
</script>
