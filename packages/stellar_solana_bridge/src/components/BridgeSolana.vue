<template>
  <v-container class="d-flex justify-center">
    <v-card class="pa-4" width="400">
      <v-card-title class="text-center">TFT Transfer</v-card-title>

      <!-- From Address -->
      <v-text-field v-model="fromAddress" label="Stellar Account Seed" variant="outlined"></v-text-field>

      <!-- To Address -->
      <v-text-field v-model="toAddress" label="Solana Associated Token Address" variant="outlined"></v-text-field>

      <!-- Amount Input -->
      <v-text-field
        v-model="amount"
        label="Amount"
        variant="outlined"
        type="number"
        :rules="[validateAmount]"
      ></v-text-field>

      <!-- Transfer Fee -->
      <p class="text-caption text-grey-darken-1 mb-2">Transfer Fee: {{ transferFee }} TFT</p>

      <!-- Submit Button -->
      <v-btn block color="primary" @click.prevent="submitForm" :disabled="!isValidTransaction"> Submit </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { transferTFT } from "../services/stellar";

const fromAddress = ref("");
const toAddress = ref("");
const amount = ref(1);
const transferFee = 50.01;

const validateAmount = (value: number) => {
  if (!value || value <= 0) return "Amount must be greater than 0";
  return true;
};

const isValidTransaction = computed(() => {
  return toAddress.value && amount.value > 0;
});

const submitForm = async () => {
  await transferTFT(fromAddress.value, toAddress.value, amount.value.toString());
};
</script>

<script lang="ts">
export default {
  name: "BridgeSolana",
};
</script>
<style scoped>
.v-card {
  background-color: #121212;
  color: white;
}
</style>
