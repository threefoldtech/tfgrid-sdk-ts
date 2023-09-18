<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="depositDialog" persistent>
      <v-card>
        <v-toolbar color="primary" dark class="bold-text"> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row class="py-2">
              <v-col cols="7" class="mx-4">
                Send a
                {{ selectedName ? selectedName.charAt(0).toUpperCase() + selectedName.slice(1) : "" }} transaction with
                your TFT's to deposit to:
                <ul>
                  <li>
                    Destination: <b>{{ depositWallet }}</b>
                  </li>
                  <li>
                    Memo Text: <b>twin_{{ twinId }}</b>
                  </li>
                  <div v-if="loading" class="loading">
                    <div class="spinner"></div>
                  </div>
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
              <v-col>
                Or use ThreeFold Connect to scan this QRcode:
                <div class="d-flex justify-center py-2">
                  <QrcodeGenerator :data="qrCodeText" />
                </div>
              </v-col>
            </v-row>
            <v-row class="d-flex row justify-center"
              >Amount: should be larger than {{ depositFee }}TFT (deposit fee is: {{ depositFee }}TFT)</v-row
            >
          </v-container>
          <v-card-actions class="justify-end">
            <v-btn color="primary" class="bold-text" @click="closeDialog"> Close </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { Decimal } from "decimal.js";
import { createToast } from "mosha-vue-toastify";
import { onBeforeUnmount, onMounted, ref } from "vue";

import QrcodeGenerator from "../components/qrcode_generator.vue";
import { useProfileManager } from "../stores";
import { getGrid, loadProfile } from "../utils/grid";

const depositDialog = ref(false);
const emits = defineEmits(["close"]);
const profileManager = useProfileManager();
let destroyed = false;
const loading = ref(false);

const props = defineProps({
  selectedName: String,
  depositWallet: String,
  qrCodeText: String,
  depositFee: Number,
  openDepositDialog: Boolean,
  twinId: Number,
});

onMounted(async () => {
  if (!props.openDepositDialog) return;
  depositDialog.value = true;
  try {
    loading.value = true;
    const grid = await getGrid(profileManager.profile!);
    const receivedDeposit = await grid!.tfclient.tftBridge.listenToMintCompleted(
      profileManager.profile?.address as string,
    );
    console.log("recieved", receivedDeposit);
    loading.value = false;
    if (destroyed) return;
    const DecimalDeposit = new Decimal(receivedDeposit);
    const divisor = new Decimal(10000000);
    createToast(`You have received ${DecimalDeposit.dividedBy(divisor)} TFT`, {
      position: "bottom-right",
      hideProgressBar: true,
      toastBackgroundColor: "black",
      timeout: 5000,
      showIcon: true,
      type: "success",
    });
    const profile = await loadProfile(grid!);
    profileManager.set(profile);
  } catch (e) {
    if (destroyed) return;
    console.log(e);
    createToast(e as string, {
      position: "bottom-right",
      hideProgressBar: true,
      toastBackgroundColor: "red",
      timeout: 5000,
      showIcon: true,
      type: "danger",
    });
    closeDialog();
  }
});

const closeDialog = () => {
  depositDialog.value = false;
  emits("close");
};

onBeforeUnmount(() => {
  destroyed = true;
});
</script>

<style>
.bold-text {
  font-weight: bold;
  padding-left: 1rem;
}
.loading {
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.3);
  border-top: 4px solid #1aa18f;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
