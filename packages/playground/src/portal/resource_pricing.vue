<template>
  <div class="mt-8">
    <v-container class="custom-container">
      <v-card color="calcprimary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3" color="white">mdi-calculator</v-icon>
        <v-card-title class="pa-0" lor="white">Resource Pricing Calculator</v-card-title>
      </v-card>
      <v-card class="pa-3">
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
              :rules="[
                validators.required('Balance is required.'),
                validators.required('Balance is required.'),
                validators.min('Balance should be a positive integer.', 1),
                validators.isInt('Balance must be a valid integer.'),
              ]"
              :value="balance"
              #="{ props }"
            >
              <input-tooltip tooltip="The amount of TFT to calculate discount.">
                <v-text-field
                  label="Balance"
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
                  <b>{{ price.packageName != "none" ? price.packageName + " Package: " : "" }}</b></span
                >
                <b>${{ price.price }}/month, {{ price.TFTs }} TFT/month. </b>
              </span>
              <span> {{ price.info }}</span>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { onMounted } from "vue";
import { ref } from "vue";

import { calcPrice, calCU, calSU, getTFTPrice } from "../utils/calculator";
import { connect } from "../utils/connect";

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
const api = ref<any>(null);
interface PriceType {
  label?: string;
  color: string;
  price: string;
  packageName: any;
  backgroundColor: string;
  TFTs: any;
  info: string;
}

let pricing: any;
const discountPackages = ref<any>({});
const prices = ref<PriceType[]>([]);

watch([CRU, MRU, SRU, HRU, balance, isCertified, ipv4, currentbalance], () => {
  if (!valid.value.error) {
    calculate(); // Call the calculate function when any of the watched variables change
  }
});

async function calDiscount(price: number) {
  pricing = await calcPrice(api.value);

  // discount for Dedicated Nodes
  const discount = pricing.discountForDedicationNodes;
  let dedicatedPrice = price - price * (discount / 100);
  let sharedPrice = price;

  // discount for Twin Balance in TFT
  const balance2 = (TFTPrice.value ? TFTPrice.value : 1) * +balance.value * 10000000;

  discountPackages.value = {
    none: {
      duration: 0,
      discount: 0,
      backgroundColor: "#CCCCCC",
      color: "black",
    },
    default: {
      duration: 1.5,
      discount: 20,
      backgroundColor: "#3b3b3b",
      color: "black",
    },
    bronze: {
      duration: 3,
      discount: 30,
      backgroundColor: "linear-gradient(270deg, #AF6114 0%, #ffc58b 25%, #DC8E41 49.83%, #f9d1a9 77.32%, #AF6114 100%)",
      color: "black",
    },
    silver: {
      duration: 6,
      discount: 40,
      backgroundColor: "linear-gradient(270deg, #7d7d7d 0%, #f9f9f9 25%, #adadad 49.83%, #ffffff 77.32%, #a0a0a0 100%)",
      color: "black",
    },
    gold: {
      duration: 18,
      discount: 60,
      backgroundColor: "linear-gradient(270deg, #bf953f 0%, #fffce0 25%, #d7ae56 49.83%, #fffce0 77.32%, #aa771c 100%)",
      color: "black",
    },
  };

  let dedicatedPackage = "none";
  let sharedPackage = "none";
  for (const pkg in discountPackages.value) {
    if (balance2 > dedicatedPrice * discountPackages.value[pkg].duration) {
      dedicatedPackage = pkg;
    }
    if (balance2 > sharedPrice * discountPackages.value[pkg].duration) {
      sharedPackage = pkg;
    }
  }
  dedicatedPrice =
    (dedicatedPrice - dedicatedPrice * (discountPackages.value[dedicatedPackage].discount / 100)) / 10000000;
  sharedPrice = (sharedPrice - sharedPrice * (discountPackages.value[sharedPackage].discount / 100)) / 10000000;

  return [dedicatedPrice.toFixed(2), dedicatedPackage, sharedPrice.toFixed(2), sharedPackage];
}

async function calculate() {
  TFTPrice.value = await getTFTPrice(api.value);
  const price = (await calcPrice(api.value)) as any;
  const CU = calCU(+CRU.value, +MRU.value);

  const SU = calSU(+HRU.value, +SRU.value);
  const IPV4 = ipv4.value ? 1 : 0;
  // apply 25% extra on certified node if selected
  const certifiedFactor = isCertified.value ? 1.25 : 1;
  const musd_month = (CU * price.cu.value + SU * price.su.value + IPV4 * price.ipu.value) * certifiedFactor * 24 * 30;

  const [dedicatedPrice, dedicatedPackage, sharedPrice, sharedPackage] = await calDiscount(musd_month);
  prices.value = [
    {
      label: "Dedicated Node",
      price: `${dedicatedPrice}`,
      color: discountPackages.value[dedicatedPackage].color,
      packageName: dedicatedPackage,
      backgroundColor: discountPackages.value[dedicatedPackage].backgroundColor,
      TFTs: (+dedicatedPrice / TFTPrice.value).toFixed(2),
      info: "A user can reserve an entire node then use it exclusively to deploy solutions",
    },
    {
      label: "Shared Node",
      price: `${sharedPrice}`,
      color: "black",
      packageName: sharedPackage,
      backgroundColor: discountPackages.value[sharedPackage].backgroundColor,
      TFTs: (+sharedPrice / TFTPrice.value).toFixed(2),
      info: "Shared Nodes allow several users to host various workloads on a single node",
    },
  ];
}

onMounted(async () => {
  api.value = await connect();
  calculate();
});
</script>

<style>
.custom-container {
  width: 80%;
}
.v-label {
  font-size: 0.875rem;
}
</style>
