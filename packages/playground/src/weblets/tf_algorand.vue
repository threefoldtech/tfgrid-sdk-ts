<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="storage + (type === 'indexer' ? 50 : 0)"
    :ipv4="ipv4"
    :dedicated="dedicated"
    :SelectedNode="selectionDetails?.node"
    :valid-filters="selectionDetails?.validFilters"
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
      <Networks v-model:mycelium="mycelium" />
      <v-switch color="primary" inset label="IPv4" v-model="ipv4" hide-details />

      <AlgorandCapacity
        :network="network"
        :type="type"
        v-model:cpu.number="cpu"
        v-model:memory.number="memory"
        v-model:storage.number="storage"
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
              />
            </input-tooltip>
          </input-validator>
        </template>
      </AlgorandCapacity>

      <input-tooltip
        inline
        tooltip="Click to know more about dedicated machines."
        href="https://www.manual.grid.tf/documentation/dashboard/deploy/dedicated_machines.html"
      >
        <v-switch color="primary" inset label="Dedicated" v-model="dedicated" hide-details />
      </input-tooltip>

      <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
        <v-switch color="primary" inset label="Certified" v-model="certified" hide-details />
      </input-tooltip>

      <TfSelectionDetails
        :filters-validators="{
          cpu: { min: type === 'relay' || type === 'indexer' ? 4 : 2 },
          memory: { min: type === 'relay' || type === 'indexer' ? 8192 : 4096 },
          ssdDisks:
            type === 'relay'
              ? { min: 950, max: 1150 }
              : type === 'indexer'
              ? { min: 1500, max: 1700 }
              : { min: 100, max: 300 },
        }"
        :filters="{
          ipv4,
          certified,
          dedicated,
          cpu,
          ssdDisks: [storage],
          solutionDisk: type === 'indexer' ? 50 : undefined,
          memory,
          rootFilesystemSize,
        }"
        v-model="selectionDetails"
      />
    </form-validator>
    <template #footer-actions>
      <v-btn color="secondary" variant="outlined" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { computed, type Ref, ref, watch } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Flist, ProjectName, type Validators } from "../types";
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
const name = ref(generateName({ prefix: "al" }));
const ipv4 = ref(false);
const mycelium = ref(false);
const cpu = ref() as Ref<number>;
const memory = ref() as Ref<number>;
const storage = ref() as Ref<number>;
const network = ref("mainnet");
const type = ref("default");
const account = ref("");
const wordsLength = computed(() => (account.value ? account.value.split(" ").length : 0));
const firstRound = ref(24000000);
const lastRound = ref(26000000);
const dedicated = ref(false);
const certified = ref(false);
const rootFilesystemSize = computed(() => storage.value);
const selectionDetails = ref<SelectionDetails>();

watch(firstRound, () => lastRoundInput.value.validate(lastRound.value.toString()));

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Algorand.toLowerCase() + "/" + name.value;

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
          mycelium: mycelium.value,
          planetary: true,
          nodeId: selectionDetails.value!.node!.nodeId,
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
import Networks from "../components/networks.vue";
import { deploymentListEnvironments } from "../constants";
import type { SelectionDetails } from "../types/nodeSelector";
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfAlgorand",
  components: { AlgorandCapacity, Networks },
};
</script>
