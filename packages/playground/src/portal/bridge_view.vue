<template>
  <div class="mt-8">
    <v-container class="custom-container">
      <v-card color="primary" class="my-3 pa-3 text-center">
        <v-icon width="26">mdi-swap-horizontal</v-icon>
        <h2>Transfer TFT Across Chains</h2>
      </v-card>
      <v-card class="pa-5 my-5 white--text">
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
          <v-btn color="primary" class="mr-2 bold-text" @click="openDepositDialog = true">Deposit</v-btn>
          <v-btn color="black" class="mr-2 bold-text" @click="openWithdrawDialog = true">Withdraw</v-btn>
          <v-btn color="blue" class="ml-auto bold-text" @click="navigation">Learn How?</v-btn>
        </v-row>
      </v-card>
    </v-container>
  </div>

  <v-container>
    <DepositDialog v-if="openDepositDialog"></DepositDialog>
  </v-container>
  <v-container v-if="openWithdrawDialog">
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="openWithdrawDialog">
      <v-card>
        <v-toolbar color="primary" dark class="pl-3"> Withdraw TFT </v-toolbar>
        <v-card-title>
          Interact with the bridge in order to withdraw your TFT to
          {{ selectedName.toUpperCase() }} (withdraw fee is: {{ withdrawFee }} TFT)
        </v-card-title>
        <v-card-text>
          <v-form v-model="isValidSwap">
            <v-text-field
              v-model="target"
              :label="selectedName.toUpperCase() + ' Target Wallet Address'"
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
        <v-card-actions class="justify-end">
          <v-btn color="primary" class="bold-text" @click="openWithdrawDialog = false"> Close </v-btn>
          <v-btn
            class="white--text"
            @click="withdrawTFT(target, amount)"
            :disabled="!isValidSwap || validatingAddress"
            :loading="loadingWithdraw"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { GridClient } from "@threefold/grid_client";
import { default as StellarSdk, StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { getGrid, loadBalance } from "../utils/grid";

const profileManager = useProfileManager();
const items = ref([{ id: 1, name: "stellar" }]);
const selectedItem = ref(items.value[0]);
const openDepositDialog = ref(true);
const openWithdrawDialog = ref(false);
const selectedName = ref("");
const withdrawFee = ref(0);
const isValidSwap = ref(false);
const target = ref("");
const targetError = ref("");
const validatingAddress = ref(false);
const server = new StellarSdk.Server(window.env.STELLAR_HORIZON_URL);
const amount = ref(0);
const freeBalance = ref(0);
const loadingWithdraw = ref(false);

onMounted(async () => {
  selectedName.value = items.value.filter(item => item.id === selectedItem.value.id)[0].name;
  try {
    const client = new GridClient({ mnemonic: profileManager.profile!.mnemonic, network: window.env.NETWORK });
    client._connect();
    const fee = await client.tfchain.tfClient.tftBridge.GetWithdrawFee();
    withdrawFee.value = fee;

    const grid = await getGrid(profileManager.profile!);
    if (grid) {
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
    target.value =
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

async function withdrawTFT(target: string, amount: number) {
  loadingWithdraw.value = true;
  try {
    const client = new GridClient({ mnemonic: profileManager.profile!.mnemonic, network: window.env.NETWORK });
    client._connect();
    await client.tfchain.tfClient.tftBridge.withdraw(
      profileManager.profile?.mnemonic as string,
      profileManager.profile?.address as string,
      target,
      amount,
      (res: { events?: never[] | undefined; status: any }) => {
        console.log(res);
        if (res instanceof Error) {
          console.log(res);
          loadingWithdraw.value = false;
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            openWithdrawDialog.value = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tftBridgeModule" && method === "BurnTransactionCreated") {
                openWithdrawDialog.value = false;
                target = "";
                amount = 0;
                loadingWithdraw.value = false;
              } else if (section === "system" && method === "ExtrinsicFailed") {
                openWithdrawDialog.value = false;
                target = "";
                amount = 0;
                loadingWithdraw.value = false;
              }
            });
          }
        }
      },
    );
  } catch (e) {
    console.log("Error withdrawing, Error: ", e);
    openWithdrawDialog.value = false;
    target = "";
    amount = 0;
    loadingWithdraw.value = false;
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
</style>
