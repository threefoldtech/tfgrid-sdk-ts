<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="depositDialog">
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
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
              <v-col>
                Or use ThreeFold Connect to scan this QRcode:
                <div class="d-flex justify-center py-2">
                  <qrcode-vue
                    :value="qrCodeText"
                    :size="250"
                    level="M"
                    render-as="svg"
                    style="background: white; padding: 6%"
                  >
                  </qrcode-vue>
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
import { GridClient } from "@threefold/grid_client";
import { createToast } from "mosha-vue-toastify";
import QrcodeVue from "qrcode.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

import { useProfileManager } from "../stores";
import { loadProfile } from "../utils/grid";

const depositDialog = ref(false);
const emits = defineEmits(["close"]);
const profileManager = useProfileManager();
let destroyed = false;

const props = defineProps({
  selectedName: String,
  depositWallet: String,
  qrCodeText: String,
  depositFee: String,
  openDepositDialog: Boolean,
  twinId: Number,
});

onMounted(async () => {
  if (!props.openDepositDialog) return;
  depositDialog.value = true;
  try {
    const client = new GridClient({ mnemonic: profileManager.profile!.mnemonic, network: window.env.NETWORK });
    client.connect();
    const receivedDeposit = await client.tfclient.tftBridge.listenToMintCompleted(
      profileManager.profile?.address as string,
    );

    if (destroyed) return;
    createToast(`You have received ${receivedDeposit / 10000000} TFT`, {
      position: "bottom-right",
      hideProgressBar: true,
      toastBackgroundColor: "black",
      timeout: 5000,
    });
    const profile = await loadProfile(client);
    profileManager.set(profile);
  } catch (e) {
    if (destroyed) return;
    console.log(e);
    createToast(e as string, {
      position: "bottom-right",
      hideProgressBar: true,
      toastBackgroundColor: "red",
      timeout: 5000,
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
