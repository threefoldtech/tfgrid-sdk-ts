<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="depositDialog" persistent>
      <v-card>
        <v-toolbar color="primary" dark class="bold-text"> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row class="py-2 pb-5">
              <v-col cols="6" class="mx-4">
                <div class="mb-2">
                  <b
                    >Send a
                    {{ selectedName ? selectedName.charAt(0).toUpperCase() + selectedName.slice(1) : "" }} transaction
                    with your TFT's to deposit to:</b
                  >
                </div>
                <ul>
                  <li class="mb-2">
                    Destination: <b>{{ depositWallet }}</b>
                  </li>
                  <li>
                    Memo Text: <b>twin_{{ twinId }}</b>
                  </li>
                  <div style="position: absolute; bottom: 10rem">
                    <p :style="{ padding: '2rem', color: '#7de3c8', fontWeight: 'bold' }">
                      Waiting for receiving TFTs{{ dots }}
                    </p>
                  </div>
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
              <v-col>
                <div class="d-flex flex-column text-center align-center">
                  <b> OR </b>
                  <b>use ThreeFold Connect to scan this QRcode:</b>
                  <div class="d-flex justify-center py-2">
                    <QrcodeGenerator :data="qrCodeText" />
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-alert type="warning" variant="tonal" class="d-flex row justify-start mb-6">
              <p :style="{ maxWidth: '880px' }">
                Amount: should be larger than {{ depositFee }}TFT (deposit fee is: {{ depositFee }}TFT)
              </p>
            </v-alert>
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
const dots = ref(".");
const interval = ref<number | null>(null);

const props = defineProps({
  selectedName: String,
  depositWallet: String,
  qrCodeText: String,
  depositFee: Number,
  openDepositDialog: Boolean,
  twinId: Number,
});

function loadingDots() {
  if (dots.value === "...") {
    dots.value = ".";
  } else {
    dots.value += ".";
  }
}

onMounted(async () => {
  if (!props.openDepositDialog) return;
  if (interval.value !== null) {
    window.clearInterval(interval.value);
  }
  depositDialog.value = true;
  interval.value = window.setInterval(loadingDots, 500);
  try {
    loading.value = true;
    const grid = await getGrid(profileManager.profile!);
    const receivedDeposit = await grid!.tfclient.tftBridge.listenToMintCompleted(
      profileManager.profile?.address as string,
    );
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
</style>
