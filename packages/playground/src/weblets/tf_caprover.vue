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
    title-image="images/icons/caprover.png"
  >
    <template #title>Deploy Caprover</template>
    <template #subtitle>
      CapRover is an extremely easy to use app/database deployment & web server manager for your NodeJS, Python, PHP,
      ASP.NET, Ruby, MySQL, MongoDB, Postgres, WordPress (and etc…) applications!
      <a
        href="https://manual.grid.tf/weblets/weblets_caprover.html?highlight=caprover#caprover"
        target="_blank"
        class="app-link"
      >
        Quick start documentation
      </a>
    </template>

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
          <v-text-field label="Domain" v-model="domain" v-bind="props" autofocus />
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
              validators.minLength('Password minLength is 6 chars.', 6),
              validators.maxLength('Password maxLength is 15 chars.', 15),
            ]"
            #="{ props: validationProps }"
          >
            <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validationProps }" />
          </input-validator>
        </password-input-wrapper>
      </template>

      <template #leader>
        <CaproverWorker v-model="leader" />
      </template>

      <template #workers>
        <ExpandableLayout v-model="workers" @add="addWorker" #="{ index }">
          <CaproverWorker v-model="workers[index]" />
        </ExpandableLayout>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="tabs?.invalid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from "@threefold/grid_client";
import { ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type CaproverWorker as CW, ProjectName } from "../types";
import { deployVM, type Env, type Machine } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const domain = ref("");
const password = ref(generateString(10));
const leader = ref(createWorker("CR" + generateString(9)));
const workers = ref<CW[]>([]);

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Caprover.toLowerCase();

  try {
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
    layout.value.openDialog(vm, {
      SWM_NODE_MODE: "Swarm Node Mode",
      PUBLIC_KEY: "Public SSH Key",
      CAPROVER_ROOT_DOMAIN: false,
      CAPTAIN_IMAGE_VERSION: "Captain Image Version",
      DEFAULT_PASSWORD: "Default Password",
      CAPTAIN_IS_DEBUG: "Debug Mode",
    });
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
  };
}
</script>

<script lang="ts">
import CaproverWorker, { createWorker } from "../components/caprover_worker.vue";
import ExpandableLayout from "../components/expandable_layout.vue";
import rootFs from "../utils/root_fs";

export default {
  name: "TfCaprover",
  components: {
    CaproverWorker,
    ExpandableLayout,
  },
};
</script>
