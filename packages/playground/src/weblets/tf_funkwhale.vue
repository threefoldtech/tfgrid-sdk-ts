<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    title-image="images/icons/funkwhale.png"
  >
    <template #title>Deploy a Funkwhale Instance </template>
    <template #subtitle>
      Funkwhale is social platform to enjoy and share music. Funkwhale is a community-driven project that lets you
      listen and share music and audio within a decentralized, open network.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_funkwhale.html" class="app-link">
        Quick start documentation
      </a>
    </template>

    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.minLength('Name minLength is 2 chars.', 2),
          validators.maxLength('Name maxLength is 15 chars.', 15),
        ]"
        #="{ props }"
      >
        <v-text-field label="Name" v-model="name" v-bind="props" />
      </input-validator>

      <input-validator
        :value="username"
        :rules="[
          validators.required('Username is required.'),
          validators.minLength('Username minLength is 2 chars.', 2),
          validators.maxLength('Username maxLength is 15 chars.', 15),
        ]"
        #="{ props }"
      >
        <v-text-field label="Username" v-model="username" v-bind="props" />
      </input-validator>

      <input-validator
        :value="email"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        #="{ props }"
      >
        <v-text-field
          label="Email"
          placeholder="This email will be used to login to your instance."
          v-model="email"
          v-bind="props"
        />
      </input-validator>

      <password-input-wrapper #="{ props }">
        <input-validator
          :value="password"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password minLength is 6 chars.', 6),
            validators.maxLength('Password maxLength is 15 chars.', 15),
          ]"
          #="{ props: validatorProps }"
        >
          <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
        </input-validator>
      </password-input-wrapper>

      <SelectSolutionFlavor v-model="solution" />
      <SelectGatewayNode v-model="gateway" />
      <SelectFarm
        :filters="{
          cpu: solution?.cpu,
          memory: solution?.memory,
          ssd: solution?.disk,
        }"
        v-model="farm"
      />
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString, type GridClient } from "@threefold/grid_client";
import { type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const name = ref("FW" + generateString(9));
const username = ref("admin");
const email = ref("");
const password = ref(generateString(12));
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Funkwhale.toLowerCase();

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = subdomain + "." + gateway.value.domain;

  let grid: GridClient | null;
  let vm: any;

  try {
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: [
            {
              size: solution.value.disk,
              mountPoint: "/data",
            },
          ],
          flist: "https://hub.grid.tf/tf-official-apps/funkwhale-dec21.flist",
          entryPoint: "/init.sh",
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          envs: [
            { key: "FUNKWHALE_HOSTNAME", value: domain },
            { key: "DJANGO_SUPERUSER_EMAIL", value: email.value },
            { key: "DJANGO_SUPERUSER_USERNAME", value: username.value },
            { key: "DJANGO_SUPERUSER_PASSWORD", value: password.value },
          ],
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a funkwhale instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [`http://[${vm[0].planetary}]:80/`],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a funkwhale instance.");
    layout.value.openDialog(vm, {
      FUNKWHALE_HOSTNAME: "Funkwhale Hostname",
      DJANGO_SUPERUSER_EMAIL: "Django Superuser Email",
      DJANGO_SUPERUSER_USERNAME: "Diango Superuser Username",
      DJANGO_SUPERUSER_PASSWORD: "Django Superuser Password",
    });
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a funkwhale instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";

export default {
  name: "TfFunkwhale",
  components: {
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
  },
};
</script>
