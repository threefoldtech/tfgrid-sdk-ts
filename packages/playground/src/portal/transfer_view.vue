<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab :value="0">By Twin ID</v-tab>
        <v-tab :value="1">By Address</v-tab>
      </v-tabs>
      <v-window v-model="activeTab">
        <!-- TwinID Transfer -->
        <v-window-item :value="0">
          <v-card class="pa-5 my-5" flat>
            <form-validator v-model="isValidTwinIDTransfer">
              <input-validator
                :value="receipientTwinId"
                :rules="[
                  validators.required('Recepient Twin ID is required'),
                  validators.isNotEmpty('Invalid Twin ID'),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Enter Twin ID of Receipient Account">
                  <v-text-field label="Recipient TwinID:" v-bind="props" v-model="receipientTwinId"></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="transferAmount"
                :rules="[
                  validators.required('Transfer amount is required '),
                  validators.isNumeric('Amount should be a number.'),
                  validators.min('Amount must be greater than 0', 0.00000000001),
                  validators.max('Insuffient funds', freeBalance),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="0.01 transaction fee will be deducted">
                  <v-text-field label="Transfer Amount:" v-bind="props" v-model.number="transferAmount"></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>

              <v-btn
                class="primary white--text"
                :loading="loadingTransfer"
                :disabled="!isValidTwinIDTransfer"
                @submit="submitFormTwinID"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-window-item>
        <!-- Address Transfer -->

        <v-window-item :value="1">
          <v-card class="pa-5 my-5" flat>
            <form-validator v-model="isValidAddressTransfer">
              <input-validator
                :value="receipientAddress"
                :rules="[
                  validators.required('Recepient Account Address is required'),
                  validators.isNotEmpty('Invalid Account Address'),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Enter Address of Receipient Account">
                  <v-text-field label="Recipient Address:" v-bind="props" v-model="receipientAddress"> </v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                :value="transferAmount"
                :rules="[
                  validators.required('Transfer amount is required '),
                  validators.isNumeric('Amount should be a number.'),
                  validators.min('Amount must be greater than 0', 0.00000000001),
                  validators.max('Insuffient funds', freeBalance),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="0.01 transaction fee will be deducted">
                  <v-text-field label="Transfer Amount:" v-bind="props" v-model.number="transferAmount"></v-text-field>
                </input-tooltip>
              </input-validator>
            </form-validator>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>

              <v-btn
                class="primary white--text"
                :loading="loadingTransfer"
                :disabled="!isValidAddressTransfer"
                @submit="submitFormAddress"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>
import { Keyring } from "@polkadot/keyring";
import { Client, QueryClient, type Twin } from "@threefold/tfchain_client";
import Decimal from "decimal.js";
import { createToast } from "mosha-vue-toastify";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, loadBalance } from "../utils/grid";

onMounted(async () => {
  await getFreeBalance();
});

const freeBalance = ref(0);
const activeTab = ref(0);
const receipientTwinId = ref("");
const isValidTwinIDTransfer = ref(false);
const transferAmount = ref(1);
const loadingTransfer = ref(false);
const isValidAddressTransfer = ref(false);
const receipientAddress = ref("");
const profile = useProfileManager().profile;

const queryClient = new QueryClient(window.env.SUBSTRATE_URL);
const client = new Client({
  url: window.env.SUBSTRATE_URL,
  mnemonicOrSecret: useProfileManager().profile!.mnemonic,
});
function isValidAddress() {
  const keyring = new Keyring({ type: "sr25519" });
  try {
    keyring.addFromAddress(receipientAddress.value);

    return true;
  } catch (error) {
    return "invalid";
  }
}

function clearInput() {
  transferAmount.value = 1;
  receipientTwinId.value = "";
}
async function getFreeBalance() {
  const grid = await getGrid(profile!);
  const balance = await loadBalance(grid!);
  freeBalance.value = balance.free;
}
async function transfer(receipientTwin: Twin) {
  const twinAddress = receipientTwin.accountId;

  loadingTransfer.value = true;
  const decimalAmount = new Decimal(transferAmount.value);
  const milliAmount = decimalAmount.mul(10 ** 7).toNumber();
  try {
    const transferResult = await client.balances.transfer({
      address: twinAddress,
      amount: milliAmount,
    });
    await transferResult.apply();
    createToast("Transaction submitted!", {
      position: "top-right",
      hideProgressBar: true,
      toastBackgroundColor: "green",
      timeout: 5000,
    });

    loadingTransfer.value = false;
    await getFreeBalance();
  } catch (err) {
    createInvalidTransferToast("transfer failed!");
  }
}
async function submitFormAddress() {
  const twinId = await queryClient.twins.getTwinIdByAccountId({ accountId: receipientAddress.value });
  const twinDetails = await queryClient.twins.get({ id: parseInt(twinId.value) });
  if (twinDetails != null) {
    transfer(twinDetails);
  } else {
    createInvalidTransferToast("twin ID doesn't exist");
  }
}

function createInvalidTransferToast(message: string) {
  createToast(message, {
    position: "top-right",
    hideProgressBar: true,
    toastBackgroundColor: "red",
    timeout: 5000,
  });

  loadingTransfer.value = false;
}
async function submitFormTwinID() {
  const twinDetails = await queryClient.twins.get({ id: parseInt(receipientTwinId.value) });
  if (twinDetails != null) {
    transfer(twinDetails);
  } else {
    createInvalidTransferToast("twin ID doesn't exist");
  }
}
</script>
