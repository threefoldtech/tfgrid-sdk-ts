<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk + rootFilesystemSize"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
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
            validators.IsAlphanumericExpectUnderscore('Name should consist of letters ,numbers and underscores only.'),
            name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
            validators.minLength('Name must be at least 2 characters.', 2),
            validators.maxLength('Name cannot exceed 50 characters.', 50),
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
            validators.maxLength('Username cannot exceed 50 characters.', 50),
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
              validators.pattern('Password should not contain whitespaces.', {
                pattern: /^[^\s]+$/,
              }),
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
          :small="{ cpu: 2, memory: 4, disk: 100 }"
          :medium="{ cpu: 4, memory: 8, disk: 150 }"
        />
        <Networks v-model:mycelium="mycelium" v-model:ipv4="ipv4" v-model:planetary="planetary" v-model:ipv6="ipv6" />

        <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
          <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
        </input-tooltip>

        <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
          <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
        </input-tooltip>

        <TfSelectionDetails
          :filters="{
            ipv4,
            ipv6,
            certified,
            dedicated,
            cpu: solution?.cpu,
            solutionDisk: solution?.disk,
            memory: solution?.memory,
            rootFilesystemSize,
          }"
          require-domain
          v-model="selectionDetails"
        />

        <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
      </template>

      <template #smtp>
        <SmtpServer v-model="smtp" email tls ssl>
          Configure these settings only If you have an smtp service and you know what you’re doing.
        </SmtpServer>
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn color="secondary" @click="validateBeforeDeploy(deploy)" text="Deploy" />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { calculateRootFileSystem, type GridClient } from "@threefold/grid_client";
import { computed, type Ref, ref, watch } from "vue";

import { manual } from "@/utils/manual";

import { useLayout } from "../components/weblet_layout.vue";
import { useGrid, useProfileManager } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName({ prefix: "tg" }));
const username = ref("admin");
const password = ref(generatePassword());
const email = ref(profileManager.profile?.email || "");
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const ipv4 = ref(false);
const ipv6 = ref(false);
const mycelium = ref(true);
const planetary = ref(true);
const smtp = ref(createSMTPServer());
const rootFilesystemSize = computed(() =>
  calculateRootFileSystem({ CPUCores: solution.value?.cpu ?? 0, RAMInMegaBytes: solution.value?.memory ?? 0 }),
);
const selectionDetails = ref<SelectionDetails>();
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Taiga instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.taiga);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Taiga.toLowerCase() + "/" + name.value;

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });

  const domain = selectionDetails.value?.domain?.enabledCustomDomain
    ? selectionDetails.value.domain.customDomain
    : subdomain + "." + selectionDetails.value?.domain?.selectedDomain?.publicConfig.domain;

  let vm: any;

  try {
    layout.value?.validateSSH();
    updateGrid(grid, { projectName });

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: selectionDetails.value!.domain!.enableSelectedDomain,
        accessNodeId: selectionDetails.value?.domain?.selectedDomain?.nodeId,
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
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          planetary: planetary.value,
          mycelium: mycelium.value,
          envs: [
            { key: "SSH_KEY", value: selectedSSHKeys.value },
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
          nodeId: selectionDetails.value!.node!.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Taiga instance."));
  }

  if (!selectionDetails.value?.domain?.enableSelectedDomain) {
    vm[0].customDomain = selectionDetails.value?.domain?.customDomain;
    finalize(vm);
    return;
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid, selectionDetails.value.domain, {
      subdomain,
      ip: vm[0].interfaces[0].ip,
      port: 9000,
      network: vm[0].interfaces[0].network,
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a Taiga instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}

watch(
  () => smtp.value.enabled,
  newValue => {
    if (newValue) {
      ipv4.value = true;
    }
  },
);
watch(
  () => ipv4.value,
  newValue => {
    if (!newValue && smtp.value.enabled) {
      smtp.value.enabled = false;
    }
  },
);
</script>

<script lang="ts">
import Networks from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfTaiga",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    Networks,
    ManageSshDeployemnt,
  },
};
</script>
