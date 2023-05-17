<template>
  <weblet-layout ref="layout">
    <template #title>Deploy a Taiga Instance</template>
    <template #subtitle>
      Taiga is the project management tool for multi-functional agile teams. It has a rich feature set and at the same
      time it is very simple to start with through its intuitive user interface.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_taiga.html" class="app-link">
        Quick start documentation
      </a>
    </template>

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

        <input-validator
          :value="email"
          :rules="[
            validators.required('Email is required.'),
            validators.isEmail('Please provide a valid email address.'),
          ]"
          #="{ props }"
        >
          <v-text-field label="Email" v-bind="props" v-model="email" />
        </input-validator>

        <SelectSolutionFlavor v-model="solution" />
        <SelectGatewayNode v-model="gateway" />
        <SelectFarm
          :filters="{
            cpu: solution?.cpu,
            memory: solution?.memory,
            ssd: solution?.disk,
            publicIp: false,
          }"
          v-model="farm"
        />
      </template>

      <template #smtp>
        <SmtpServer v-model="smtp" email tls ssl>
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

const name = ref("TG" + generateString(9));
const username = ref("admin");
const password = ref(generateString(12));
const email = ref("");
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;

const smtp = ref(createSMTPServer());

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Taiga.toLowerCase();

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
          flist: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
          entryPoint: "/sbin/zinit init",
          rootFilesystemSize: rootFs(solution.value.cpu, solution.value.memory),
          farmId: farm.value.farmID,
          farmName: farm.value.name,
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
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a taiga instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");
    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [`http://[${vm[0].planetary}]:9000/`],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a taiga instance.");
    layout.value.openDialog(vm, {
      SSH_KEY: "Public SSH Key",
      DOMAIN_NAME: "Domain Name",
      ADMIN_USERNAME: "Admin Username",
      ADMIN_PASSWORD: "Admin Password",
      ADMIN_EMAIL: "Admin Email",
      DEFAULT_FROM_EMAIL: "Default Form Email",
      EMAIL_USE_TLS: "Email Use TLS",
      EMAIL_USE_SSL: "Email Use SSL",
      EMAIL_HOST: "Email Host",
      EMAIL_PORT: "Email Port",
      EMAIL_HOST_USER: "Email Host User",
      EMAIL_HOST_PASSWORD: "Email Host Password",
    });
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a taiga instance."));
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
  name: "TfTaiga",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
  },
};
</script>
