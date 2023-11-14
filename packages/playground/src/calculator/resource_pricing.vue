<template>
  <div class="border px-4 pb-4 rounded position-relative mt-2">
    <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
      <v-icon size="30" class="pr-3">mdi-calculator</v-icon>
      <v-card-title class="pa-0">Pricing Calculator</v-card-title>
    </v-card>
    <v-card class="pa-3">
      <v-row class="mt-3 px-3 pl-6">
        <v-alert type="info" variant="tonal">
          For more information about Threefold Pricing check <a class="app-link" @click="openManual()">here</a>
        </v-alert>
      </v-row>
      <v-row class="mt-3 px-3">
        <v-col cols="6">
          <input-validator
            :value="CRU"
            :rules="[
              validators.required('CPU is required.'),
              validators.isInt('CPU must be a valid integer.'),
              validators.min('CPU min is 1 cores.', 1),
              validators.max('CPU max is 256 cores.', 256),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="The number of virtual cores.">
              <v-text-field
                label="CPU (vCores)"
                suffix="vCores"
                type="number"
                v-model.number="CRU"
                v-bind="props"
                ref="valid"
              />
            </input-tooltip>
          </input-validator>
        </v-col>
        <v-col cols="6">
          <input-validator
            :value="MRU"
            :rules="[
              validators.required('Memory is required.'),
              validators.isInt('Memory must be a valid integer.'),
              validators.max('Maximum allowed memory is 1024 GB.', 1024),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="The amount of RAM (Random Access Memory) in GB.">
              <v-text-field
                label="Memory (GB)"
                type="number"
                suffix="GB"
                v-model.number="MRU"
                v-bind="props"
                ref="valid"
              />
            </input-tooltip>
          </input-validator>
        </v-col>
      </v-row>

      <v-row class="px-3">
        <v-col cols="6">
          <input-validator
            :value="SRU"
            :rules="[
              validators.required('SSD Storage size is required.'),
              validators.isInt('SSD Storage size must be a valid integer.'),
              validators.max('Maximum allowed ssd storage size is 1000000 GB.', 1000000),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="The SSD capacity storage.">
              <v-text-field
                label="Disk SSD"
                suffix="GB"
                type="number"
                v-model.number="SRU"
                v-bind="props"
                ref="valid"
              />
            </input-tooltip>
          </input-validator>
        </v-col>
        <v-col cols="6">
          <input-validator
            :value="HRU"
            :rules="[
              validators.required('HDD Storage size is required.'),
              validators.isInt('HDD Storage size must be a valid integer.'),
              validators.max('Maximum allowed hdd storage size is 1000000 GB.', 1000000),
            ]"
            #="{ props }"
          >
            <input-tooltip tooltip="The HDD capacity storage.">
              <v-text-field
                label="Disk HDD"
                suffix="GB"
                type="number"
                v-model.number="HRU"
                v-bind="props"
                ref="valid"
              />
            </input-tooltip>
          </input-validator>
        </v-col>
      </v-row>

      <v-row class="px-3">
        <v-col cols="12">
          <input-validator
            :rules="[validators.min('Balance should be a positive integer.', 1)]"
            :value="balance"
            #="{ props }"
          >
            <input-tooltip tooltip="The amount of TFT to calculate discount.">
              <v-text-field
                label="Balance"
                :disabled="currentbalance"
                suffix="TFT"
                type="number"
                v-bind="props"
                v-model.number="balance"
                ref="valid"
              />
            </input-tooltip>
          </input-validator>
        </v-col>
      </v-row>
      <v-row class="my-0 my-3 px-6">
        <input-tooltip
          inline
          class="px-2"
          tooltip=" A certified node will receive 25% more reward compared to a non-certified node."
        >
          <v-switch color="primary" inset label="Certified Node" v-model="isCertified" hide-details />
        </input-tooltip>
        <input-tooltip
          inline
          class="px-2"
          tooltip="An Internet Protocol version 4 address that is globally unique and accessible over the internet"
        >
          <v-switch color="primary" inset label="With a Public IPv4" v-model="ipv4" hide-details />
        </input-tooltip>
        <input-tooltip inline class="px-2" tooltip="Use current balance to calculate the discount.">
          <v-switch color="primary" inset label="Use current balance" v-model="currentbalance" hide-details />
        </input-tooltip>
      </v-row>
      <v-divider />

      <v-row class="pa-3" style="text-color: black">
        <v-col cols="6" v-for="price in prices" :key="price.price">
          <v-card
            class="pa-3 text-center price-box"
            height="100%"
            :style="{ color: price.color, background: price.backgroundColor }"
          >
            <span class="price">
              <p v-if="price.label === 'Dedicated Node'">
                Cost of reserving a
                <span class="name"
                  ><b>{{ price.label + " " }}</b></span
                >
                of the same specifications
              </p>
              <p v-else>
                Cost of reservation on a
                <span class="name"
                  ><b>{{ price.label !== undefined ? price.label + " " : " " }}</b></span
                >
              </p>
              <span class="package">
                <b>{{ price.packageName != "none" ? capitalize(price.packageName) + " Package: " : "" }}</b></span
              >
              <b>${{ price.price }}/month, {{ price.TFTs }} TFT/month. </b>
            </span>
            <span> {{ price.info }}</span>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { capitalize, watch } from "vue";
