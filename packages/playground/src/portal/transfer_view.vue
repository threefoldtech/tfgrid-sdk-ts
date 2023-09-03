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
        <v-window-item :value="0">
          <v-card class="pa-5 my-5" flat>
            <form-validator v-model="isValidTwinIDTransfer"></form-validator>

            <input-validator
              :value="receptinTwinId"
              :rules="[validators.required('Recepient Twin ID is required'), validators.isNotEmpty('Invalid Twin ID')]"
              #="{ props }"
            >
              <input-tooltip tooltip="Receipient Twin ID">
                <v-text-field label="Recipient TwinID:" v-bind="props" v-model="receptinTwinId"></v-text-field>
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
              <input-tooltip tooltip="Transfer amount">
                <v-text-field label="Transfer Amount:" v-bind="props" v-model.number="transferAmount"></v-text-field>
              </input-tooltip>
            </input-validator>
            <span class="fee">0.01 transaction fee will be deducted</span>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>
              <v-btn
                class="primary white--text"
                :loading="loadingTransfer"
                :disabled="!isValidTwinIDTransfer"
                @submit="submitForm"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-window-item>
        <v-window-item :value="1">
          <v-card>puss</v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>
import { Client, QueryClient } from "@threefold/tfchain_client";
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
const receptinTwinId = ref("");
const isValidTwinIDTransfer = ref(false);
const transferAmount = ref(1);
const loadingTransfer = ref(false);

const queryClient = new QueryClient(window.env.SUBSTRATE_URL);
function clearInput() {
  transferAmount.value = 1;
  receptinTwinId.value = "";
}
async function getFreeBalance() {
  const profile = useProfileManager().profile;
  const grid = await getGrid(profile!);
  const balance = await loadBalance(grid!);
  freeBalance.value = balance.free;
}

async function submitForm() {
  const twinDetails = await queryClient.twins.get({ id: parseInt(receptinTwinId.value) });
  if (twinDetails != null) {
    const twinAddress = twinDetails.accountId;
    const client = new Client({
      url: window.env.SUBSTRATE_URL,
      mnemonicOrSecret: useProfileManager().profile!.mnemonic,
    });
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
      createToast("Transfer failed!", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "red",
        timeout: 5000,
      });
      loadingTransfer.value = false;
    }
  } else {
    createToast("Twin ID doesn't exist!", {
      position: "top-right",
      hideProgressBar: true,
      toastBackgroundColor: "red",
      timeout: 5000,
    });

    loadingTransfer.value = false;
  }
}
</script>
