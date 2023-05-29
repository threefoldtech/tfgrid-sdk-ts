<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    title-image="images/icons/subsquid.png"
  >
    <template #title>Deploy a Subsquid Instance </template>
    <template #subtitle>
      Subsquid indexer is a piece of software that reads all the blocks from a Substrate based blockchain, decodes and
      stores them for processing in a later stage.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_subsquid.html" class="app-link">
        Quick start documentation
      </a>
    </template>

    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
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
        :value="endpoint"
        :rules="[
          validators.required('Endpoint is required.'),
          validators.isURL('Please provide a valid endpoint.', { protocols: ['wss'] }),
        ]"
        #="{ props }"
      >
        <v-text-field label="Websockt Endpoint" v-model="endpoint" v-bind="props" />
      </input-validator>

      <v-switch color="primary" inset label="Public IPv4" v-model="ipv4" />

      <SelectSolutionFlavor
        v-model="solution"
        :minimum="{ cpu: 1, memory: 1024, disk: 50 }"
        :standard="{ cpu: 2, memory: 1024 * 2, disk: 100 }"
      />
      <SelectGatewayNode v-model="gateway" />
      <SelectFarm
        :filters="{
          cpu: solution?.cpu,
          memory: solution?.memory,
          ssd: solution?.disk,
          publicIp: ipv4,
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

const name = ref("SS" + generateString(9));
const endpoint = ref("");
const ipv4 = ref(false);
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Subsquid.toLowerCase();

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
              mountPoint: "/var/lib/docker",
            },
          ],
          flist: "https://hub.grid.tf/tf-official-apps/subsquid-latest.flist",
          entryPoint: "/sbin/zinit init",
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "CHAIN_ENDPOINT", value: endpoint.value },
            { key: "SUBSQUID_WEBSERVER_HOSTNAME", value: domain },
          ],
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Subsquid instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [`http://[${vm[0].planetary}]:4444`],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a Subsquid instance.");
    layout.value.openDialog(vm, {
      SSH_KEY: "Public SSH Key",
      SUBSQUID_WEBSERVER_HOSTNAME: "Subsquid Webserver Hostname",
      CHAIN_ENDPOINT: "Chain Endpoint",
    });
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Subsquid instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";

export default {
  name: "TfSubsquid",
  components: {
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
  },
};
</script>