import { onMounted } from "vue";
import { ref } from "vue";

import { useProfileManager } from "@/stores/profile_manager";
import { getGrid } from "@/utils/grid";

import { color } from "../utils/background_color";

const CRU = ref<number>(1);
const MRU = ref<number>(1);
const SRU = ref<number>(25);
const HRU = ref<number>(100);
const balance = ref<number>(0);
const TFTPrice = ref<number>(0);

const isCertified = ref<boolean>(false);
const ipv4 = ref<boolean>(false);
const currentbalance = ref<boolean>(false);

const valid = ref();
interface PriceType {
  label?: string;
  color: string;
  price: string;
  packageName: any;
  backgroundColor: string;
  TFTs: any;
  info: string;
}
const prices = ref<PriceType[]>([]);

const grid = ref();
const profileManager = useProfileManager();

watch([CRU, MRU, SRU, HRU, balance, isCertified, ipv4, currentbalance], async () => {
  let pkgs: any;
  if (!valid.value.error) {
    if (currentbalance.value) {
      const accountBalance = await grid.value.balance.getMyBalance();
      balance.value = accountBalance.free;
      pkgs = await grid.value.calculator.calculateWithMyBalance({
        cru: CRU.value,
        mru: MRU.value,
        hru: HRU.value,
        sru: SRU.value,
        ipv4u: ipv4.value,
        certified: isCertified.value,
      });
    } else {
      if (!balance.value) balance.value = 0;
      pkgs = await grid.value.calculator.calculate({
        cru: CRU.value,
        mru: MRU.value,
        hru: HRU.value,
        sru: SRU.value,
        ipv4u: ipv4.value,
        certified: isCertified.value,
        balance: balance.value,
      });
    }

    setPriceList(pkgs);
  }
});

watch(currentbalance, (newCurrentBalance, oldCurrentBalance) => {
  if (oldCurrentBalance && !newCurrentBalance) {
    balance.value = 0;
  }
});

async function setPriceList(pkgs: any): Promise<PriceType[]> {
  TFTPrice.value = await grid.value.calculator.tftPrice();
  prices.value = [
    {
      label: "Dedicated Node",
      price: `${pkgs.dedicatedPrice}`,
      color: "black",
      packageName: pkgs.dedicatedPackage.package,
      backgroundColor: color(pkgs.dedicatedPackage.package),
      TFTs: (+pkgs.dedicatedPrice / TFTPrice.value).toFixed(2),
      info: "A user can reserve an entire node then use it exclusively to deploy solutions",
    },
    {
      label: "Shared Node",
      price: `${pkgs.sharedPrice}`,
      color: "black",
      packageName: pkgs.sharedPackage.package,
      backgroundColor: color(pkgs.sharedPackage.package),
      TFTs: (+pkgs.sharedPrice / TFTPrice.value).toFixed(2),
      info: "Shared Nodes allow several users to host various workloads on a single node",
    },
  ];
  return prices.value;
}

onMounted(async () => {
  getGrid(profileManager.profile!)
    .then(async result => {
      grid.value = result;
      const pkgs = await grid.value.calculator.calculate({
        cru: CRU.value,
        mru: MRU.value,
        hru: HRU.value,
        sru: SRU.value,
        ipv4u: ipv4.value,
        certified: isCertified.value,
        balance: balance.value,
      });
      setPriceList(pkgs);
    })
    .catch(error => {
      console.error("Error fetching the grid:", error);
    });
});

function openManual() {
  window.open("https://manual.grid.tf/cloud/cloudunits_pricing.html", "_blank");
}
</script>

<style>
.custom-container {
  width: 80%;
}
.v-label {
  font-size: 0.875rem;
}
</style>
