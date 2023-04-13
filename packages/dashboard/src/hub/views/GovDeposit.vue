<template>
  <v-container>
    <div v-if="proposal">
      <h1>
        Deposit to <small>{{ proposal.content.title }}</small>
      </h1>

      <form @submit.prevent="onDeposit()">
        <v-text-field
          label="Amount"
          placeholder="Amount"
          v-model="amount"
          :hint="'Min deposit is ' + proposal.minDeposit"
        />

        <v-btn color="primary" type="submit" :disabled="loading" :loading="loading"> Submit </v-btn>
      </form>
    </div>

    <CustomAlert :loading="loading" :result="result" :error="error" />

    <v-row justify="center" v-if="loading && !proposal">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getProposal, deposit } from "../utils/gov";
import CustomAlert from "../components/CustomAlert.vue";
import { parseUnits } from "ethers/lib/utils";

@Component({
  name: "GovDeposit",
  components: {
    CustomAlert,
  },
})
export default class GovDeposit extends Vue {
  proposal: any = null;
  amount = "0";

  loading = false;
  result: any = null;
  error: string | null = null;

  created() {
    this.loading = true;

    getProposal(this.$store.state.hub.config.cosmos_rest, this.$route.params.id)
      .then(proposal => {
        this.proposal = proposal.proposal;
      })
      .catch(err => {
        this.error = err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onDeposit() {
    this.loading = true;
    this.result = null;
    this.error = null;

    deposit(
      this.$store.state.hub.config.tendermint_rpc,
      this.$store.state.hub.config.cosmos_rest,
      this.$store.state.hub.config.gas_price,
      this.$store.state.hub.config.chain_id,
      this.proposal.proposalId,
      parseUnits(this.amount, this.$store.state.hub.config.tft_decimals),
      this.$store.state.hub.config.proposal_denom,
    )
      .then(res => {
        this.result = `Successfully deposited ${this.amount} to proposal #${this.proposal.proposalId}`;
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
