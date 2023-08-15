<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="storage + (type === 'indexer' ? 50 : 0)"
    :ipv4="ipv4"
    :certified="certified"
    :dedicated="dedicated"
    title-image="images/icons/algorand.png"
  >
    <template #title>Deploy a Algorand Instance </template>
    <form-validator v-model="valid">
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
      <v-switch color="primary" inset label="IPv4" v-model="ipv4" :disabled="loadingFarm" hide-details />
      <AlgorandCapacity
        :network="network"
        :type="type"
        v-model:cpu.number="cpu"
        v-model:memory.number="memory"
        v-model:storage.number="storage"
        v-model:disabled="loadingFarm"
      >
        <input-tooltip tooltip="Select a network to work against.">
          <v-select
            label="Network"
            :items="[
              { title: 'Mainnet', value: 'mainnet' },
              { title: 'Testnet', value: 'testnet' },
              { title: 'Betanet', value: 'betanet' },
              { title: 'Devnet', value: 'devnet' },
            ]"
            v-model="network"
            :disabled="loadingFarm"
          />
        </input-tooltip>

        <input-tooltip tooltip="Select node type.">
          <v-select
            label="Node Type"
            :items="[
              { title: 'Default', value: 'default' },
              { title: 'Participant', value: 'participant' },
              { title: 'Relay', value: 'relay' },
              { title: 'Indexer', value: 'indexer' },
            ]"
            v-model="type"
            :disabled="loadingFarm"
          />
        </input-tooltip>

        <template v-if="type === 'participant'">
          <input-validator
            :value="account"
            :rules="[
              validators.required('Mnemonic is required.'),
              value => {
                return validators.isAlpha('Mnemonic can contain only alphabetic characters.')(value.replace(/\s/g, ''));
              },
              customAccountValidation,
            ]"
            #="{ props }"
          >
            <input-tooltip
              tooltip="Account mnemonic is the private key of your Algorand wallet and it consists of 24 words "
            >
              <v-text-field
                label="Account Mnemonic"
                placeholder="Algorand Account Mnemonic"
                v-model.trim="account"
                v-bind="props"
                autofocus
                counter
              >
                <template #counter>
                  <span :class="{ 'text-red': wordsLength > 25 }">{{ wordsLength }}</span>
                  / 25
                </template>
              </v-text-field>
            </input-tooltip>
          </input-validator>

          <input-validator
            :value="firstRound"
            :rules="[
              validators.required('First round is required.'),
              validators.isInt('First round must be a valid integer.'),
              validators.min('First round must be greater than 0.', 1),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="First Validation Block.">
              <v-text-field
                label="First Round"
                placeholder="First Validation Block"
                v-model.number="firstRound"
                v-bind="props"
                type="number"
                :disabled="loadingFarm"
              />
            </input-tooltip>
          </input-validator>

          <input-validator
            :value="lastRound"
            :rules="[
              validators.required('Last round is required.'),
              validators.isInt('Last round must be a valid integer.'),
              customLastRoundValidation(validators),
            ]"
            #="{ props }"
            ref="lastRoundInput"
          >
            <input-tooltip tooltip="Last Validation Block">
              <v-text-field
                label="Last Round"
                placeholder="Last Validation Block"
                v-model.number="lastRound"
                v-bind="props"
                type="number"
                :disabled="loadingFarm"
              />
            </input-tooltip>
          </input-validator>
        </template>
      </AlgorandCapacity>

      <input-tooltip
        inline
        tooltip="Click to know more about dedicated nodes."
        href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
      >
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" :disabled="loadingFarm" hide-details />
      </input-tooltip>

      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" :disabled="loadingFarm" hide-details />
      </input-tooltip>

      <SelectFarmManager>
        <SelectFarm
          :filters="{
            cpu: cpu,
            memory: memory,
            ssd: storage + (type === 'indexer' ? 50 : 0),
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
            cpu,
            memory,
            ipv4: ipv4,
            ipv6: ipv4,
            type: type,
            diskSizes: type === 'indexer' ? [50] : [],
            rentedBy: dedicated ? profileManager.profile?.twinId : undefined,
            certified: certified,
          }"
          :root-file-system-size="rootFilesystemSize"
        />
      </SelectFarmManager>
    </form-validator>
    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref, watch } from "vue";

