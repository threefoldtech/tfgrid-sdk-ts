<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    title-image="images/icons/peertube.png"
  >
    <template #title>Deploy a Peertube Instance</template>
    <form-validator v-model="valid">
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
        :value="email"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Peertube admin email.">
          <v-text-field label="Admin Email" v-model="email" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <password-input-wrapper #="{ props }">
        <input-validator
          :value="password"
          :rules="[
            validators.required('Password is required.'),
            validators.minLength('Password must be at least 6 characters.', 6),
            validators.maxLength('Password cannot exceed 15 characters.', 15),
          ]"
          #="{ props: validatorProps }"
        >
          <input-tooltip tooltip="Peertube admin password.">
            <v-text-field label="Admin Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
          </input-tooltip>
        </input-validator>
      </password-input-wrapper>

      <SelectSolutionFlavor v-model="solution" />
      <SelectGatewayNode v-model="gateway" />

      <input-tooltip
        inline
        tooltip="Click to know more about dedicated nodes."
        href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
      >
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" />
      </input-tooltip>
      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" />
      </input-tooltip>

      <SelectFarm
        :filters="{
          cpu: solution?.cpu,
          memory: solution?.memory,
          ssd: solution?.disk,
          publicIp: false,
          dedicated: dedicated,
          certified: certified,
        }"
        v-model="farm"
      />

      <SelectNode
        v-model="selectedNode"
        :filters="{
          farmId: farm?.farmID,
          cpu: solution?.cpu,
          memory: solution?.memory,
          ssd: solution?.disk,
          disks: [{ size: solution?.disk, mountPoint: '/data' }],
          disk: solution?.disk,
          name: name,
          flist: flist,
          rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
          certified: certified,
        }"
      />
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, Flist, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import type { Node } from "../utils/filter_nodes";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "pt" }));
const email = ref("");
const password = ref(generatePassword());
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/peertube-v3.1.1.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<Node>;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Peertube.toLowerCase();

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = subdomain + "." + gateway.value.domain;

  let grid: GridClient | null;
  let vm: any;

  try {
    layout.value.validateSsh();
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: true,
        accessNodeId: gateway.value.id,
      },
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
          flist: flist.value,
          entryPoint: flist.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          planetary: true,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "PEERTUBE_ADMIN_EMAIL", value: email.value },
            { key: "PT_INITIAL_ROOT_PASSWORD", value: password.value },
            { key: "PEERTUBE_WEBSERVER_HOSTNAME", value: domain },
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a peertube instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [
        {
          ip: vm[0].interfaces[0].ip,
          port: 9000,
        },
      ],
      networkName: vm[0].interfaces[0].network,
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a peertube instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.peertube);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a peertube instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfPeertube",
  components: {
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
    SelectNode,
  },
};
</script>
