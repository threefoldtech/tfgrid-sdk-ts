<template>
  <weblet-layout
    ref="layout"
    :cpu="solution?.cpu"
    :memory="solution?.memory"
    :disk="disks.reduce((total, disk) => total + disk.size, rootFilesystemSize)"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :rented-by="rentedBy"
    :selected-node="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
    title-image="images/icons/BTC_Node.png"
  >
    <template #title> Deploy a BTC Node Instance </template>

    <d-tabs ref="tabs" :tabs="[{ title: 'Config', value: 'config' }]">
      <template #config>
        <input-validator
          :value="name"
          :rules="[
            validators.required('Name is required.'),
            validators.IsAlphanumericExpectUnderscore('Name should consist of letters ,numbers and underscores only.'),
            (name: string) => validators.isAlpha('Name must start with an alphabetical character.')(name[0]),
            validators.minLength('Name must be at least 2 characters.', 2),
            validators.maxLength('Name cannot exceed 35 characters.', 35),
          ]"
          #="{ props }"
        >
          <input-tooltip tooltip="Instance name.">
            <v-text-field v-model="name" label="Name" v-bind="props" />
          </input-tooltip>
        </input-validator>

        <SelectSolutionFlavor
          v-model="solution"
          :small="{ cpu: 2, memory: 4, disk: 50 }"
          :medium="{ cpu: 4, memory: 8, disk: 100 }"
          :large="{ cpu: 8, memory: 16, disk: 200 }"
        />

        <Networks
          v-model:ipv4="ipv4"
          v-model:ipv6="ipv6"
          v-model:planetary="planetary"
          v-model:mycelium="mycelium"
          v-model:wireguard="wireguard"
          required
        />

        <TfSelectionDetails
          v-model="selectionDetails"
          v-model:rented-by-me="rentedByMe"
          v-model:dedicated="dedicated"
          v-model:certified="certified"
          :filters="{
            ipv4,
            ipv6,
            certified,
            dedicated,
            rentedBy,
            cpu: solution?.cpu,
            ssdDisks: disks.map(disk => disk.size),
            solutionDisk: solution?.disk,
            memory: solution?.memory,
            rootFilesystemSize,
            planetary,
            mycelium,
            wireguard,
          }"
        />

        <manage-ssh-deployemnt @selected-keys="updateSSHkeyEnv($event)" />
      </template>
    </d-tabs>

    <template #footer-actions="{ validateBeforeDeploy }">
      <v-btn
        text="Deploy"
        variant="elevated"
        class="text-primery px-10 py-3 h-auto text-subtitle-1"
        @click="validateBeforeDeploy(deploy)"
      />
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";

import Networks, { useNetworks } from "../components/networks.vue";
import SelectSolutionFlavor from "../components/select_solution_flavor.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useGrid } from "../stores";
import { ProjectName } from "../types";
import { deployVM, type Disk } from "../utils/deploy_vm";
import { generateName } from "../utils/strings";

const layout = useLayout();
const tabs = ref();
const selectionDetails = ref<SelectionDetails>();
const name = ref(generateName({ prefix: "btc" }));
const { ipv4, ipv6, planetary, mycelium, wireguard } = useNetworks();
const disks = ref<Disk[]>([]);
const dedicated = ref(false);
const rentedByMe = ref(false);
const rentedBy = computed(() => (rentedByMe.value ? grid.twinId : undefined));
const certified = ref(false);
const rootFilesystemSize = computed(() => solution.value?.disk);
const selectedSSHKeys = ref("");
const gridStore = useGrid();
const grid = gridStore.client as GridClient;
const flist: Flist = FLISTS.BTCNODE;

function finalize(deployment: any) {
  layout.value.reloadDeploymentsList();
  layout.value.setStatus("success", "Successfully deployed a BTC Node instance.");
  layout.value.openDialog(deployment, deploymentListEnvironments.btcnode);
}

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.BTCNode.toLowerCase() + "/" + name.value;

  try {
    updateGrid(grid, { projectName });

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
          disks: disks.value,
          envs: [
            {
              key: "SSH_KEY",
              value: selectedSSHKeys.value,
            },
          ],
          planetary: planetary.value,
          mycelium: mycelium.value,
          publicIpv4: ipv4.value,
          publicIpv6: ipv6.value,
          rootFilesystemSize: rootFilesystemSize.value,
          nodeId: selectionDetails.value?.node?.nodeId,
          rentedBy: rentedBy.value,
          certified: certified.value,
        },
      ],
    });

    finalize(vm);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy BTC Node instance."));
  }
}

function updateSSHkeyEnv(selectedKeys: string) {
  selectedSSHKeys.value = selectedKeys;
}
</script>

<script lang="ts">
import type { GridClient } from "@threefold/grid_client";
import { FLISTS } from "@threefold/grid_client";

import ManageSshDeployemnt from "../components/ssh_keys/ManageSshDeployemnt.vue";
import { deploymentListEnvironments } from "../constants";
import type { Flist, solutionFlavor as SolutionFlavor } from "../types";
import type { SelectionDetails } from "../types/nodeSelector";
import { updateGrid } from "../utils/grid";
import { normalizeError } from "../utils/helpers";

const solution = ref() as Ref<SolutionFlavor>;

export default {
  name: "BTCNode",
  components: {
    ManageSshDeployemnt,
    SelectSolutionFlavor,
  },
};
</script>
