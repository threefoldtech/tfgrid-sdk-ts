<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-swap-horizontal</v-icon>
      <v-card-title class="pa-0">Transfer TFT Across Chains</v-card-title>
    </v-card>
    <v-card class="pa-5 white--text">
      <v-row class="pa-5 text-center">
        <v-col cols="12">
          <v-select
            :items="items"
            label="Please select a chain:"
            item-title="name"
            item-value="id"
            v-model="selectedItem"
          ></v-select>
        </v-col>
      </v-row>
      <v-row class="pa-4 px-8">
        <v-btn color="primary" class="mr-2" @click="openDepositDialog = true">Deposit</v-btn>
        <v-btn variant="outlined" color="secondary" class="mr-2" @click="openWithdrawDialog = true">Withdraw</v-btn>
        <v-btn color="blue" class="ml-auto" @click="navigation">Learn How?</v-btn>
      </v-row>
    </v-card>
  </div>

  <!-- Deposit Dialog -->
  <deposit-dialog
    v-if="openDepositDialog"
    :selectedName="selectedName"
    :depositWallet="depositWallet"
    :qrCodeText="qrCodeText"
    :depositFee="depositFee"
    :openDepositDialog="openDepositDialog"
    :twinId="profileManager.profile?.twinId"
    @close="openDepositDialog = false"
  ></deposit-dialog>

  <!-- Withdraw Dialog -->
  <v-container v-if="openWithdrawDialog">
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="openWithdrawDialog" persistent>
      <v-card>
        <v-toolbar color="primary" dark class="bold-text justify-center"> Withdraw TFT </v-toolbar>
        <v-card-text>
          Interact with the bridge in order to withdraw your TFT to
          {{ selectedName.charAt(0).toUpperCase() + selectedName.slice(1) }} (withdraw fee is: {{ withdrawFee }} TFT)
        </v-card-text>
        <v-card-text>
          <v-form v-model="isValidSwap">
            <v-text-field
              v-model="target"
              :label="selectedName.charAt(0).toUpperCase() + selectedName.slice(1) + ' Target Wallet Address'"
              :error-messages="targetError"
              :disabled="validatingAddress"
              :loading="validatingAddress"
              :rules="[() => !!target || 'This field is required', swapAddressCheck]"
            >
            </v-text-field>
            <v-text-field
              @paste.prevent
              label="Amount (TFT)"
              v-model="amount"
              type="number"
              onkeydown="javascript: return event.keyCode == 69 || /^\+$/.test(event.key) ? false : true"
              :rules="[
                () => !!amount || 'This field is required',
                () =>
                  (amount.toString().split('.').length > 1 ? amount.toString().split('.')[1].length <= 3 : true) ||
                  'Amount must have 3 decimals only',
                () => amount >= 2 || 'Amount should be at least 2 TFT',
                () => amount < freeBalance || 'Amount cannot exceed balance',
              ]"
            >
            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end pb-4 px-6">
          <v-btn
            class="white--text"
            @click="withdrawTFT(target, amount)"
            :disabled="!isValidSwap || validatingAddress"
            :loading="loadingWithdraw"
            >Send</v-btn
          >
          <v-btn variant="outlined" color="anchor" class="bold-text" @click="openWithdrawDialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { default as StellarSdk, StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid, loadBalance } from "../utils/grid";

const profileManager = useProfileManager();
const items = ref([{ id: 1, name: "stellar" }]);
const selectedItem = ref(items.value[0]);
const openDepositDialog = ref(false);
const openWithdrawDialog = ref(false);
const selectedName = ref("");
const withdrawFee = ref(0);
const isValidSwap = ref(false);
const target = ref("");
const targetError = ref("");
const validatingAddress = ref(false);
const server = new StellarSdk.Server(window.env.STELLAR_HORIZON_URL);
const amount = ref(2);
const freeBalance = ref(0);
const loadingWithdraw = ref(false);
const depositWallet = ref("");
const qrCodeText = ref("");
const depositFee = ref(0);
const ProfileManagerController = useProfileManagerController();

onMounted(async () => {
  selectedName.value = items.value.filter(item => item.id === selectedItem.value.id)[0].name;
  depositWallet.value = window.env.BRIDGE_TFT_ADDRESS;
  qrCodeText.value = `TFT:${depositWallet.value}?message=twin_${profileManager.profile?.twinId}&sender=me`;
  try {
    const grid = await getGrid(profileManager.profile!);
    if (grid) {
      const WithdrawFee = await grid.bridge.getWithdrawFee();
      withdrawFee.value = WithdrawFee;

      const DepositFee = await grid.bridge.getDepositFee();
      depositFee.value = DepositFee;

      const balance = await loadBalance(grid);
      freeBalance.value = balance.free;
    }
  } catch (e) {
    console.log(e);
  }
});

function navigation() {
  window.open(
    "https://manual.grid.tf/threefold_token/tft_bridges/tfchain_stellar_bridge.html#how-to-use-the-tfchain-stellar-bridge",
    "_blank",
  );
}

function swapAddressCheck() {
  targetError.value = "";
  if (!target.value) return true;
  const isValid = StrKey.isValidEd25519PublicKey(target.value);
  const blockedAddresses = [
    "GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC",
    "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4",
  ];
  if (blockedAddresses.includes(target.value)) {
    targetError.value = "Blocked Address";
    return false;
  }
  if (!isValid || target.value.match(/\W/)) {
    targetError.value = "invalid address";
    return false;
  }
  targetError.value = "";
  validatingAddress.value = true;
  isValidSwap.value = false;
  if (selectedName.value == "stellar") validateAddress();
  return true;
}

async function validateAddress() {
  try {
    // check if the account provided exists on stellar
    const account = await server.loadAccount(target.value);
    // check if the account provided has the appropriate trustlines
    const includes = account.balances.find(
      (b: { asset_code: string; asset_issuer: string }) =>
        b.asset_code === "TFT" && b.asset_issuer === window.env.TFT_ASSET_ISSUER,
    );
    if (!includes) throw new Error("invalid trustline");
  } catch (e) {
    targetError.value =
      (e as Error).message === "invalid trustline"
        ? "Address does not have a valid trustline to TFT"
        : "Address not found";
    validatingAddress.value = false;
    isValidSwap.value = false;
    return;
  }

  validatingAddress.value = false;
  return;
}

async function withdrawTFT(targetAddress: string, withdrawAmount: number) {
  loadingWithdraw.value = true;
  try {
    const grid = await getGrid(profileManager.profile!);
    await grid?.bridge.swapToStellar({ amount: +withdrawAmount, target: targetAddress });

    openWithdrawDialog.value = false;
    target.value = "";
    amount.value = 2;
    loadingWithdraw.value = false;
    await ProfileManagerController.reloadBalance();
    createCustomToast("Transaction Succeeded", ToastType.success);
  } catch (e) {
    console.log("Error withdrawing, Error: ", e);
    openWithdrawDialog.value = false;
    target.value = "";
    amount.value = 2;
    loadingWithdraw.value = false;
    createCustomToast("Withdraw Failed!", ToastType.danger);
  }
}
</script>

<script lang="ts">
import DepositDialog from "../components/deposit_dialog.vue";

export default {
  name: "Bridge",
  components: {
    DepositDialog,
  },
};
</script>

<style>
.custom-container {
  width: 80%;
}

.bold-text {
  font-weight: 500;
  padding-left: 1rem;
}
</style>
