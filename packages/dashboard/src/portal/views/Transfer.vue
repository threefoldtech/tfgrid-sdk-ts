<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>

    <v-card>
      <v-tabs v-model="activeTab">
        <v-tab class=""> By Address</v-tab>
        <v-tab> By Twin ID </v-tab>
        <v-tab-item>
          <template>
            <v-card class="pa-5 my-5" flat>
              <v-form v-model="isTransferValidAddress">
                <v-combobox
                  v-model="receipientAddress"
                  :items="accountsAddresses"
                  dense
                  filled
                  @keydown="setValue"
                  label="Recipient:"
                  :rules="[
                    () => !!receipientAddress || 'This field is required',
                    () => transferAddressCheck() || 'invalid address',
                  ]"
                ></v-combobox>
                <TransferTextField
                  v-model="amountByAddress"
                  label="Amount (TFT)"
                  :rules="getAmountRules(amountByAddress)"
                >
                </TransferTextField>
                <span class="fee">0.01 transaction fee will be deducted</span>
              </v-form>
              <Buttons
                :isTransferValid="isTransferValidAddress"
                :loadingTransfer="loadingTransferAddress"
                @submit="transferTFTWithAddress"
                @clear="clearInputAddress"
              />
            </v-card>
          </template>
        </v-tab-item>
        <v-tab-item>
          <template>
            <v-card class="pa-5 my-5" flat>
              <v-form v-model="isTransferValidTwinId">
                <v-combobox
                  v-model="receptinTwinId"
                  :items="accountTwinIds"
                  dense
                  filled
                  @input="onInputValueChanged"
                  label="Recipient:"
                  :error-messages="targetError"
                  :rules="[
                    () => !!receptinTwinId || 'This field is required',
                    () => {
                      /^[1-9]\d*$/.test(receptinTwinId) || 'Please enter a positive integer';
                    },
                    () => {
                      (parseInt(receptinTwinId) >= -(2 ** 31) && parseInt(receptinTwinId) <= 2 ** 31 - 1) ||
                        'Invalid Twin ID';
                    },
                  ]"
                >
                </v-combobox>
                <TransferTextField
                  v-model="amountByTwinId"
                  label="Amount (TFT)"
                  :rules="getAmountRules(amountByTwinId)"
                >
                </TransferTextField>
                <span class="fee">0.01 transaction fee will be deducted</span>
              </v-form>
              <Buttons
                :isTransferValid="isTransferValidTwinId"
                :loadingTransfer="loadingTransferTwinId"
                @submit="transferTFTWithTwinID"
                @clear="clearInputTwinId"
              />
            </v-card>
          </template>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Client, QueryClient } from "@threefold/tfchain_client";
import QrcodeVue from "qrcode.vue";
import { Component, Vue } from "vue-property-decorator";

import Buttons from "../components/TransferFormButtons.vue";
import TransferTextField from "../components/TransferTextField.vue";
import { balanceInterface, getBalance } from "../lib/balance";
import { checkAddress, transfer } from "../lib/transfer";
import { accountInterface } from "../store/state";

@Component({
  name: "TransferView",
  components: { QrcodeVue, TransferTextField, Buttons },
})
export default class TransferView extends Vue {
  activeTab = 0;
  $api: any;

  receipientAddress = "";
  accountsAddresses: any = [];
  amountByAddress = 0;
  loadingTransferAddress = false;
  isTransferValidAddress = false;

  amountByTwinId = 0;
  loadingTransferTwinId = false;
  isTransferValidTwinId = false;
  receptinTwinId = "";
  accountTwinIds: any = [];
  targetError = "";

  queryClient = new QueryClient(window.configs.APP_API_URL);
  client = new Client({ url: window.configs.APP_API_URL });

  async onInputValueChanged() {
    await this.$nextTick();
    this.transferTwinIdCheck();
  }

