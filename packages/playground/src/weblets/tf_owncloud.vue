<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="solution?.disk + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0)"
    title-image="images/icons/owncloud.png"
  >
    <template #title>Deploy an Owncloud Instance </template>
    <template #subtitle>
      Owncloud develops and provides open-source software for content collaboration, allowing teams to easily share and
      work on files seamlessly regardless of device or location.
      <a target="_blank" class="app-link" href="https://manual.grid.tf/weblets/weblets_owncloud.html">
        Quick start documentation
      </a>
    </template>

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

        <SelectSolutionFlavor
          v-model="solution"
          :minimum="{ cpu: 2, memory: 1024 * 16, disk: 250 }"
          :standard="{ cpu: 2, memory: 1024 * 16, disk: 500 }"
          :recommended="{ cpu: 4, memory: 1024 * 16, disk: 1000 }"
        />
        <SelectGatewayNode v-model="gateway" />
        <SelectFarm
          :filters="{
            cpu: solution?.cpu,
            memory: solution?.memory,
            ssd: solution?.disk + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0),
            publicIp: false,
          }"
          v-model="farm"
        />
      </template>

      <template #smtp>
        <SmtpServer v-model="smtp" tls ssl email>
          Configure these settings only If you have an smtp service and you know what you’re doing.
        </SmtpServer>
      </template>
    </d-tabs>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="tabs?.invalid"> Deploy </v-btn>
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

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref("MM" + generateString(9));
const username = ref("admin");
const password = ref(generateString(12));
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;

const smtp = ref(createSMTPServer());

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Owncloud.toLowerCase();

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
          flist: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
          entryPoint: "/sbin/zinit init",
          rootFilesystemSize: rootFs(solution.value.cpu, solution.value.memory),
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
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
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a owncloud instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");
    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [`http://[${vm[0].planetary}]:80`],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a owncloud instance.");
    layout.value.openDialog(vm, {
      SSH_KEY: "Public SSH Key",
      OWNCLOUD_DOMAIN: "Owncloud Domain",
      OWNCLOUD_ADMIN_USERNAME: "Owncloud Admin Username",
      OWNCLOUD_ADMIN_PASSWORD: "Owncloud Admin Password",
      OWNCLOUD_MAIL_SMTP_SECURE: "Owncloud Mail SMTP Secure",
      OWNCLOUD_MAIL_DOMAIN: "Owncloud Mail Domain",
      OWNCLOUD_MAIL_FROM_ADDRESS: "Owncloud Mail From Address",
      OWNCLOUD_MAIL_SMTP_HOST: "Owncloud Mail SMTP Host",
      OWNCLOUD_MAIL_SMTP_PORT: "Owncloud Mail SMTP Port",
      OWNCLOUD_MAIL_SMTP_NAME: "Owncloud Mail SMTP Name",
      OWNCLOUD_MAIL_SMTP_PASSWORD: "Owncloud Mail SMTP Password",
    });
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a owncloud instance."));
  }
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

export default {
  name: "TfOwncloud",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
  },
};
</script>
