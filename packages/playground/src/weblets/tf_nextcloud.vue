<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="(solution?.disk ?? 0) + rootFilesystemSize"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/nextcloud.png"
  >
    <template #title>Deploy a Nextcloud All-in-One Instance </template>
    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.isLowercase('Name should consist of lowercase letters only.'),
          validators.isAlphanumeric('Name should consist of alphabets & numbers only.'),
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
          validators.required('Domain is required.'),
          validators.pattern('Please provide a valid domain.', {
            pattern: /^\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b$/,
          }),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="Domain name.">
          <v-text-field label="Domain" v-model="domain" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <v-alert type="warning" variant="tonal" class="mb-6">
        <p :style="{ maxWidth: '880px' }">Write a valid domain (e.g. "example.com").</p>
        <p :style="{ maxWidth: '880px' }">
          After deployment, add a DNS A record (Host: "@", Value: &lt;Public IPv4 Address&gt;) to your domain to access
          Nextcloud.
        </p>

        <p class="font-weight-bold mt-4">
          For more information, read the
          <a
            target="_blank"
            href="https://www.manual.grid.tf/playground/nextcloud.html#set-the-dns-record"
            :style="{ color: 'inherit' }"
          >
            documentation</a
          >.
        </p>
      </v-alert>

      <SelectSolutionFlavor
        :minimum="{ cpu: 2, memory: 1024 * 4, disk: 50 }"
        :standard="{ cpu: 4, memory: 1024 * 8, disk: 500 }"
        :recommended="{ cpu: 4, memory: 1024 * 16, disk: 1000 }"
        v-model="solution"
      />

      <Network v-model:planetary="planetary" v-model:wireguard="wireguard" ref="network" />
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
            publicIp: ipv4,
            ssd: (solution?.disk ?? 0) + rootFilesystemSize,
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
            diskSizes: [solution?.disk],
            ipv4: ipv4,
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
          :root-file-system-size="rootFilesystemSize"
        />
      </SelectFarmManager>
    </form-validator>
    <template #footer-actions>
      <v-btn color="primary" variant="tonal" :disabled="!valid" @click="deploy">Deploy</v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";

import Network from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName } from "../types";
import { deployVM, type Disk, type Env } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { generateName } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const domain = ref("");
const profileManager = useProfileManager();

const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/threefoldtech-nextcloudaio-latest.flist",
  entryPoint: "/sbin/zinit init",
};

const name = ref(generateName(8, { prefix: "nc" }));
const ipv4 = ref(true);
const planetary = ref(true);
const wireguard = ref(true);
const farm = ref() as Ref<Farm>;
const network = ref();
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const rootFilesystemSize = 40;

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Nextcloud.toLowerCase();

  try {
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      network: {
        addAccess: wireguard.value,
      },
      machines: [
        {
          name: name.value,
          cpu: solution.value.cpu,
          memory: solution.value.memory,
          flist: flist.value,
          entryPoint: flist.entryPoint,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          disks: [
            {
              size: solution.value.disk,
              mountPoint: "/mnt/next_cloud",
            },
          ],
          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "NEXTCLOUD_DOMAIN", value: domain.value },
          ],
          planetary: planetary.value,
          publicIpv4: ipv4.value,
          rootFilesystemSize: rootFilesystemSize,
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus(
      "success",
      'Successfully deployed a Nextcloud AIO instance. Make sure to add a DNS A record (Host: "@", Value: <Public IPv4 Address>) to your domain. After DNS propagation, under Actions, click Open Nextcloud.',
    );
    layout.value.openDialog(vm, deploymentListEnvironments.vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy Nextcloud."));
  }
}
</script>

<script lang="ts">
import ExpandableLayout from "../components/expandable_layout.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import { deploymentListEnvironments } from "../constants";
import type { solutionFlavor as SolutionFlavor } from "../types";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";

const solution = ref() as Ref<SolutionFlavor>;

export default {
  name: "TfNextcloud",
  components: {
    SelectSolutionFlavor,
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
