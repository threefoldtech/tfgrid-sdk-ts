<template>
  <div class="d-flex flex-column" style="min-height: 100vh">
    <v-alert
      transition="fade-transition"
      v-model="alert"
      border="start"
      type="info"
      close-label="Close Alert"
      color="primary"
      variant="tonal"
      closable
      class="mb-0"
      style="max-height: 64px"
    >
      This bridge currently supports only Stellar to Solana transfers.
    </v-alert>

    <v-container class="d-flex flex-grow-1 align-center justify-center">
      <v-form class="my-2" v-model="valid" @submit.prevent="submitForm">
        <v-img :src="Logo" width="200" max-height="100" class="mx-auto mb-5" />
        <v-card class="mx-auto bg-transparent" width="400" flat>
          <!-- Solana Address -->
          <v-text-field
            v-model="toAddress"
            class="my-2"
            label="Solana Associated Token Address"
            variant="outlined"
            :rules="solanaATARules"
          />

          <!-- Amount Input -->
          <v-text-field v-model="amount" label="Amount" variant="outlined" type="number" :rules="amountRules" />
          <p class="d-flex align-center text-caption text-grey-darken-1">
            <v-icon class="mr-1">mdi-information-outline</v-icon> Transfer Fee: {{ transferFee }} TFT
          </p>
        </v-card>
        <v-expand-transition>
          <v-card class="bg-transparent" v-if="isValidTransaction" flat>
            <v-card-subtitle class="text-center my-5">
              Enter the following information manually <strong>OR</strong> scan the QR code with Threefold Connect app
            </v-card-subtitle>
            <div class="border mt-5 mb-2 pa-5">
              <v-row>
                <v-col>
                  <v-card width="400" class="mx-auto pa-5 bg-transparent" flat>
                    <div class="text-subtitle-1 text-medium-emphasis mb-3">Enter your Stellar Account Seed:</div>
                    <!-- Stellar Address -->
                    <v-text-field
                      v-model="fromAddress"
                      type="password"
                      label="Stellar Account Seed"
                      variant="outlined"
                      :rules="stellarSeedRules"
                    />
                    <!-- Submit Button -->
                    <v-btn
                      block
                      color="primary"
                      type="submit"
                      class="my-2"
                      :loading="loading"
                      :disabled="!valid && !validateStellarSeed(fromAddress)"
                    >
                      Send
                    </v-btn>
                  </v-card>
                </v-col>
                <v-col class="divider-container" cols="auto">
                  <v-divider vertical></v-divider>
                  <span class="divider-text text-grey-darken-1">OR</span>
                </v-col>
                <v-col>
                  <v-card width="400" class="bg-transparent" flat>
                    <v-img :src="QRSrc" alt="qrcode" width="200" class="mx-auto" />
                    <v-card-text class="mt-4">
                      <p><strong>Destination:</strong> {{ BRIDGE_ADDRESS }}</p>
                      <p><strong>Memo Hash:</strong> {{ memoHash }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
            <v-row>
              <v-col>
                <div class="d-flex justify-center align-center mt-4">
                  <p class="mr-3">Don't have the app? Download it now</p>
                  <a
                    v-for="app in apps"
                    :key="app.alt"
                    :style="{ cursor: 'pointer', width: '9rem' }"
                    class="mx-2"
                    :title="app.alt"
                    v-html="app.src"
                    :href="app.url"
                    target="_blank"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-expand-transition>
      </v-form>
      <v-dialog max-width="500" v-model="isActive">
        <v-card>
          <v-card-text> {{ confirmMessage }} </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text="Close" @click="isActive = false"></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { PublicKey } from "@solana/web3.js";
import { StrKey } from "@stellar/stellar-sdk";
import bs58 from "bs58";
import { Buffer } from "buffer";
import QRCode from "qrcode";
import { computed, ref, watch } from "vue";

import Logo from "../assets/logo_tft.png";
import { BRIDGE_ADDRESS, transferTFT } from "../services/stellar";

const fromAddress = ref("");
const toAddress = ref();
const amount = ref();
const transferFee = 50;
const QRSrc = ref();
const memoHash = ref();
const valid = ref(false);
const loading = ref(false);
const isActive = ref(false);
const confirmMessage = ref("");
const alert = ref(true);
const apps = [
  {
    src: `<img width="140"  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/128px-Google_Play_Store_badge_EN.svg.png?20220907104002">`,
    alt: "Threefold Connect on Google Play Store",
    url: "https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US",
  },
  {
    src: `<img width="128"  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Download_on_the_App_Store_RGB_blk.svg/128px-Download_on_the_App_Store_RGB_blk.svg.png?20180317110059"/>`,
    alt: "Threefold Connect on Apple App Store",
    url: "https://apps.apple.com/us/app/threefold-connect/id1459845885",
  },
];
const stellarSeedRules = computed(() => [
  (v: string) => !!v || "Stellar seed is required",
  (v: string) => validateStellarSeed(v) || "Invalid Stellar secret seed",
]);

const validateStellarSeed = (seed: string) => {
  return seed.startsWith("S") && seed.length === 56 && StrKey.isValidEd25519SecretSeed(seed);
};

const solanaATARules = computed(() => [
  (v: string) => !!v || "Address is required",
  (v: string) => validateSolanaAddressBasic(v) || "Invalid Solana address",
  (v: string) => solanaAddressBytes(v) || "Invalid Solana address length",
]);

const solanaAddressBytes = (address: string) => {
  try {
    const solanaDecodedAddress = bs58.decode(address);
    return solanaDecodedAddress.length === 32;
  } catch {
    return false;
  }
};

const validateSolanaAddressBasic = (address: string) => {
  try {
    new PublicKey(address);
    return address.length === 44;
  } catch {
    return false;
  }
};

const amountRules = computed(() => [
  (v: number) => !!v || "Amount is required",
  (v: number) => v > transferFee || `Must be greater than ${transferFee} TFT`,
]);

const isValidTransaction = computed(() => {
  return validateSolanaAddressBasic(toAddress.value) && amount.value > transferFee;
});

const submitForm = async () => {
  loading.value = true;
  try {
    const { successful } = await transferTFT(fromAddress.value, toAddress.value, amount.value.toString());
    if (!successful) return;
    loading.value = false;
    isActive.value = true;
    confirmMessage.value = "Your transaction is sent successfully";
  } catch (error: any) {
    loading.value = false;
    isActive.value = true;
    confirmMessage.value = error.response.data.title;
  } finally {
    toAddress.value = undefined;
    amount.value = null;
  }
};

const generateMemoHashFromSolanaAddress = (solanaRecipientAddress: string) => {
  const solanaAddressBytes = bs58.decode(solanaRecipientAddress);
  if (solanaAddressBytes.length !== 32) {
    throw new Error("Invalid Solana address length");
  }
  return Buffer.from(solanaAddressBytes).toString("hex");
};

const generateQRcode = async () => {
  const qrCodeData = `TFT:${BRIDGE_ADDRESS}?memo_hash=${memoHash.value}&amount=${amount.value}`;
  QRSrc.value =
    (await QRCode.toDataURL(qrCodeData, {
      color: {
        dark: "#fff",
        light: "#12121200",
      },
    })) || undefined;
};

watch(
  [toAddress, amount],
  async value => {
    if (value && validateSolanaAddressBasic(toAddress.value) && solanaAddressBytes(toAddress.value)) {
      try {
        memoHash.value = generateMemoHashFromSolanaAddress(toAddress.value);
        await generateQRcode();
      } catch (error) {
        console.error(error);
      }
    }
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: "BridgeSolana",
};
</script>

<style>
.divider-container {
  position: relative;
  display: flex;
  align-items: center;
}

.divider-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 8px;
  font-weight: bold;
}
</style>
