<template>
  <view-layout>
    <h2 class="mb-5 text-capitalize">Alpha software - all data subject to change</h2>
    <v-form @change.prevent="mintingHash()" class="d-inline-flex w-100">
      <FormValidator v-model="isValidForm">
        <InputValidator
          :value="receiptHash"
          :rules="[
            validators.required('Receipt hash is required.'),
            validators.equal('Receipt hash must be 64 characters long.', 64),
            validators.isHash('Invalid hash', 'sha256'),
          ]"
          valid-message="Receipt hash is valid."
          #="{ props: validationProps }"
          ref="textInput"
        >
          <VTextField
            class="mr-5"
            placeholder="Please insert your receipt hash"
            v-model="receiptHash"
            v-bind="{ ...validationProps }"
            :loading="loading"
        /></InputValidator>

        <VBtn
          type="submit"
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!isValidForm"
          size="x-large"
          rounded="lg"
        >
          Mint
        </VBtn>
      </FormValidator>
    </v-form>
    <v-container class="mt-8" v-if="item && item.type == 'MINTING'">
      <v-card>
        <v-card-title class="font-weight-bold bg-primary">Node Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in infoHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.node_id }} ({{ item.node_type }})</v-list-item>
              <v-list-item> {{ item.farm_name }} ({{ item.farm_id }})</v-list-item>
              <v-list-item>
                {{ (item.measured_uptime / (3600 * 24)).toFixed(2) }} days ({{
                  ((100 * item.measured_uptime) / (item.period.end - item.period.start)).toFixed(2)
                }}%)
              </v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>
      <!-- Node Resources -->
      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary" color="primary">Node Resources</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in resourcesHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.cloud_units.cu.toFixed(2) }}</v-list-item>
              <v-list-item> {{ item.cloud_units.su.toFixed(2) }}</v-list-item>
              <v-list-item>
                {{ item.cloud_units.nu.toFixed(2) }}
              </v-list-item>
              <v-list-item v-if="item.resource_units.cru && item.resource_units.cru < 0.1">
                {{ (item.resource_units.cru * 1024 ** 3).toFixed(0) }} VCpu
              </v-list-item>
              <v-list-item v-else> {{ item.resource_units.cru }} VCpu </v-list-item>

              <v-list-item> {{ item.resource_units.mru.toFixed(3) }}GB </v-list-item>
              <v-list-item> {{ item.resource_units.sru.toFixed(3) }}GB </v-list-item>
              <v-list-item> {{ item.resource_units.hru.toFixed(3) }}GB </v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>

      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary">Payout Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in payoutHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item>
                {{ item.tft.toFixed(7) }} TFT ({{ item.musd.toFixed(3) }}$ at
                {{ item.tft_connection_price.toFixed(3) }}$/TFT)</v-list-item
              >
              <v-list-item> {{ item.stellar_payout_address }}</v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>
    </v-container>

    <v-container class="mt-8" v-else-if="item">
      <v-card>
        <v-card-title class="font-weight-bold bg-primary">Node Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in fixedHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.node_id }}</v-list-item>
              <v-list-item> {{ item.farm_id }}</v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>

      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary" color="primary">Node Resources</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in resourcesFHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item>
                {{ item.cloud_units.cu.toFixed(2) }} | {{ item.correct_cloud_units.cu.toFixed(2) }} |
                {{ item.fixup_cloud_units.cu.toFixed(2) }}</v-list-item
              >
              <v-list-item>
                {{ item.cloud_units.su.toFixed(2) }} | {{ item.correct_cloud_units.su.toFixed(2) }} |
                {{ item.fixup_cloud_units.su.toFixed(2) }}</v-list-item
              >
              <v-list-item>
                {{ item.cloud_units.nu.toFixed(2) }} | {{ item.correct_cloud_units.nu.toFixed(2) }} |
                {{ item.fixup_cloud_units.nu.toFixed(2) }}</v-list-item
              >
            </v-col>
          </v-row>
        </v-list>
      </v-card>
      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary">Payout Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in payoutFHeader" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.minted_tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.correct_tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.fixup_tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.stellar_payout_address }}</v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>
    </v-container>
  </view-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { useInputRef } from "@/hooks/input_validator";

import { getMintingData } from "../utils/mintings";
const receiptHash = ref();
const isValidForm = ref(false);
const textInput = useInputRef();
const loading = ref(false);
const item = ref();
const infoHeader = ref(["ID", "Farm", "Measured Uptime"]);
const fixedHeader = ref(["ID", "Farm"]);
const resourcesHeader = ref(["CU", "SU", "NU", "Cru", "Mru", "Sru", "Hru"]);
const resourcesFHeader = ref(["CU", "SU", "NU"]);
const payoutHeader = ref(["TFT Farmed", "Payout Address"]);
const payoutFHeader = ref(["TFT Received", "TFT Owed", "Additional TFT minted", "Payout Address"]);

async function mintingHash() {
  loading.value = true;
  item.value = await getMintingData(receiptHash.value);
  isValidForm.value = false;
  loading.value = false;
}
</script>

<style scoped>
.custom-list {
  overflow: hidden;
  font-size: 0.875rem;
}

.v-list-item {
  border-bottom: 0.1px solid #8a8a8a;
}
.column-style {
  border-right: 0.1px solid #8a8a8a;
}
.v-list-item:last-child {
  border-bottom: none;
}
</style>
