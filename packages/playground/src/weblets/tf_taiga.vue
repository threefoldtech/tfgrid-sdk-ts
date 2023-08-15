<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk + rootFilesystemSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/taiga.png"
  >
    <template #title>Deploy a Taiga Instance</template>
    <d-tabs
      :tabs="[
        { title: 'Base', value: 'base' },
        { title: 'Mail Server', value: 'smtp' },
      ]"
      ref="tabs"
    >
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
          <input-tooltip tooltip="Admin username.">
            <v-text-field label="Username" v-model="username" v-bind="props" />
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
            <input-tooltip tooltip="Admin password.">
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
          <input-tooltip tooltip="Admin email.">
            <v-text-field label="Email" v-bind="props" v-model="email" />
          </input-tooltip>
        </input-validator>

        <SelectSolutionFlavor
          v-model="solution"
          :minimum="{ cpu: 2, memory: 1024 * 2, disk: 100 }"
          :standard="{ cpu: 2, memory: 1024 * 4, disk: 150 }"
          :disabled="loadingFarm"
        />
        <!-- <Networks v-model:ipv4="ipv4" /> -->
        <FarmGatewayManager>
          <input-tooltip
            inline
            tooltip="Click to know more about dedicated nodes."
            href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
          >
            <v-switch
              color="primary"
              inset
              label="Dedicated"
              v-model="dedicated"
              :disabled="loadingFarm"
              hide-details
            />
          </input-tooltip>
          <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
            <v-switch
              color="primary"
              inset
              label="Certified"
              v-model="certified"
              :disabled="loadingFarm"
              hide-details
            />
          </input-tooltip>

          <SelectFarmManager>
            <SelectFarm
              :filters="{
                cpu: solution?.cpu,
                memory: solution?.memory,
                ssd: (solution?.disk ?? 0) + rootFilesystemSize,
                publicIp: ipv4,
                rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
                certified: certified,
              }"
              v-model="farm"
              v-model:loading="loadingFarm"
            />

            <SelectNode
              v-model="selectedNode"
              :filters="{
                farmId: farm?.farmID,
                cpu: solution?.cpu,
                memory: solution?.memory,
                diskSizes: [solution?.disk],
                rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
                certified: certified,
              }"
              :root-file-system-size="rootFilesystemSize"
            />
          </SelectFarmManager>
          <DomainName :hasIPv4="ipv4" ref="domainNameCmp" />
        </FarmGatewayManager>
      </template>

      <template #smtp>
        <SmtpServer v-model="smtp" email tls ssl>
          Configure these settings only If you have an smtp service and you know what you’re doing.
        </SmtpServer>
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

const name = ref(generateName(9, { prefix: "tg" }));
const username = ref("admin");
const password = ref(generatePassword());
const email = ref("");
const solution = ref() as Ref<SolutionFlavor>;
const farm = ref() as Ref<Farm>;
const loadingFarm = ref(false);
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const ipv4 = ref(false);
const domainNameCmp = ref();

const smtp = ref(createSMTPServer());
const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));
function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a taiga instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.taiga);
}

async function deploy(gatewayName: GatewayNode, customDomain: boolean) {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Taiga.toLowerCase();

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = customDomain ? gatewayName.domain : subdomain + "." + gatewayName.domain;

  let grid: GridClient | null;
  let vm: any;

  try {
    layout.value?.validateSSH();
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        accessNodeId: gatewayName.id,
        addAccess: !!gatewayName,
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
            { key: "DOMAIN_NAME", value: domain },
            { key: "ADMIN_USERNAME", value: username.value },
            { key: "ADMIN_PASSWORD", value: password.value },
            { key: "ADMIN_EMAIL", value: email.value },
            ...(smtp.value.enabled
              ? [
                  { key: "EMAIL_HOST", value: smtp.value.hostname },
                  { key: "EMAIL_PORT", value: smtp.value.port.toString() },
                  { key: "EMAIL_HOST_USER", value: smtp.value.username },
                  { key: "EMAIL_HOST_PASSWORD", value: smtp.value.password },
                  { key: "EMAIL_USE_TLS", value: smtp.value.tls ? "True" : "False" },
                  { key: "EMAIL_USE_SSL", value: smtp.value.ssl ? "True" : "False" },
                ]
              : []),
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a taiga instance."));
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
      port: 9000,
      networkName: vm[0].interfaces[0].network,
      fqdn: gatewayName?.useFQDN ? gatewayName.domain : undefined,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a taiga instance."));
  }
}
</script>

<script lang="ts">
import DomainName from "../components/domain_name.vue";
import FarmGatewayManager from "../components/farm_gateway_manager.vue";
// import Networks from "../components/networks.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

export default {
  name: "TfTaiga",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    // Networks,
    DomainName,
    FarmGatewayManager,
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
