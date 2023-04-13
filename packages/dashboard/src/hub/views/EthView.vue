<template>
  <v-container>
    <h1>Send to BSC</h1>

    <form @submit.prevent="onSendToEth()">
      <v-text-field label="Amount" placeholder="Amount" v-model="amount" @input="debounceTxFees" :rules="[money]" />

      <v-text-field
        label="Destination"
        placeholder="Destination"
        v-model="destination"
        @input="debounceTxFees"
        :rules="[bscAddress]"
      />

      <v-text-field label="BridgeFees" placeholder="Bridge fees" v-model="fees" :disabled="true" />

      <v-text-field label="TransactionFees" placeholder="Transaction fees" v-model="txFees" :disabled="true" />

      <v-text-field label="TotalAmount" placeholder="Total amount" v-model="total_amount" :disabled="true" />

      <v-row justify="center">
        <v-btn color="primary" x-large type="submit" :disabled="empty || loading" :loading="loading"> Send </v-btn>
      </v-row>
    </form>

    <CustomAlert :loading="loading" :result="result" :error="error" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { sendToEth, sendToEthFees } from "../utils";
import { Config } from "../utils/config";
import { validateBSCAddress } from "../utils/eth";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import CustomAlert from "../components/CustomAlert.vue";
import { debounce } from "debounce";

@Component({
  name: "EthView",
  components: {
    CustomAlert,
  },
})
export default class Eth extends Vue {
  loading = false;
  result: string | null = null;
  error: string | null = null;

  amount = "";
  destination = "";
  txFees = "0";

  get fees() {
    const bridge_fees = this.$store.state.hub.config.bridge_fees || BigNumber.from(0);
    const decimals = this.$store.state.hub.config.tft_decimals || 0;
    return formatUnits(bridge_fees, decimals);
  }

  debounceTxFees = debounce(this.calcTxFees, 1000);

  calcTxFees() {
    if (this.empty) return;
    try {
      const { destination, amount } = this;
      let amountBN: BigNumber = this.parseAmount(amount);
      const config = this.$store.state.hub.config as Config;
      if (this.error?.startsWith("Can't estimate transaction fees: ")) {
        this.error = null;
      }
      sendToEthFees(
        config.tendermint_rpc,
        config.gas_price,
        config.chain_id,
        destination,
        amountBN,
        config.bridge_fees,
        config.tft_denom,
      )
        .then(data => {
          this.txFees = formatUnits(data.amount[0].amount, config.tft_decimals);
        })
        .catch(err => {
          // ignore error
          this.error = "Can't estimate transaction fees: " + err;
        });
    } catch (e) {
      return 0;
    }
  }
  parseAmount(amount: string): BigNumber {
    const decimals = this.$store.state.hub.config.tft_decimals || 0;
    const amountBN = parseUnits(amount || "0", decimals);
    if (amountBN.lte(0)) {
      throw new Error("amount must be positive");
    }
    return amountBN;
  }

  get total_amount() {
    let bridge_fees = this.$store.state.hub.config.bridge_fees || BigNumber.from(0);
    const decimals = this.$store.state.hub.config.tft_decimals || 0;
    let amountBN = BigNumber.from(0);
    let txFeesBN = BigNumber.from(0);
    try {
      amountBN = this.parseAmount(this.amount);
      txFeesBN = parseUnits(this.txFees, this.$store.state.hub.config.tft_decimals || 0);
    } catch (e) {
      return 0;
    }
    return formatUnits(bridge_fees.add(amountBN).add(txFeesBN), decimals);
  }

  get empty() {
    return this.money() !== true || this.bscAddress() !== true;
  }

  money() {
    try {
      this.parseAmount(this.amount);
      return true;
    } catch (e) {
      return (e as Error).message;
    }
  }

  bscAddress() {
    try {
      validateBSCAddress(this.destination);
      return true;
    } catch (e) {
      return (e as Error).message;
    }
  }

  onSendToEth() {
    this.loading = true;
    this.result = null;
    this.error = null;

    const { destination } = this;
    const config = this.$store.state.hub.config as Config;
    let amountBN: BigNumber = BigNumber.from(0);
    try {
      amountBN = this.parseAmount(this.amount);
    } catch (e) {
      this.error = "Invalid amount: " + (e as Error).message;
      this.loading = false;
      return;
    }
    try {
      validateBSCAddress(destination);
    } catch (e) {
      this.error = "Invalid amount: " + (e as Error).message;
      this.loading = false;
      return;
    }

    sendToEth(
      config.tendermint_rpc,
      config.cosmos_rest,
      config.gas_price,
      config.chain_id,
      destination,
      amountBN,
      config.bridge_fees,
      config.tft_denom,
    )
      .then(() => {
        this.result = "Transaction submitted succefully!";
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
