<template>
  <weblet-layout
    ref="layout"
    :cpu="cpu"
    :memory="memory"
    :disk="storage + (type === 'indexer' ? 50 : 0)"
    title-image="images/icons/algorand.png"
  >
    <template #title>Deploy a Algorand Instance </template>
    <template #subtitle>
      Algorand (ALGO) is a blockchain platform and cryptocurrency designed to function like a major payments processor.
      <a target="_blank" href="https://manual.grid.tf/weblets/weblets_algorand.html" class="app-link">
        Quick start documentation
      </a>
    </template>

    <form-validator v-model="valid">
      <input-validator
        :value="name"
        :rules="[
          validators.required('Name is required.'),
          validators.isAlphanumeric('Name should consist of letters only.'),
          name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
          validators.minLength('Name minLength is 2 chars.', 2),
          validators.maxLength('Name maxLength is 15 chars.', 15),
        ]"
        #="{ props }"
      >
        <v-text-field label="Name" v-model="name" v-bind="props" />
      </input-validator>

      <v-switch color="primary" inset label="Public IPv4" v-model="ipv4" />

      <AlgorandCapacity
        :network="network"
        :type="type"
        v-model:cpu.number="cpu"
        v-model:memory.number="memory"
        v-model:storage.number="storage"
      >
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
            <v-text-field
              label="First Round"
              placeholder="First Validation Block"
              v-model.number="firstRound"
              v-bind="props"
              type="number"
            />
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
            <v-text-field
              label="Last Round"
              placeholder="Last Validation Block"
              v-model.number="lastRound"
              v-bind="props"
              type="number"
            />
          </input-validator>
        </template>
      </AlgorandCapacity>

      <SelectFarm
        :filters="{
          cpu: cpu,
          memory: memory,
          ssd: storage + (type === 'indexer' ? 50 : 0),
          publicIp: ipv4,
        }"
        v-model="farm"
      />
    </form-validator>

    <template #footer-actions>
      <v-btn color="primary" variant="tonal" @click="deploy" :disabled="!valid"> Deploy </v-btn>
    </template>
  </weblet-layout>
</template>

<script lang="ts" setup>
import { generateString } from "@threefold/grid_client";
import { computed, type Ref, ref, watch } from "vue";

import { useLayout } from "../components/weblet_layout.vue";
import { useProfileManager } from "../stores";
import { type Farm, ProjectName, type Validators } from "../types";
import { deployVM } from "../utils/deploy_vm";
import { getGrid } from "../utils/grid";

const layout = useLayout();
const valid = ref(false);
const lastRoundInput = ref();
const profileManager = useProfileManager();

const name = ref("al" + generateString(9));
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

watch(firstRound, () => lastRoundInput.value.validate(lastRound.value.toString()));

async function deploy() {
  layout.value.setStatus("deploy");

  const projectName = ProjectName.Algorand.toLowerCase();

  try {
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
          flist: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
          entryPoint: "/sbin/zinit init",
          rootFilesystemSize: storage.value,
          publicIpv4: ipv4.value,
          planetary: true,
          disks:
            type.value === "indexer"
              ? [
                  {
                    size: 50,
                    mountPoint: "/var/lib/docker",
                  },
                ]
              : [],
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
    layout.value.openDialog(vm, {
      SSH_KEY: "Public SSH Key",
      NETWORK: "Network",
      NODE_TYPE: "Node Type",
      ACCOUNT_MNEMONICS: "Account Mnemonic",
      FIRST_ROUND: "First Round",
      LAST_ROUND: "Last Round",
    });
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
import { normalizeError } from "../utils/helpers";

export default {
  name: "TfAlgorand",
  components: {
    SelectFarm,
    AlgorandCapacity,
  },
};
</script>
