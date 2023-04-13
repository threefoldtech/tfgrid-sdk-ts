<template>
  <v-container>
    <h1>Add Software Proposal</h1>

    <form @submit.prevent="onSubmitSoftwareUpgradeProposal()">
      <v-text-field label="Title" v-model="title" />
      <v-text-field label="Description" v-model="description" />
      <v-text-field label="Name" v-model="name" />
      <v-text-field label="Initial Deposit" placeholder="Initial Deposit" v-model="initialDeposit" />
      <v-text-field label="Height" type="number" v-model="height" />

      <v-row justify="space-between" class="mt-5 ml-0">
        <h3>Operating Systems</h3>
        <v-btn fab small color="success" @click="onAddSystem()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-row>

      <OsInput
        v-for="(os, idx) in systems"
        :key="idx"
        v-model="systems[idx]"
        :removable="systems.length > 1"
        @on:remove="onRemoveSystem(idx)"
      />

      <v-row justify="center" class="mt-4">
        <v-btn color="primary" type="submit" :disabled="loading" :loading="loading"> Submit </v-btn>
      </v-row>
    </form>

    <CustomAlert :loading="loading" :result="result" :error="error" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import OsInput from "../components/OsInput.vue";
import { submitSoftwareUpgradeProposal } from "../utils/gov";
import { parseUnits } from "ethers/lib/utils";
import { SoftwareUpgradeProposal } from "../types/cosmos/upgrade/v1beta1/upgrade";
import Long from "long";

@Component({
  name: "SoftwareProposal",
  components: {
    OsInput,
  },
})
export default class SoftwareProposal extends Vue {
  loading = false;
  result: string | null = null;
  error: string | null = null;

  title = "";
  description = "";
  name = "";
  height = 0;
  initialDeposit = "1";
  systems = [{ os: null, arch: null, url: null }];

  onAddSystem() {
    this.systems.push({ os: null, arch: null, url: null });
  }

  onRemoveSystem(i: number) {
    this.systems.splice(i, 1);
  }

  onSubmitSoftwareUpgradeProposal() {
    const { title, description, name, height, initialDeposit, systems } = this;

    const info = systems.reduce((res, { os, arch, url }) => {
      res[`${os}/${arch}`] = url;
      return res;
    }, {} as any);

    const proposal: SoftwareUpgradeProposal = {
      title,
      description,
      plan: {
        name,
        height: Long.fromNumber(height),
        info: JSON.stringify(info),
      },
    };

    this.loading = true;
    submitSoftwareUpgradeProposal(
      this.$store.state.hub.config.tendermint_rpc,
      this.$store.state.hub.config.cosmos_rest,
      this.$store.state.hub.config.gas_price,
      this.$store.state.hub.config.chain_id,
      proposal,
      parseUnits(initialDeposit, this.$store.state.hub.config.tft_decimals),
      this.$store.state.hub.config.tft_denom,
    )
      .then(() => {
        this.result = "Proposal added succefully!";
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
