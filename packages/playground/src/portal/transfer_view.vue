<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab :value="0" color="primary">By Twin ID</v-tab>
        <v-tab :value="1" color="primary">By Address</v-tab>
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
                  <v-text-field
                    :rules="[() => parseInt(receipientTwinId) != senderTwinID || 'Cannot transfer to yourself']"
                    label="Recipient TwinID:"
                    v-bind="props"
                    v-model="receipientTwinId"
                  ></v-text-field>
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
              <v-btn @click="clearInput" class="primary white--text">Clear</v-btn>
              <v-btn
                class="primary white--text"
                :loading="loadingTwinIDTransfer"
                :disabled="!isValidTwinIDTransfer"
                @click="submitFormTwinID"
                >Send</v-btn
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
                  validators.required('Receipient address is required '),
                  validators.isAlphanumeric('Invalid Address'),
                ]"
                #="{ props }"
              >
                <input-tooltip tooltip="Enter Address of Receipient Account">
                  <v-text-field
                    label="Recipient Address:"
                    :rules="[
                      () => isValidAddress() || 'Invalid address',
                      () => isSameAddress() || 'Cannot transfer to yourself',
                    ]"
                    v-model="receipientAddress"
                    v-bind="props"
                  >
                  </v-text-field>
                </input-tooltip>
              </input-validator>
              <input-validator
                :value="transferAmount"
                :rules="[
                  validators.required('Transfer amount is required '),
                  validators.isNumeric('Amount should be a number.'),
                  validators.min('Amount must be greater than 0', 0.00000000001),
                  validators.max('Insufficient funds', freeBalance),
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
              <v-btn @click="clearInput" class="primary white--text">Clear</v-btn>

              <v-btn
                class="primary white--text"
                :loading="loadingAddressTransfer"
                :disabled="!isValidAddressTransfer"
                @click="submitFormAddress"
                >Send</v-btn
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
import { GridClient } from "@threefold/grid_client";
import type { Twin } from "@threefold/tfchain_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";

const activeTab = ref(0);
const receipientTwinId = ref("");
const isValidTwinIDTransfer = ref(false);
const transferAmount = ref(1);
const loadingTwinIDTransfer = ref(false);
const loadingAddressTransfer = ref(false);
const isValidAddressTransfer = ref(false);
const receipientAddress = ref("");
const profile = useProfileManager().profile;
const senderTwinID = profile!.twinId;
console.log(senderTwinID);
const gridClient = new GridClient({
  mnemonic: useProfileManager().profile!.mnemonic,
  network: window.env.NETWORK,
});
const freeBalance = ref(0);
onMounted(async () => {
  await gridClient.connect();
  await getFreeBalance();
});
function isSameAddress() {
  if (receipientAddress.value.trim() == profile?.address) {
    return false;
  }
  return true;
}
function isValidAddress() {
  const keyring = new Keyring({ type: "sr25519" });
  try {
    keyring.addFromAddress(receipientAddress.value.trim());

    return true;
  } catch (error) {
    return false;
  }
}

function clearInput() {
  transferAmount.value = 1;
  receipientTwinId.value = "";
  receipientAddress.value = "";
}
async function getFreeBalance() {
  const balance = await gridClient.balance.getMyBalance();
  freeBalance.value = balance.free;
}
async function transfer(receipientTwin: Twin) {
  try {
    gridClient.balance.transfer({ address: receipientTwin.accountId, amount: transferAmount.value });

    createToast("Transaction Complete!", {
      position: "top-right",
      hideProgressBar: true,
      toastBackgroundColor: "green",
      timeout: 5000,
    });

    await getFreeBalance();
  } catch (err) {
    createInvalidTransferToast("transfer failed!");
  }
}
async function submitFormAddress() {
  const twinId = await gridClient.twins.get_twin_id_by_account_id({ public_key: receipientAddress.value.trim() });
  const twinDetails = await gridClient.twins.get({ id: twinId });
  if (twinDetails != null) {
    loadingAddressTransfer.value = true;
    await transfer(twinDetails);
    loadingAddressTransfer.value = false;
  } else {
    createInvalidTransferToast("twin ID doesn't exist");
    loadingAddressTransfer.value = false;
  }
}

function createInvalidTransferToast(message: string) {
  createToast(message, {
    position: "top-right",
    hideProgressBar: true,
    toastBackgroundColor: "red",
    timeout: 5000,
  });
}
async function submitFormTwinID() {
  const twinDetails = await gridClient.twins.get({ id: parseInt(receipientTwinId.value) });

  if (twinDetails != null) {
    loadingTwinIDTransfer.value = true;
    await transfer(twinDetails);
    loadingTwinIDTransfer.value = false;
  } else {
    createInvalidTransferToast("twin ID doesn't exist");
    loadingTwinIDTransfer.value = false;
  }
}
</script>
