<template>
  <v-container>
    <h1>Send to Threefold Hub</h1>

    <form @submit.prevent="onSendToCosmos()">
      <v-text-field label="Amount" placeholder="Amount" v-model="amount" :rules="[money]" />

      <v-text-field label="Destination" placeholder="Destination" v-model="destination" :rules="[bech32Address]" />

      <v-row justify="center">
        <v-btn color="primary" x-large type="submit" :disabled="inValid || loading" :loading="loading"> Send </v-btn>
      </v-row>
    </form>

    <CustomAlert :loading="loading" :result="result" :error="error" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { sendToCosmos } from "../utils";
import { Config } from "../utils/config";
import { parseUnits } from "ethers/lib/utils";
import CustomAlert from "../components/CustomAlert.vue";
import { bech32 } from "bech32";
import { BigNumber } from "ethers";

@Component({
  name: "CosmosView",
  components: {
    CustomAlert,
  },
})
export default class Cosmos extends Vue {
  loading = false;
  result: string | null = null;
  error: string | null = null;

  amount = "";
  destination = "";

  get inValid() {
    return this.money() !== true || this.bech32Address(this.destination) !== true;
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

  bech32Address(address: string) {
    try {
      const { prefix } = bech32.decode(address);
      return prefix === "tf" ? true : "Address must have tf prefix";
    } catch {
      return "Not a valid Threefold Hub ";
    }
  }

  onSendToCosmos() {
    this.loading = true;
    this.result = null;
    this.error = null;

    try {
      const { destination } = this;
      const config = this.$store.state.hub.config as Config;
      let amount = this.parseAmount();

      sendToCosmos(config.tft_token_contract_address, config.gravity_contract_address, destination, amount)
        .then(() => {
          this.result = "Transaction submitted succefully!";
        })
        .catch(err => {
          this.error = err.message;
        })
        .finally(() => {
          this.loading = false;
        });
    } catch (e) {
      this.error = (e as Error).message;
      this.loading = false;
    }
  }
}
</script>
