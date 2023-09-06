<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="1000" v-model="depositDialog">
      <v-card>
        <v-toolbar color="primary" dark class="bold-text"> Deposit TFT </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row class="py-2">
              <v-col cols="7">
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
                Or use Threefold connect to scan this qr code:
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
import QrcodeVue from "qrcode.vue";
import { onMounted, ref } from "vue";

const depositDialog = ref(false);
const emits = defineEmits(["close"]);

const props = defineProps({
  selectedName: String,
  depositWallet: String,
  qrCodeText: String,
  depositFee: Number,
  openDepositDialog: Boolean,
  twinId: Number,
});

onMounted(() => {
  if (!props.openDepositDialog) return;
  depositDialog.value = true;
});

const closeDialog = () => {
  depositDialog.value = false;
  emits("close");
};
</script>

<style>
.bold-text {
  font-weight: bold;
  padding-left: 1rem;
}
</style>
