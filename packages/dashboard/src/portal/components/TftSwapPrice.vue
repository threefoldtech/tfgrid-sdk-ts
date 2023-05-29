<template>
  <v-container>
    <div class="d-flex ml-5">
      <div class="d-flex" style="align-items: center">
        <p>{{ prices[0].amount }} {{ prices[0].currency }}</p>
        <v-tooltip>
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="priceSwap" icon v-bind="attrs" v-on="on" class="d-flex align-center">
              <v-icon>mdi-swap-horizontal</v-icon>
            </v-btn>
          </template>
          <span>ThreeFold Price Swapping</span>
        </v-tooltip>
        <p>{{ prices[1].amount }} {{ prices[1].currency }}</p>
      </div>
    </div>
  </v-container>
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
export default class FundsCard extends Vue {
  $api: any;
  swaped = false;
  prices: SwapPrice[] = [
    { currency: "TFT", amount: 1 },
    { currency: "USD", amount: 0 },
  ];

  async mounted() {
    this.prices[1].amount = await this.getTFTPrice();
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

  async getTFTPrice() {
    // Getting the TFT price from the substrate.
    const res = await this.$api.query.tftPriceModule.tftPrice();
    return res.toPrimitive() / 1000;
  }
}
</script>