import Network from "../components/networks.vue";
import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, type Flist, ProjectName, type Validators } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";
import { generateName } from "../utils/strings";

const layout = useLayout();
const valid = ref(false);
const lastRoundInput = ref();
const profileManager = useProfileManager();
const flist: Flist = {
  value: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
  entryPoint: "/sbin/zinit init",
};
const name = ref(generateName(9, { prefix: "al" }));
const ipv4 = ref(false);
const cpu = ref() as Ref<number>;
const memory = ref() as Ref<number>;
const storage = ref() as Ref<number>;
const network = ref("mainnet");
const type = ref("default");
const account = ref("");
const wordsLength = computed(() => (account.value ? account.value.split(" ").length : 0));
const firstRound = ref(24000000);
const lastRound = ref(26000000);
const farm = ref() as Ref<Farm>;
const dedicated = ref(false);
const certified = ref(false);
const loadingFarm = ref(false);
const selectedNode = ref() as Ref<INode>;
const rootFilesystemSize = computed(() => storage.value);
watch(firstRound, () => lastRoundInput.value.validate(lastRound.value.toString()));

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Algorand.toLowerCase();

  try {
    layout.value?.validateSSH();
    const grid = await getGrid(profileManager.profile!, projectName);

    await layout.value.validateBalance(grid!);

    const vm = await deployVM(grid!, {
      name: name.value,
      machines: [
        {
          name: name.value,
          cpu: cpu.value,
          memory: memory.value,
          farmId: farm.value.farmID,
          farmName: farm.value.name,
          country: farm.value.country,
          flist: flist.value,
          entryPoint: flist.entryPoint,
          disks:
            type.value === "indexer"
              ? [
                  {
                    size: 50,
                    mountPoint: "/var/lib/docker",
                  },
                ]
              : [],
          rootFilesystemSize: rootFilesystemSize.value,
          publicIpv4: ipv4.value,
          planetary: true,
          nodeId: selectedNode.value.nodeId,
          rentedBy: dedicated.value ? grid!.twinId : undefined,
          certified: certified.value,

          envs: [
            { key: "SSH_KEY", value: profileManager.profile!.ssh },
            { key: "NETWORK", value: network.value },
            { key: "NODE_TYPE", value: type.value },
            ...(type.value === "participant"
              ? [
                  { key: "ACCOUNT_MNEMONICS", value: account.value },
                  { key: "FIRST_ROUND", value: firstRound.value.toString() },
                  { key: "LAST_ROUND", value: lastRound.value.toString() },
                ]
              : []),
          ],
        },
      ],
    });

    layout.value.reloadDeploymentsList();
    layout.value.setStatus("success", "Successfully deployed an alogrand node.");
    layout.value.openDialog(vm, deploymentListEnvironments.algorand);
  } catch (e) {
    layout.value.setStatus("failed", normalizeError(e, "Failed to deploy an alogrand node."));
  }
}

function customAccountValidation(value: string) {
  if (value.split(" ").length !== 25) {
    return { message: "Mnemonic must have 25 words separated by spaces." };
  }
}

function customLastRoundValidation(validators: Validators) {
  return (value: string) => {
    const min = firstRound.value;
    return validators.min(`Last round must be greater than ${min}`, min + 1)(value);
  };
}
</script>

<script lang="ts">
import AlgorandCapacity from "../components/algorand_capacity.vue";
import SelectFarm from "../components/select_farm.vue";
import SelectFarmManager from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import { deploymentListEnvironments } from "../constants";
import type { INode } from "../utils/filter_nodes";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfAlgorand",
  components: {
    SelectFarm,
    SelectNode,
    AlgorandCapacity,
    SelectFarmManager,
  },
};
</script>
