<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk"
    :ipv4="ipv4"
    title-image="images/icons/wordpress.png"
  >
    <template #title>Deploy a Wordpress Instance </template>

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
        :value="username"
        :rules="[
          validators.required('Username is required.'),
          validators.isLowercase('Username should consist of lowercase letters only.'),
          validators.isAlphanumeric('Username should consist of letters and numbers only.'),
          username => validators.isAlpha('Username must start with alphabet char.')(username[0]),
          validators.minLength('Username must be at least 2 characters.', 2),
          validators.maxLength('Username cannot exceed 15 characters.', 15),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Wordpress admin username.">
          <v-text-field label="Username" v-model="username" v-bind="{ ...props }" />
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
          <input-tooltip tooltip="Wordpress admin password.">
            <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
          </input-tooltip>
        </input-validator>
      </password-input-wrapper>

      <input-validator
        :value="email"
        :rules="[
          validators.required('Email is required.'),
          validators.isEmail('Please provide a valid email address.'),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Wordpress admin email.">
          <v-text-field
            label="Email"
            placeholder="This email will be used to login to your instance."
            v-model="email"
            v-bind="{ ...props }"
          />
        </input-tooltip>
      </input-validator>

      <SelectSolutionFlavor
        v-model="solution"
        :standard="{ cpu: 2, memory: 1024 * 2, disk: 50 }"
        :recommended="{ cpu: 4, memory: 1024 * 4, disk: 100 }"
      />
      <Networks v-model:ipv4="ipv4" />

      <FarmGatewayManager>
        <SelectFarm
          :filters="{
            cpu: solution?.cpu,
            memory: solution?.memory,
            ssd: solution?.disk,
            publicIp: ipv4,
          }"
          v-model="farm"
        />
        <DomainName :hasIPv4="ipv4" ref="domainNameCmp"></DomainName>
      </FarmGatewayManager>
    </form-validator>

    <template #footer-actions>
      <v-btn
        color="primary"
        variant="tonal"
        @click="deploy(domainNameCmp?.domain, domainNameCmp?.customDomain)"
        :disabled="!valid"
      >
        Deploy
      </v-btn>
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
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "wp" }));
const username = ref("admin");
const email = ref("");
const password = ref(generatePassword());
const solution = ref() as Ref<SolutionFlavor>;
const domainNameCmp = ref();
const farm = ref() as Ref<Farm>;
const ipv4 = ref(false);

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Wordpress instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.wordpress);
}
async function deploy(gatewayName: GatewayNode, customDomain: boolean) {
  layout.value.setStatus("deploy");
  const projectName = ProjectName.Wordpress.toLowerCase();
  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = customDomain ? gatewayName.domain : subdomain + "." + gatewayName.domain;

  let grid: GridClient | null;
  let vm: any;
  try {
    layout.value.validateSsh();
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        accessNodeId: gatewayName.id,
        addAccess: !!gatewayName.id,
      },
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          disks: [
            {
              size: solution.value.disk,
              mountPoint: "/var/www/html",
            },
          ],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          publicIpv4: ipv4.value,
          country: farm.value.country,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "MYSQL_USER", value: username.value },
            { key: "MYSQL_PASSWORD", value: password.value },
            { key: "ADMIN_EMAIL", value: email.value },
            { key: "WP_URL", value: domain },
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Wordpress instance."));
  }
  if (customDomain && ipv4.value) {
    vm[0].customDomain = gatewayName.domain;
    finalize(vm);
    return;
  }
  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");
    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gatewayName.id!,
      ip: vm[0].interfaces[0].ip,
      port: 80,
      networkName: vm[0].interfaces[0].network,
      fqdn: gatewayName?.useFQDN ? gatewayName?.domain : undefined,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");

    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Wordpress instance."));
  }
}
</script>

<script lang="ts">
import DomainName from "../components/domain_name.vue";
import FarmGatewayManager from "../components/farm_gateway_manager.vue";
import Networks from "../components/networks.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";

export default {
  name: "TFWordpress",
  components: {
    SelectSolutionFlavor,
    SelectFarm,
    Networks,
    DomainName,
    FarmGatewayManager,
  },
};
</script>
