<template>
  <div class="d-flex ml-5 w-auto">
    <div v-if="!loading" class="d-flex" style="align-items: center">
      <p>{{ prices[0].amount }} {{ prices[0].currency }}</p>
      <v-tooltip>
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="priceSwap" icon v-bind="attrs" v-on="on" class="d-flex align-center">
            <v-icon>mdi-swap-horizontal</v-icon>
          </v-btn>
        </template>
        <span>TFT Exchange Rate</span>
      </v-tooltip>
      <p>{{ prices[1].amount }} {{ prices[1].currency }}</p>
      <v-tooltip>
        <template v-slot:activator="{ on, attrs }">
          <v-btn @click="openInfoLink" icon v-bind="attrs" v-on="on" class="d-flex align-center">
            <v-icon>mdi-information</v-icon>
          </v-btn>
        </template>
        <span>More information</span>
      </v-tooltip>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

type SwapPrice = {
  currency: string;
  amount: number;
};

@Component({
  name: "TftSwapPrice",
})
export default class TftSwapPrice extends Vue {
  $api: any;
  swaped = false;
  loading = false;
  prices: SwapPrice[] = [
    { currency: "TFT", amount: 1 },
    { currency: "USD", amount: 1 },
  ];

  async mounted() {
    this.loading = true;
    this.prices[1].amount = await this.getTFTPrice();
    this.loading = false;
  }

  async priceSwap() {
    // Changing the values from TFT to USD and vice versa on click.
    this.swaped = !this.swaped;
    if (this.swaped) {
      this.prices = [
        { currency: "USD", amount: 1 },
        { currency: "TFT", amount: Math.floor((1 / (await this.getTFTPrice())) * 1000) / 1000 },
      ];
    } else {
      this.prices = [
        { currency: "TFT", amount: 1 },
        { currency: "USD", amount: await this.getTFTPrice() },
      ];
    }
  }

  openInfoLink() {
    window.open(
      "https://stellar.expert/explorer/public/asset/TFT-GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47-1?asset[]=TFT-GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47-1&filter=markets&market=USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1",
      "_blank",
    );
  }

  async getTFTPrice() {
    // Getting the TFT price from the substrate.
    const res = await this.$api.query.tftPriceModule.tftPrice();
    return res.toPrimitive() / 1000;
  }
}
</script>
