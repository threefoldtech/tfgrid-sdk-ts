<template>
  <v-container class="d-flex justify-center">
    <v-card class="pa-4" width="400">
      <v-card-title class="text-center">TFT Transfer</v-card-title>

      <!-- From Address -->
      <v-text-field v-model="fromAddress" label="From (name: zee)" variant="outlined" readonly></v-text-field>

      <!-- To Address -->
      <v-text-field v-model="toAddress" label="To" variant="outlined" density="compact"></v-text-field>

      <!-- Amount Input -->
      <v-text-field
        v-model="amount"
        label="Amount"
        variant="outlined"
        density="compact"
        type="number"
        :rules="[validateAmount]"
      ></v-text-field>

      <!-- Transfer Fee -->
      <p class="text-caption text-grey-darken-1">Transfer Fee: {{ transferFee }} TFT</p>

      <!-- Submit Button -->
      <v-btn block color="primary" @click="submitForm" :disabled="!isValidTransaction"> Submit </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, ref } from "vue";

const fromAddress = ref("5GNU4aqL9JPj79hUDyPrPPTCpaMcd3LRAmyXvvW");
const toAddress = ref("");
const amount = ref(0);
const balance = 0.85;
const transferFee = 1.01;

const validateAmount = value => {
  if (!value || value <= 0) return "Amount must be greater than 0";
  if (value + transferFee > balance) return "Insufficient balance";
  return true;
};

const isValidTransaction = computed(() => {
  return toAddress.value && amount.value > 0 && amount.value + transferFee <= balance;
});

const submitForm = () => {
  alert(`Transferring ${amount.value} TFT to ${toAddress.value}`);
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
