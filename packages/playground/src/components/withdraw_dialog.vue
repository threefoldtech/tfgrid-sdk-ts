<template>
  <v-container>
    <v-dialog
      transition="dialog-bottom-transition"
      max-width="1000"
      v-model="withdrawDialog"
      @update:model-value="closeDialog"
    >
      <v-card>
        <v-toolbar color="primary" dark class="bold-text justify-center"> Withdraw TFT </v-toolbar>
        <v-card-text>
          Interact with the bridge in order to withdraw your TFT to
          {{ selectedName?.charAt(0).toUpperCase() + selectedName!.slice(1) }} (withdraw fee is: {{ withdrawFee }} TFT)
        </v-card-text>
        <v-card-text>
          <v-form v-model="isValidSwap">
            <v-text-field
              v-model="target"
              :label="selectedName?.charAt(0).toUpperCase() + selectedName!.slice(1) + ' Target Wallet Address'"
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
                () => amount < freeBalance! || 'Amount cannot exceed balance',
              ]"
            >
            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end pb-4 px-6">
          <v-btn variant="outlined" color="anchor" class="px-3" @click="closeDialog"> Close </v-btn>
          <v-btn
            class="px-3"
            color="secondary"
            variant="outlined"
            @click="withdrawTFT(target, amount)"
            :disabled="!isValidSwap || validatingAddress"
            :loading="loadingWithdraw"
            >Send</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { default as StellarSdk, StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

const withdrawDialog = ref(false);
const targetError = ref("");
const target = ref("");
const isValidSwap = ref(false);
const validatingAddress = ref(false);
const server = new StellarSdk.Server(window.env.STELLAR_HORIZON_URL);
const loadingWithdraw = ref(false);
const ProfileManagerController = useProfileManagerController();
const profileManager = useProfileManager();
const amount = ref(2);
const emits = defineEmits(["close"]);

const props = defineProps({
  selectedName: String,
  withdrawFee: Number,
  openWithdrawDialog: Boolean,
  freeBalance: Number,
});

onMounted(async () => {
  if (!props.openWithdrawDialog) return;
  withdrawDialog.value = true;
});

function swapAddressCheck() {
  targetError.value = "";
  if (!target.value) {
    isValidSwap.value = false;
    return true;
  }
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
    isValidSwap.value = false;
    return false;
  }
  targetError.value = "";
  validatingAddress.value = true;
  isValidSwap.value = true;
  if (props.selectedName == "stellar") validateAddress();
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
  isValidSwap.value = true;
  return;
}

async function withdrawTFT(targetAddress: string, withdrawAmount: number) {
  loadingWithdraw.value = true;
  try {
    const grid = await getGrid(profileManager.profile!);
    await grid?.bridge.swapToStellar({ amount: +withdrawAmount, target: targetAddress });

    await ProfileManagerController.reloadBalance();
    createCustomToast("Transaction Succeeded", ToastType.success);
    closeDialog();
  } catch (e) {
    console.log("Error withdrawing, Error: ", e);

    createCustomToast("Withdraw Failed!", ToastType.danger);
    closeDialog();
  }
}

const closeDialog = () => {
  withdrawDialog.value = false;
  emits("close");
};
</script>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "WithdrawDialog",
});
</script>

<style>
.bold-text {
  font-weight: 500;
  padding-left: 1rem;
}
</style>
