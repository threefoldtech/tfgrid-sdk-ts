<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="depositDialog" persistent>
      <v-card>
        <v-toolbar color="primary" dark class="d-flex justify-center bold-text"> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row class="py-2 pb-5">
              <v-col cols="6" class="mx-4">
                <div class="mb-2">
                  <p class="mb-3">
                    Send a
                    {{ selectedName ? selectedName.charAt(0).toUpperCase() + selectedName.slice(1) : "" }} transaction
                    with your TFT's to deposit to:
                  </p>
                </div>
                <ul>
                  <li class="mb-2">
                    Destination:
                    <p class="text-subtitle-2">{{ depositWallet }}</p>
                  </li>
                  <li>
                    Memo Text:
                    <p class="text-subtitle-2">twin_{{ twinId }}</p>
                  </li>
                  <div style="position: absolute; bottom: 10rem">
                    <p :style="{ paddingBottom: '3rem', color: '#7de3c8' }">Waiting for receiving TFTs{{ dots }}</p>
                  </div>
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
              <v-col>
                <div class="d-flex flex-column text-center align-center">
                  <b> OR </b>
                  <p class="mb-3">Use ThreeFold Connect to scan this QRcode:</p>
                  <div class="d-flex justify-center py-2">
                    <QrcodeGenerator :data="qrCodeText" />
                  </div>
                </div>
              </v-col>
              <v-divider class="my-4" horizontal></v-divider>
            </v-row>
            <v-alert type="warning" variant="tonal" class="d-flex row justify-start" color="primary">
              <p :style="{ maxWidth: '880px' }">
                Amount: should be larger than {{ depositFee }}TFT (deposit fee is: {{ depositFee }}TFT)
              </p>
            </v-alert>
          </v-container>
          <v-card-actions class="justify-end">
            <v-btn variant="outlined" color="anchor" class="mr-2 text-subtitle-2" @click="closeDialog"> Close </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { Decimal } from "decimal.js";
import { onBeforeUnmount, onMounted, ref } from "vue";

import { useProfileManagerController } from "../components/profile_manager_controller.vue";
import QrcodeGenerator from "../components/qrcode_generator.vue";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";

const depositDialog = ref(false);
const emits = defineEmits(["close"]);
const profileManager = useProfileManager();
let destroyed = false;
const loading = ref(false);
const dots = ref(".");
const interval = ref<number | null>(null);
const ProfileManagerController = useProfileManagerController();

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
    const address = profileManager.profile?.address as string;
    const receivedDeposit = await grid!.bridge.listenToMintCompleted({ address: address });
    loading.value = false;
    if (destroyed) return;
    const DecimalDeposit = new Decimal(receivedDeposit);
    const divisor = new Decimal(10000000);
    createCustomToast(`You have received ${DecimalDeposit.dividedBy(divisor)} TFT`, ToastType.success);
    await ProfileManagerController.reloadBalance();
    closeDialog();
  } catch (e) {
    if (destroyed) return;
    console.log(e);
    createCustomToast(e as string, ToastType.danger);
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
  font-weight: 500;
  padding-left: 1rem;
}
</style>
