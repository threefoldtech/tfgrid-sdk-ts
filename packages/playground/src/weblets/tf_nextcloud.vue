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

        <SelectSolutionFlavor
          v-model="solution"
          :minimum="{ cpu: 2, memory: 1024 * 4, disk: 50 }"
          :standard="{ cpu: 2, memory: 1024 * 8, disk: 500 }"
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
import { getGrid } from "../utils/grid";
import { generateName, generatePassword } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const profileManager = useProfileManager();

const name = ref(generateName(9, { prefix: "nc" }));
const username = ref("admin");
const password = ref(generatePassword());
const solution = ref() as Ref<SolutionFlavor>;
const farm = ref() as Ref<Farm>;
const flist: Flist = {
  value: "https://hub.grid.tf/idrnd.3bot/logismosis-nextcloud-aio2-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const dedicated = ref(false);
const certified = ref(false);
const selectedNode = ref() as Ref<INode>;
const ipv4 = ref(false);
const domainNameCmp = ref();

const rootFilesystemSize = 8;
function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a Nextcloud instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.nextcloud);
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
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
