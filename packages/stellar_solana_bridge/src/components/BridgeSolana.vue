<template>
  <v-container class="d-flex h-screen flex-column align-center justify-center">
    <v-img :src="Logo" width="200" max-height="100" class="mx-auto" />
    <v-form class="my-2" v-model="valid" @submit.prevent="submitForm">
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
      </v-card>
      <v-expand-transition>
        <v-card class="bg-transparent" v-if="isValidTransaction" flat>
          <v-card-subtitle class="text-center my-5">
            Enter the folllowing information manually Or scan the QR code with ThreeFold Connect
          </v-card-subtitle>
          <div class="border mt-5 mb-2 pa-5">
            <v-row>
              <v-col cols="12" md="6">
                <v-card width="400" class="mx-auto pa-5 bg-transparent" flat>
                  <v-card-title>Enter your Steller Account Seed:</v-card-title>
                  <!-- Steller Address -->
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
              <v-divider vertical></v-divider>
              <v-col cols="12" md="6">
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
          <p class="d-flex align-center text-caption text-grey-darken-1">
            <v-icon class="mr-1">mdi-information-outline</v-icon> Transfer Fee: {{ transferFee }} TFT
          </p>
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
const toAddress = ref("");
const amount = ref();
const transferFee = 50.01;
const QRSrc = ref();
const memoHash = ref();
const valid = ref(false);
const loading = ref(false);
const isActive = ref(false);
const confirmMessage = ref("");

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
  (v: string) => v.length === 44 || "Must be 44 characters",
]);

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
    if (value && validateSolanaAddressBasic(toAddress.value)) {
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
