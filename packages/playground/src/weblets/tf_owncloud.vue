<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk + rootFilesystemSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    title-image="images/icons/owncloud.png"
  >
    <template #title>Deploy an OwnCloud Instance </template>

    <d-tabs
      :tabs="[
        { title: 'Base', value: 'base' },
        { title: 'SMTP Server', value: 'smtp' },
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
          <input-tooltip tooltip="OwnCloud admin username.">
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
            <input-tooltip tooltip="OwnCloud admin password.">
              <v-text-field label="Password" v-model="password" v-bind="{ ...props, ...validatorProps }" />
            </input-tooltip>
          </input-validator>
        </password-input-wrapper>

        <SelectSolutionFlavor
          v-model="solution"
          :small="{ cpu: 2, memory: 8, disk: 250 }"
          :medium="{ cpu: 4, memory: 16, disk: 500 }"
          :large="{ cpu: 8, memory: 32, disk: 1000 }"
        />
        <Networks v-model:ipv4="ipv4" />
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

        <TfSelectionDetails
          :filters="{
            ipv4,
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
      </template>

      <template #smtp>
        <SmtpServer v-model="smtp" tls ssl email>
          Configure these settings only If you have an smtp service and you know what you’re doing.
        </SmtpServer>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy()" :disabled="tabs?.invalid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import type { GridClient } from "@threefold/grid_client";
import { computed, type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { generateName, generatePassword } from "../utils/strings";

const selectionDetails = ref<SelectionDetails>();

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName({ prefix: "oc" }));
const username = ref("admin");
const password = ref(generatePassword());
const solution = ref() as Ref<SolutionFlavor>;
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const ipv4 = ref(false);

const smtp = ref(createSMTPServer());
const rootFilesystemSize = computed(() => rootFs(solution.value?.cpu ?? 0, solution.value?.memory ?? 0));

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a owncloud instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.owncloud);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Owncloud.toLowerCase() + "/" + name.value;

  const subdomain = getSubdomain({
    deploymentName: name.value,
    projectName,
    twinId: profileManager.profile!.twinId,
  });
  const domain = selectionDetails.value?.domain?.enabledCustomDomain
    ? selectionDetails.value.domain.customDomain
    : subdomain + "." + selectionDetails.value?.domain?.selectedDomain?.publicConfig.domain;

  let grid: GridClient | null;
  let vm: any;

  try {
    layout.value?.validateSSH();
    grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    vm = await deployVM(grid!, {
      name: name.value,
      network: {
        accessNodeId: selectionDetails.value?.domain?.selectedDomain?.nodeId,
        addAccess: !selectionDetails.value?.domain?.enableSelectedDomain,
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
          planetary: true,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "OWNCLOUD_ADMIN_USERNAME", value: username.value },
            { key: "OWNCLOUD_ADMIN_PASSWORD", value: password.value },
            { key: "OWNCLOUD_DOMAIN", value: domain },
            ...(smtp.value.enabled
              ? [
                  {
                    key: "OWNCLOUD_MAIL_SMTP_SECURE",
                    value: smtp.value.tls ? "tls" : smtp.value.ssl ? "ssl" : "none",
                  },
                  { key: "OWNCLOUD_MAIL_FROM_ADDRESS", value: smtp.value.email.split("@")[0] },
                  { key: "OWNCLOUD_MAIL_DOMAIN", value: smtp.value.email.split("@")[1] },
                  { key: "OWNCLOUD_MAIL_SMTP_HOST", value: smtp.value.hostname },
                  { key: "OWNCLOUD_MAIL_SMTP_PORT", value: smtp.value.port.toString() },
                  { key: "OWNCLOUD_MAIL_SMTP_NAME", value: smtp.value.username },
                  { key: "OWNCLOUD_MAIL_SMTP_PASSWORD", value: smtp.value.password },
                ]
              : []),
          ],
          nodeId: selectionDetails.value?.node?.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a owncloud instance."));
  }

  const selectedDomain = selectionDetails.value?.domain;

  if (!selectedDomain?.enableSelectedDomain) {
    vm[0].customDomain = selectionDetails.value?.domain?.customDomain;
    finalize(vm);
    return;
  }
  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    const domain = selectedDomain.selectedDomain;
    if (!domain) {
      throw new Error("Please provide a valid domain name data.");
    }
    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: domain.nodeId!,
      ip: vm[0].interfaces[0].ip,
      port: 80,
      networkName: vm[0].interfaces[0].network,
      fqdn: selectedDomain?.useFQDN ? domain.publicConfig.domain : undefined,
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
import Networks from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

export default {
  name: "TfOwncloud",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    Networks,
  },
};
</script>
