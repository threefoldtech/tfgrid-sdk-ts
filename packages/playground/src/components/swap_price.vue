<template>
  <div class="d-flex w-auto">
    <div v-if="!loading" class="d-flex" style="align-items: center">
      <p>{{ prices[0].amount }} {{ prices[0].currency }}</p>
      <v-tooltip>
        <template v-slot:activator="{ isActive, props }">
          <v-btn @click="priceSwap" icon v-bind="props" v-on="isActive" class="d-flex align-center">
            <v-icon>mdi-swap-horizontal</v-icon>
          </v-btn>
        </template>
        <span>TFT Exchange Rate</span>
      </v-tooltip>
      <p>{{ prices[1].amount }} {{ prices[1].currency }}</p>
      <v-tooltip>
        <template v-slot:activator="{ isActive, props }">
          <v-btn @click="openInfoLink" icon v-bind="props" v-on="isActive" class="d-flex align-center">
            <v-icon>mdi-information</v-icon>
          </v-btn>
        </template>
        <span>More information</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QueryClient } from "@threefold/tfchain_client";
import { onMounted, ref } from "vue";

type SwapPrice = {
  currency: string;
  amount: number;
};

const loading = ref<boolean>(false);
const swapped = ref(false);
const prices = ref<SwapPrice[]>([
  {
    currency: "TFT",
    amount: 1,
  },
  {
    currency: "USD",
    amount: 1,
  },
]);

onMounted(async () => {
  loading.value = true;
  prices.value[1].amount = (await getTFTPrice()) ?? 1;
  loading.value = false;
});

async function getTFTPrice(): Promise<number> {
  try {
    const client = new QueryClient(window.env.SUBSTRATE_URL);
    const res = await client.tftPrice.get();
    return res / 1000;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

async function priceSwap() {
  swapped.value = !swapped.value;
  if (swapped.value) {
    prices.value = [
      {
        currency: "USD",
        amount: 1,
      },
      { currency: "TFT", amount: Math.floor((1 / (await getTFTPrice())) * 1000) / 1000 },
    ];
  } else {
    prices.value = [
      { currency: "TFT", amount: 1 },
      { currency: "USD", amount: await getTFTPrice() },
    ];
  }
}

function openInfoLink() {
  window.open(
    "https://stellar.expert/explorer/public/asset/TFT-GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47-1?asset[]=TFT-GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47-1&filter=markets&market=USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1",
    "_blank",
  );
}
</script>
