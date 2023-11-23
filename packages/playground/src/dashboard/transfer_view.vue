<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-account-arrow-right-outline</v-icon>
      <v-card-title class="pa-0">Transfer TFTs on the TFChain</v-card-title>
    </v-card>
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab :value="0" color="secondary">By Twin ID</v-tab>
        <v-tab :value="1" color="secondary">By Address</v-tab>
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
                  validators.isNumeric('Twin ID should be a number'),
                  validators.min('Twin ID should be more than 0', 1),
                  isSameTwinID,
                ]"
                :async-rules="[isValidTwinID]"
                #="{ props }"
              >
                <input-tooltip tooltip="Enter Twin ID of Receipient Account">
                  <v-text-field label="Recipient TwinID:" v-bind="props" v-model="receipientTwinId"></v-text-field>
                </input-tooltip>
              </input-validator>

              <input-validator
                v-if="!loadingBalance"
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
              <strong v-else>Loading...</strong>
            </form-validator>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="clearInput" class="primary white--text">Clear</v-btn>
              <v-btn
                color="primary"
                variant="tonal"
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
                  isSameAddress,
                ]"
                :async-rules="[isValidAddress]"
                #="{ props }"
              >
                <input-tooltip tooltip="Enter Address of Receipient Account">
                  <v-text-field label="Recipient Address:" v-model="receipientAddress" v-bind="props"> </v-text-field>
                </input-tooltip>
              </input-validator>
              <input-validator
                v-if="!loadingBalance"
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
              <strong v-else>Loading...</strong>
            </form-validator>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="clearInput" class="primary white--text">Clear</v-btn>

              <v-btn
                color="primary"
                variant="tonal"
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
  </div>
</template>

<script lang="ts" setup>
import { Keyring } from "@polkadot/keyring";
import type { Twin } from "@threefold/tfchain_client";
import { onMounted, ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid, loadBalance } from "../utils/grid";

const profileManagerController = useProfileManagerController();
const activeTab = ref(0);
const receipientTwinId = ref("");
const isValidTwinIDTransfer = ref(false);
const transferAmount = ref(1);
const loadingTwinIDTransfer = ref(false);
const loadingAddressTransfer = ref(false);
const isValidAddressTransfer = ref(false);
const receipientAddress = ref("");
const profileManager = useProfileManager();
const profile = ref(profileManager.profile!);
const loadingBalance = ref(true);
const recepTwinFromAddress = ref<Twin>();
const receptTwinFromTwinID = ref<Twin>();
const freeBalance = ref(0);
onMounted(async () => {
  await getFreeBalance();
});
function isSameTwinID(value: string) {
  if (parseInt(value.trim()) == profile.value?.twinId) {
    return { message: "Cannot transfer to yourself" };
  }
}
async function isValidTwinID(value: string) {
  const grid = await getGrid(profile.value);
  try {
    if (grid) {
      receptTwinFromTwinID.value = await grid.twins.get({ id: parseInt(value.trim()) });
      if (receptTwinFromTwinID.value == null) {
        return { message: "Invalid Twin ID. This ID has no Twin." };
      }
    }
  } catch (err) {
    return { message: "Invalid Twin ID. This ID has no Twin." };
  }
}
function isSameAddress(value: string) {
  if (value.trim() == profile.value?.address) {
    return { message: "Cannot transfer to yourself" };
  }
}
async function isValidAddress() {
  const grid = await getGrid(profile.value);
  const keyring = new Keyring({ type: "sr25519" });
  try {
    keyring.addFromAddress(receipientAddress.value.trim());
  } catch (error) {
    return { message: "Invalid address." };
  }
  try {
    if (grid) {
      const twinId = await grid.twins.get_twin_id_by_account_id({
        public_key: receipientAddress.value.trim(),
      });
      recepTwinFromAddress.value = await grid.twins.get({ id: twinId });
      if (recepTwinFromAddress.value == null) {
        return { message: "Twin ID doesn't exist" };
      }
    }
  } catch (err) {
    return { message: "Invalid address. Twin ID doesn't exist" };
  }
}
function clearInput() {
  transferAmount.value = 1;
  receipientTwinId.value = "";
  receipientAddress.value = "";
}
async function getFreeBalance() {
  const grid = await getGrid(profile.value);
  if (grid) {
    loadingBalance.value = true;
    const balance = await loadBalance(grid);
    freeBalance.value = balance.free;
    loadingBalance.value = false;
  }
}
async function transfer(receipientTwin: Twin) {
  const grid = await getGrid(profile.value);
  try {
    if (grid) {
      await grid.balance.transfer({ address: receipientTwin.accountId, amount: transferAmount.value });
      createCustomToast("Transaction Complete!", ToastType.success);
      profileManagerController.reloadBalance();
      await getFreeBalance();
    }
  } catch (err) {
    createInvalidTransferToast("transfer failed!");
  }
}
async function submitFormAddress() {
  loadingAddressTransfer.value = true;
  await transfer(recepTwinFromAddress.value!);
  loadingAddressTransfer.value = false;
}
function createInvalidTransferToast(message: string) {
  createCustomToast(message, ToastType.danger);
}
async function submitFormTwinID() {
  const grid = await getGrid(profile.value);
  if (grid) {
    const twinDetails = await grid.twins.get({ id: parseInt(receipientTwinId.value.trim()) });
    if (twinDetails != null) {
      loadingTwinIDTransfer.value = true;
      await transfer(twinDetails);
      loadingTwinIDTransfer.value = false;
    } else {
      createInvalidTransferToast("twin ID doesn't exist");
      loadingTwinIDTransfer.value = false;
    }
  }
}
</script>
