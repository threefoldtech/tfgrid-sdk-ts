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
          <FormValidator v-model="valid">
            <InputValidator
              :value="target"
              :rules="[validators.required('This field is required'), () => swapAddressCheck()]"
              :async-rules="[validateAddress]"
              #="{ props: validationProps }"
            >
              <v-text-field
                v-bind="{ ...validationProps }"
                v-model="target"
                :label="selectedName?.charAt(0).toUpperCase() + selectedName!.slice(1) + ' Target Wallet Address'"
                :disabled="validatingAddress"
                :loading="validationProps.loading"
              >
              </v-text-field>
            </InputValidator>
            <InputValidator
              :value="amount"
              #="{ props: validationProps }"
              :rules="[
              validators.required('This field is required'),
              validators.min('Amount should be at least 2 TFT', 2),
              validators.max( 'Amount cannot exceed balance',freeBalance!),
              validators.isValidDecimalNumber(3,'Amount must have 3 decimals only')
            ]"
            >
              <v-text-field
                v-bind="{ ...validationProps }"
                @paste.prevent
                label="Amount (TFT)"
                v-model="amount"
                type="number"
                onkeydown="javascript: return event.keyCode == 69 || /^\+$/.test(event.key) ? false : true"
              >
              </v-text-field>
            </InputValidator>
          </FormValidator>
        </v-card-text>
        <v-card-actions class="justify-end pb-4 px-6">
          <v-btn variant="outlined" color="anchor" class="px-3" @click="closeDialog"> Close </v-btn>
          <v-btn
            class="px-3"
            color="secondary"
            variant="outlined"
            @click="withdrawTFT(target, amount)"
            :disabled="!valid || validatingAddress"
            :loading="loadingWithdraw"
            >Send</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";
import { isValidStellarAddress } from "../utils/validators";
const withdrawDialog = ref(false);
const targetError = ref("");
const target = ref("");
const valid = ref(false);
const validatingAddress = ref(false);
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
    return;
  }
  const isValid = StrKey.isValidEd25519PublicKey(target.value);
  const blockedAddresses = [
    "GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC",
    "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4",
  ];
  if (blockedAddresses.includes(target.value)) {
    return {
      message: "Blocked Address",
    };
  }
  if (!isValid || target.value.match(/\W/)) {
    return {
      message: "Invalid address",
    };
  }
  targetError.value = "";
}

async function validateAddress() {
  if (props.selectedName == "stellar") return await isValidStellarAddress(target.value);
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