  async transferTwinIdCheck() {
    await this.$nextTick();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out."));
      }, 6000);
    });
    try {
      const twinDetailsPromise = this.queryClient.twins.get({ id: parseInt(this.receptinTwinId) });
      const twinDetails = await Promise.race([twinDetailsPromise, timeoutPromise]);
      if (twinDetails) {
        this.isTransferValidTwinId = true;
        this.accountTwinIds.push(this.receptinTwinId);
        this.targetError = "";
      } else {
        this.isTransferValidTwinId = false;
        this.targetError = "Twin ID doesn't exist";
      }
    } catch (error) {
      this.isTransferValidTwinId = false;
      this.targetError = "Twin ID doesn't exist";
    }
  }

  mounted() {
    if (this.$api && this.$store.state.credentials.initialized) {
      this.accountsAddresses = this.$store.state.portal.accounts
        .filter((account: accountInterface) => account.address !== this.$store.state.credentials.account.address)
        .map((account: accountInterface) => `${account.address}`);
    } else {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }

  transferAddressCheck() {
    const isValid = checkAddress(this.receipientAddress);
    if (isValid && this.receipientAddress.length && !this.receipientAddress.match(/\W/)) {
      return true;
    } else {
      return false;
    }
  }

  clearInputAddress() {
    this.receipientAddress = "";
    this.amountByAddress = 0;
  }

  clearInputTwinId() {
    this.receptinTwinId = "";
    this.amountByTwinId = 0;
  }

  transferTFTWithAddress() {
    transfer(
      this.$store.state.credentials.account.address,
      this.$api,
      this.receipientAddress,
      this.amountByAddress,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        this.loadingTransferAddress = true;
        if (res instanceof Error) {
          console.log(res);
          return;
        }
        const { events = [], status } = res;
        console.log(`Current status is ${status.type}`);
        switch (status.type) {
          case "Ready":
            this.$toasted.show(`Transaction submitted`);
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("Transfer failed!");
            this.loadingTransferAddress = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "balances" && method === "Transfer") {
                this.$toasted.show("Transfer succeeded!");
                this.loadingTransferAddress = false;
                getBalance(this.$api, this.$store.state.credentials.account.address).then(
                  (balance: balanceInterface) => {
                    this.$store.state.credentials.balance.free = balance.free;
                    this.$store.state.credentials.balance.reserved = balance.reserved;
                  },
                );
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Transfer failed!");
                this.loadingTransferAddress = false;
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.loadingTransferAddress = false;
    });
  }

  async transferTFTWithTwinID() {
    const twinDetails = await this.queryClient.twins.get({ id: parseInt(this.receptinTwinId) });
    if (twinDetails != null) {
      const twinAddress = twinDetails.accountId;
      const client = new Client({
        url: window.configs.APP_API_URL,
        mnemonicOrSecret: this.$store.state.profile.mnemonic,
      });
      this.loadingTransferTwinId = true;
      try {
        const transferResult = await client.balances.transfer({
          address: twinAddress,
          amount: this.amountByTwinId * 1e7,
        });
        this.$toasted.show(`Transaction submitted`);
        await transferResult.apply();

        this.$toasted.show("Transfer succeeded!");
        this.loadingTransferTwinId = false;

        getBalance(this.$api, this.$store.state.credentials.account.address).then((balance: balanceInterface) => {
          this.$store.state.credentials.balance.free = balance.free;
          this.$store.state.credentials.balance.reserved = balance.reserved;
        });
      } catch (error) {
        this.$toasted.show("Transfer failed!");
        this.loadingTransferTwinId = false;
      }
    } else {
      this.$toasted.show("Twin ID doesn't exist");
      this.loadingTransferTwinId = false;
    }
  }

  setValue($event: { target: { value: string } }) {
    requestAnimationFrame(() => {
      this.receipientAddress = $event.target.value;
    });
  }

  getAmountRules(value: any) {
    return [
      (v: any) => !!v || "This field is required",
      () =>
        (value.toString().split(".").length > 1 ? value.toString().split(".")[1].length <= 3 : true) ||
        "Amount must have 3 decimals only",
      () => value > 0 || "Amount cannot be negative or 0",
      () => value < parseFloat(this.$store.state.credentials.balance.free) || "Amount cannot exceed balance",
    ];
  }
}
</script>

<style scoped>
.theme--dark.v-application a {
  color: white;
}

.fee {
  font-size: 0.7rem;
  color: grey;
}
</style>
