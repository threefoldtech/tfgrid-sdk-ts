<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk + rootFilesystemSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/nextcloud.png"
  >
    <template #title>Deploy a Nextcloud Instance </template>

    <d-tabs :tabs="[{ title: 'Base', value: 'base' }]" ref="tabs">
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
          :value="domain"
          :rules="[
            validators.required('A valid domain is required.'),
            validators.minLength('Username must be at least 2 characters.', 2),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Nextcloud domain URL.">
            <v-text-field label="Username" v-model="username" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <input-validator
          :value="username"
          :rules="[
            validators.required('Database username is required.'),
            validators.isLowercase('Username should consist of lowercase letters only.'),
            validators.isAlphanumeric('Username should consist of letters and numbers only.'),
            username => validators.isAlpha('Username must start with alphabet char.')(username[0]),
            validators.minLength('Username must be at least 2 characters.', 2),
            validators.maxLength('Username cannot exceed 15 characters.', 15),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Nextcloud database username.">
            <v-text-field label="Username" v-model="username" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <password-input-wrapper #="{ props }">
          <input-validator
            :value="password"
            :rules="[
              validators.required('Database password is required.'),
              validators.minLength('Password must be at least 6 characters.', 6),
              validators.maxLength('Password cannot exceed 15 characters.', 15),
            ]"
            #="{ props: validatorProps }"
          >
            <input-tooltip tooltip="Nextcloud database password.">
              <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
            </input-tooltip>
          </input-validator>
        </password-input-wrapper>

        <SelectSolutionFlavor
          v-model="solution"
          :minimum="{ cpu: 2, memory: 1024 * 16, disk: 250 }"
          :standard="{ cpu: 2, memory: 1024 * 16, disk: 500 }"
          :recommended="{ cpu: 4, memory: 1024 * 16, disk: 1000 }"
        />
        <Networks v-model:ipv4="ipv4" />
        <FarmGatewayManager>
          <input-tooltip
            inline
            tooltip="Click to know more about dedicated nodes."
            href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
          >
            <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
          </input-tooltip>
          <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
            <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
          </input-tooltip>

          <SelectFarmManager>
            <SelectFarm
              :filters="{
                cpu: solution?.cpu,
                memory: solution?.memory,
                ssd: solution?.disk + rootFilesystemSize,
                publicIp: ipv4,
                rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
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
                disks: [
                  {
                    size: solution?.disk,
                    mountPoint: '/var/lib/docker',
                  },
                ],
                rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
                certified: certified,
              }"
            />
          </SelectFarmManager>
          <DomainName :hasIPv4="ipv4" ref="domainNameCmp" />
        </FarmGatewayManager>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn
        color="primary"
        variant="tonal"
        @click="deploy(domainNameCmp?.domain, domainNameCmp?.customDomain)"
        :disabled="tabs?.invalid"
      >
        Deploy
      </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { computed, type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, Flist, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "oc" }));
const username = ref("admin");
const password = ref(generatePassword());
const solution = ref() as Ref<SolutionFlavor>;
const farm = ref() as Ref<Farm>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/nextcloud-27.0.1.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const ipv4 = ref(false);
const domainNameCmp = ref();

const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a owncloud instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.owncloud);
}

async function deploy(gatewayName: GatewayNode, customDomain: boolean) {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Nextcloud.toLowerCase();

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = domain.value;

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
              mountPoint: "/var/lib/docker",
            },
          ],
          flist: flist.value,
          entryPoint: flist.entryPoint,
          rootFilesystemSize: rootFilesystemSize.value,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          publicIpv4: ipv4.value,
          country: farm.value.country,
          planetary: true,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "NEXTCLOUD_DATABASE_USERNAME", value: username.value },
            { key: "NEXTCLOUD_DATABASE_PASSWORD", value: password.value },
            { key: "NEXTCLOUD_DOMAIN", value: domain },
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Nextcloud instance."));
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
      fqdn: gatewayName?.useFQDN ? gatewayName.domain : undefined,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a owncloud instance."));
  }
}
</script>

<script lang="ts">
import DomainName from "../components/domain_name.vue";
import FarmGatewayManager from "../components/farm_gateway_manager.vue";
import Networks from "../components/networks.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

export default {
  name: "TfNextcloud",
  components: {
    SelectSolutionFlavor,
    Networks,
    DomainName,
    FarmGatewayManager,
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
