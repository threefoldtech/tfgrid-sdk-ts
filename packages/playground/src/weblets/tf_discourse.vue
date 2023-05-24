<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0)"
    title-image="images/icons/discourse.png"
  >
    <template #title> Deploy a Discourse Instance </template>
    <template #subtitle>
      Discourse is the 100% open source discussion platform built for the next decade of the Internet. Use it as a
      mailing list, discussion forum, long-form chat room, and more!
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_discourse.html" class="app-link">
        Quick start documentation
      </a>
    </template>

    <d-tabs
      :tabs="[
        { title: 'Config', value: 'config' },
        { title: 'Mail Server', value: 'mail' },
      ]"
      ref="tabs"
    >
      <template #config>
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

        <SelectSolutionFlavor
          v-model="solution"
          :standard="{ cpu: 2, memory: 1024 * 2, disk: 50 }"
          :recommended="{ cpu: 4, memory: 1024 * 4, disk: 100 }"
        />
        <SelectGatewayNode v-model="gateway" />
        <SelectFarm
          :filters="{
            cpu: solution?.cpu,
            memory: solution?.memory,
            ssd: (solution?.disk ?? 0) + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0),
            publicIp: false,
          }"
          v-model="farm"
        />
      </template>

      <template #mail>
        <SmtpServer v-model="smtp" :persistent="true" :tls="true">
          Discourse needs SMTP service so please configure these settings properly.
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
import { Buffer } from "buffer";
import TweetNACL from "tweetnacl";
import { type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref("DC" + generateString(9));
const email = ref("");
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;
const smtp = ref(createSMTPServer());

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Discourse.toLowerCase();

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
          flist: "https://hub.grid.tf/tf-official-apps/forum-docker-v3.1.2.flist",
          entryPoint: "/sbin/zinit init",
          rootFilesystemSize: rootFs(solution.value.cpu, solution.value.memory),
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          planetary: true,
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "DISCOURSE_HOSTNAME", value: domain },
            { key: "DISCOURSE_DEVELOPER_EMAILS", value: email.value },
            { key: "DISCOURSE_SMTP_ADDRESS", value: smtp.value.hostname },
            { key: "DISCOURSE_SMTP_PORT", value: smtp.value.port.toString() },
            { key: "DISCOURSE_SMTP_ENABLE_START_TLS", value: smtp.value.tls ? "true" : "false" },
            { key: "DISCOURSE_SMTP_USER_NAME", value: smtp.value.username },
            { key: "DISCOURSE_SMTP_PASSWORD", value: smtp.value.password },
            { key: "THREEBOT_PRIVATE_KEY", value: generatePubKey() },
            { key: "FLASK_SECRET_KEY", value: generateString(8) },
          ],
        },
      ],
    });
  } catch (e) {
    return layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a discourse instance."));
  }

  try {
    layout.value.setStatus("deploy", "Preparing to deploy gateway...");

    await deployGatewayName(grid!, {
      name: subdomain,
      nodeId: gateway.value.id,
      backends: [`http://[${vm[0].planetary}]:88`],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a discourse instance.");
    layout.value.openDialog(vm, {
      SSH_KEY: "Public SSH Key",
      DISCOURSE_HOSTNAME: "Discourse Hostname",
      DISCOURSE_DEVELOPER_EMAILS: "Discourse Developer Emails",
      DISCOURSE_SMTP_ADDRESS: "Discourse SMTP Address",
      DISCOURSE_SMTP_PORT: "Discourse SMTP Port",
      DISCOURSE_SMTP_ENABLE_START_TLS: "Discourse SMTP Enable Start TLS",
      DISCOURSE_SMTP_USER_NAME: "Discourse SMTP Username",
      DISCOURSE_SMTP_PASSWORD: "Discourse SMTP Password",
      THREEBOT_PRIVATE_KEY: "Threebot Private Key",
      FLASK_SECRET_KEY: "Flask Secret Key",
    });
  } catch (e) {
    layout.value.setStatus("deploy", "Rollbacking back due to fail to deploy gateway...");
    await rollbackDeployment(grid!, name.value);
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy a discourse instance."));
  }
}

function generatePubKey(): string {
  const keypair = TweetNACL.box.keyPair();
  return Buffer.from(keypair.publicKey).toString("base64");
}
</script>

<script lang="ts">
import SelectFarm from "../components/select_farm.vue";
import SelectGatewayNode from "../components/select_gateway_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";

export default {
  name: "TfDiscourse",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
  },
};
</script>
