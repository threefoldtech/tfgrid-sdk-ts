<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>

    <v-card>
      <v-tabs>
        <v-tab class=""> By Address</v-tab>
        <v-tab> By Twin ID </v-tab>
        <v-tab-item>
          <template>
            <v-card class="pa-5 my-5" flat>
              <v-form v-model="isTransferValid">
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
              <v-card-actions>
                <v-spacer> </v-spacer>
                <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>
                <v-btn
                  class="primary white--text"
                  @click="transferTFTWithAddress"
                  :loading="loadingTransfer"
                  :disabled="!isTransferValid"
                  >Submit</v-btn
                >
              </v-card-actions>
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
                  @keydown="setValue"
                  label="Recipient:"
                  :rules="[
                    () => !!receptinTwinId || 'This field is required',
                    () => /^[1-9]\d*$/.test(receptinTwinId) || 'Please enter a positive integer',
                    () => transferTwinIdCheck() || 'invalid twin id',
                  ]"
                ></v-combobox>
                <TransferTextField
                  v-model="amountByTwinId"
                  label="Amount (TFT)"
                  :rules="getAmountRules(amountByTwinId)"
                >
                </TransferTextField>
                <span class="fee">0.01 transaction fee will be deducted</span>
              </v-form>

              <v-card-actions>
                <v-spacer> </v-spacer>
                <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>
                <v-btn
                  class="primary white--text"
                  @click="transferTFTWithTwinID"
                  :loading="loadingTransferTwinId"
                  :disabled="!isTransferValidTwinId"
                  >Submit</v-btn
                >
              </v-card-actions>
            </v-card>
          </template>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { web3FromAddress } from "@polkadot/extension-dapp";
import { Client, QueryClient } from "@threefold/tfchain_client";
import QrcodeVue from "qrcode.vue";
import { Component, Vue } from "vue-property-decorator";

import TransferTextField from "../components/TransferTextField.vue";
import { balanceInterface, getBalance } from "../lib/balance";
import { checkAddress, transfer } from "../lib/transfer";
import { accountInterface } from "../store/state";

@Component({
  name: "TransferView",
  components: { QrcodeVue, TransferTextField },
})
export default class TransferView extends Vue {
  receipientAddress = "";
  accountsAddresses: any = [];
  $api: any;
  amountByAddress = 0;
  amountByTwinId = 0;
  loadingTransfer = false;
  isTransferValid = false;

  loadingTransferTwinId = false;
  isTransferValidTwinId = false;

  queryClient = new QueryClient(window.configs.APP_API_URL);
  client = new Client({ url: window.configs.APP_API_URL });

  receptinTwinId = "";
  accountTwinIds: any = [];

  async transferTwinIdCheck() {
    const twinId = this.receptinTwinId;
    const twinDetails = await this.queryClient.twins.get({ id: parseInt(twinId) });
    if (twinDetails != null) {
      this.isTransferValidTwinId = true;
      return true;
    } else {
      this.isTransferValidTwinId = false;
      return false;
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

  clearInput() {
    this.receipientAddress = "";
    this.receptinTwinId = "";
    this.amountByAddress = 0;
    this.amountByTwinId = 0;
  }

  transferTFTWithAddress() {
    transfer(
      this.$store.state.credentials.account.address,
      this.$api,
      this.receipientAddress,
      this.amountByAddress,
      (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
        this.loadingTransfer = true;
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
            this.loadingTransfer = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "balances" && method === "Transfer") {
                this.$toasted.show("Transfer succeeded!");
                this.loadingTransfer = false;
                getBalance(this.$api, this.$store.state.credentials.account.address).then(
                  (balance: balanceInterface) => {
                    this.$store.state.credentials.balance.free = balance.free;
                    this.$store.state.credentials.balance.reserved = balance.reserved;
                  },
                );
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Transfer failed!");
                this.loadingTransfer = false;
              }
            });
          }
        }
      },
    ).catch(err => {
      this.$toasted.show(err.message);
      this.loadingTransfer = false;
    });
  }

  async transferTFTWithTwinID() {
    const twinDetails = await this.queryClient.twins.get({ id: parseInt(this.receptinTwinId) });
    const injector = await web3FromAddress(this.$store.state.credentials.account.address);
    if (twinDetails != null) {
      const twinAddress = twinDetails.accountId;
      const client = new Client({
        url: window.configs.APP_API_URL,
        extSigner: {
          address: this.$store.state.credentials.account.address,
          signer: injector.signer,
        },
      });

      return await (
        await client.balances.transfer({
          address: twinAddress,
          amount: this.amountByTwinId,
        })
      )
        .apply()
        .catch(err => {
          this.$toasted.show(err.message);
          this.loadingTransferTwinId = false;
        });
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
