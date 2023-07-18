<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0)"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/discourse.png"
  >
    <template #title> Deploy a Discourse Instance </template>
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
          <input-tooltip tooltip="This email will be used to login to your instance.">
            <v-text-field
              label="Email"
              placeholder="This email will be used to login to your instance."
              v-model="email"
              v-bind="props"
            />
          </input-tooltip>
        </input-validator>

        <SelectSolutionFlavor
          v-model="solution"
          :standard="{ cpu: 2, memory: 1024 * 2, disk: 50 }"
          :recommended="{ cpu: 4, memory: 1024 * 4, disk: 100 }"
        />
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
            ssd: (solution?.disk ?? 0) + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0),
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
            ssd: (solution?.disk ?? 0) + rootFs(solution?.cpu ?? 0, solution?.memory ?? 0),
            name: name,
            flist: flist,
            disks: [{ size: solution?.disk, mountPoint: '/var/lib/docker' }],
            disk: 0,
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
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
import type { GridClient } from "@threefold/grid_client";
import { Buffer } from "buffer";
import TweetNACL from "tweetnacl";
import { type Ref, ref } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import type { Farm, Flist, GatewayNode, solutionFlavor as SolutionFlavor } from "../types";
import { ProjectName } from "../types";
import { deployVM } from "../utils/deploy_vm";
import type { Node } from "../utils/filter_nodes";
import { deployGatewayName, getSubdomain, rollbackDeployment } from "../utils/gateway";
import { getGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";
import rootFs from "../utils/root_fs";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "dc" }));
const email = ref("");
const solution = ref() as Ref<SolutionFlavor>;
const gateway = ref() as Ref<GatewayNode>;
const farm = ref() as Ref<Farm>;
const smtp = ref(createSMTPServer());
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<Node>;

const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/forum-docker-v3.1.2.flist",
  entryPoint: "/sbin/zinit init",
};

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
          disks: [{ size: solution.value?.disk, mountPoint: "/var/lib/docker" }],
          flist: flist.value,
          entryPoint: flist.entryPoint,
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
            { key: "FLASK_SECRET_KEY", value: generatePassword(8) },
          ],
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
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
      backends: [
        {
          ip: vm[0].interfaces[0].ip,
          port: 88,
        },
      ],
      networkName: vm[0].interfaces[0].network,
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed a discourse instance.");
    layout.value.openDialog(vm, deploymentListEnvironments.discourse);
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
import SelectNode from "../components/select_node.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import SmtpServer, { createSMTPServer } from "../components/smtp_server.vue";
import { deploymentListEnvironments } from "../constants";

export default {
  name: "TfDiscourse",
  components: {
    SmtpServer,
    SelectSolutionFlavor,
    SelectGatewayNode,
    SelectFarm,
    SelectNode,
  },
};
</script>
