<template>
  <v-container>
    <div>
      <h1>
        Delegate to <small>{{ address }}</small>
      </h1>

      <form @submit.prevent="onDelegate()">
        <v-text-field label="Amount" placeholder="Amount" :rules="[money]" v-model="amount" />

        <v-btn color="primary" type="submit" :disabled="inValid || loading" :loading="loading"> Submit </v-btn>
      </form>
    </div>

    <CustomAlert :loading="loading" :result="result" :error="error" />

    <v-row justify="center" v-if="loading">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { BigNumber } from "ethers";
import { delegate } from "../utils/gov";
import CustomAlert from "../components/CustomAlert.vue";
import { parseUnits } from "ethers/lib/utils";

@Component({
  name: "GovDeposit",
  components: {
    CustomAlert,
  },
})
export default class GovDeposit extends Vue {
  amount = "1";
  address = "";
  loading = false;
  result: string | null = null;
  error: string | null = null;

  created() {
    this.loading = false;
    this.address = this.$route.params.address;
  }

  get inValid() {
    return this.money() !== true;
  }

  parseAmount(): BigNumber {
    const decimals = this.$store.state.hub.config.tft_decimals || 0;
    const amountBN = parseUnits(this.amount || "0", decimals);
    if (amountBN.lte(0)) {
      throw new Error("amount must be positive");
    }
    return amountBN;
  }

  money() {
    try {
      this.parseAmount();
      return true;
    } catch (e) {
      return (e as Error).message;
    }
  }

  onDelegate() {
    this.loading = true;
    this.result = null;
    this.error = null;

    delegate(
      this.$store.state.hub.config.tendermint_rpc,
      this.$store.state.hub.config.cosmos_rest,
      this.$store.state.hub.config.gas_price,
      this.$store.state.hub.config.chain_id,
      this.address,
      parseUnits(this.amount, this.$store.state.hub.config.tft_decimals),
      this.$store.state.hub.config.tft_denom,
    )
      .then(() => {
        this.result = `Successfully delegated ${this.amount} to validator #${this.address}`;
      })
      .catch(err => {
        this.error = err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>
