<template>
  <view-layout>
    <h2 class="mb-5 text-capitalize">Alpha software - all data subject to change</h2>
    <v-form @submit.prevent="mintingHash()" class="d-inline-flex w-100">
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
          ref="hashInput"
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
          variant="tonal"
          :disabled="!isValidForm"
          :loading="loading"
          size="x-large"
          rounded="lg"
        >
          View
        </VBtn>
      </FormValidator>
    </v-form>
    <v-container class="mt-8" v-if="item && item.Minting">
      <v-card>
        <v-card-title class="font-weight-bold bg-primary">Node Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in mintNodeInfoHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.Minting.node_id }} ({{ item.Minting.node_type }})</v-list-item>
              <v-list-item> {{ item.Minting.farm_name }} ({{ item.Minting.farm_id }})</v-list-item>
              <v-list-item>
                {{ (item.Minting.measured_uptime / (3600 * 24)).toFixed(2) }}
                days ({{
                  (
                    (100 * item.Minting.measured_uptime) /
                    (item.Minting.period.end - item.Minting.period.start)
                  ).toFixed(2)
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
              <v-list-item v-for="header in mintResourcesHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.Minting.cloud_units.cu.toFixed(2) }}</v-list-item>
              <v-list-item> {{ item.Minting.cloud_units.su.toFixed(2) }}</v-list-item>
              <v-list-item>
                {{ item.Minting.cloud_units.nu.toFixed(2) }}
              </v-list-item>
              <v-list-item v-if="item.Minting.resource_units.cru && item.Minting.resource_units.cru < 0.1">
                {{ (item.Minting.resource_units.cru * 1024 ** 3).toFixed(0) }}
                vCPU
              </v-list-item>
              <v-list-item v-else> {{ item.Minting.resource_units.cru }} vCPU </v-list-item>

              <v-list-item> {{ item.Minting.resource_units.mru.toFixed(3) }} GB </v-list-item>
              <v-list-item> {{ item.Minting.resource_units.sru.toFixed(3) }} GB </v-list-item>
              <v-list-item> {{ item.Minting.resource_units.hru.toFixed(3) }} GB </v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>

      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary">Payout Info</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in mintPayoutHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item>
                {{ item.Minting.reward.tft.toFixed(7) }} TFT ({{ item.Minting.reward.musd.toFixed(3) }}$ at
                {{ item.Minting.tft_connection_price.toFixed(3) }}$/TFT)</v-list-item
              >
              <v-list-item> {{ item.Minting.stellar_payout_address }}</v-list-item>
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
              <v-list-item v-for="header in fixupNodeInfoHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.Fixup.node_id }}</v-list-item>
              <v-list-item> {{ item.Fixup.farm_id }}</v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>

      <v-card class="mt-3">
        <v-card-title class="font-weight-bold bg-primary" color="primary">Node Resources</v-card-title>
        <v-list class="custom-list">
          <v-row>
            <v-col cols="2" class="column-style">
              <v-list-item v-for="header in fixupResourcesHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item>
                {{ item.Fixup.minted_cloud_units.cu.toFixed(2) }} | {{ item.Fixup.correct_cloud_units.cu.toFixed(2) }} |
                {{ item.Fixup.fixup_cloud_units.cu.toFixed(2) }}</v-list-item
              >
              <v-list-item>
                {{ item.Fixup.minted_cloud_units.su.toFixed(2) }} | {{ item.Fixup.correct_cloud_units.su.toFixed(2) }} |
                {{ item.Fixup.fixup_cloud_units.cu.toFixed(2) }}</v-list-item
              >
              <v-list-item>
                {{ item.Fixup.minted_cloud_units.nu.toFixed(2) }} | {{ item.Fixup.correct_cloud_units.nu.toFixed(2) }} |
                {{ item.Fixup.fixup_cloud_units.cu.toFixed(2) }}</v-list-item
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
              <v-list-item v-for="header in fixupPayoutHeaders" :key="header">
                {{ header }}
              </v-list-item>
            </v-col>
            <v-col cols="10">
              <v-list-item> {{ item.Fixup.minted_reward.tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.Fixup.correct_reward.tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.Fixup.fixup_reward.tft.toFixed(7) }} TFT</v-list-item>
              <v-list-item> {{ item.Fixup.stellar_payout_address }}</v-list-item>
            </v-col>
          </v-row>
        </v-list>
      </v-card>
    </v-container>

    <v-alert type="error" variant="tonal" class="mt-2 mb-4" v-if="noData">
      {{ noData }}
    </v-alert>
  </view-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { useInputRef } from "@/hooks/input_validator";

import { normalizeError } from "../utils/helpers";
import { getMintingData } from "../utils/mintings";

const receiptHash = ref();
const isValidForm = ref(false);
const hashInput = useInputRef();
const loading = ref(false);
const noData = ref<string | null>(null);
const item = ref();
const mintNodeInfoHeaders = ["ID", "Farm", "Measured Uptime"];
const fixupNodeInfoHeaders = ["ID", "Farm"];
const mintResourcesHeaders = ["CU", "SU", "NU", "CRU", "MRU", "SRU", "HRU"];
const fixupResourcesHeaders = ["CU", "SU", "NU"];
const mintPayoutHeaders = ["TFT Farmed", "Payout Address"];
const fixupPayoutHeaders = ["TFT Received", "TFT Owed", "Additional TFT Minted", "Payout Address"];

function reset() {
  item.value = null;
  noData.value = null;
}
async function mintingHash() {
  loading.value = true;
  reset();
  try {
    item.value = await getMintingData(receiptHash.value);
  } catch (e) {
    noData.value = normalizeError(e, "Something went wrong while fetching data.");
  } finally {
    loading.value = false;
  }
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
