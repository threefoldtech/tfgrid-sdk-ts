<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>

    <v-card>
      <v-tabs centered v-model="activeTab">
        <v-tab> By Twin ID </v-tab>
        <v-tab class=""> By Address</v-tab>

        <!-- TwinID Transfer -->
        <v-tab-item>
          <template>
            <v-card class="pa-5 my-5" flat>
              <v-form v-model="isValidTwinIDTransfer">
                <TransferInputField
                  v-model="receptinTwinId"
                  label="Recipient TwinID:"
                  :type="'number'"
                  :hint="validatingTwinId ? 'validating...' : null"
                  :errorMessages="twinIDErrorMessage"
                />
                <TransferInputField
                  v-model="transferAmount"
                  label="Amount (TFT)"
                  :type="'number'"
                  :rules="getAmountRules(transferAmount)"
                />
                <span class="fee">0.01 transaction fee will be deducted</span>
              </v-form>
              <TransferFormButtons
                :isTransferValid="isValidTwinIDTransfer && !twinIDErrorMessage && !!receptinTwinId"
                :loadingTransfer="loadingTransfer"
                @submit="transferTFTWithTwinID"
                @clear="clearInputValues"
              />
            </v-card>
          </template>
        </v-tab-item>

        <!-- Address Transfer -->
        <v-tab-item>
          <template>
            <v-card class="pa-5 my-5" flat>
              <v-form v-model="isValidAddressTransfer">
                <TransferInputField
                  v-model="receipientAddress"
                  label="Recipient Address:"
                  :type="'text'"
                  :rules="[() => validateAddressTransfer() || addressErrorMessage]"
                />

                <TransferInputField
                  v-model="transferAmount"
                  label="Amount (TFT)"
                  :type="'number'"
                  :rules="getAmountRules(transferAmount)"
                />
                <span class="fee">0.01 transaction fee will be deducted</span>
              </v-form>

              <TransferFormButtons
                :isTransferValid="isValidAddressTransfer"
                :loadingTransfer="loadingTransfer"
                @submit="transferTFTWithAddress"
                @clear="clearInputValues"
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
import { Decimal } from "decimal.js";
import QrcodeVue from "qrcode.vue";
import { Component, Vue, Watch } from "vue-property-decorator";

import { validateNumberField } from "@/explorer/utils/validations";

import TransferFormButtons from "../components/TransferFormButtons.vue";
import TransferInputField from "../components/TransferInputField.vue";
import { balanceInterface, getBalance } from "../lib/balance";
import { checkAddress, transfer } from "../lib/transfer";

@Component({
  name: "TransferView",
  components: { QrcodeVue, TransferInputField, TransferFormButtons },
})
export default class TransferView extends Vue {
  $api: any;

  receipientAddress = "";
  receptinTwinId = "";

  isValidAddressTransfer = false;
  isValidTwinIDTransfer = false;
  validatingTwinId = false;

  addressErrorMessage = "";
  twinIDErrorMessage = "";

  transferAmount = 1;
  activeTab = 0;

  loadingTransfer = false;

  queryClient = new QueryClient(window.configs.APP_API_URL);
  client = new Client({ url: window.configs.APP_API_URL });

  mounted() {
    if (!this.$api && !this.$store.state.credentials.initialized) {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }

  @Watch("receptinTwinId")
  async checkTwinId(twinId: string) {
    this.validatingTwinId = true;
    this.twinIDErrorMessage = "";
    const isNotANumber = validateNumberField(twinId, "twinId");

    if (!twinId) this.twinIDErrorMessage = "Twin ID is required.";
    else if (!isNotANumber.isValid) this.twinIDErrorMessage = isNotANumber.errorMessage;
    else if (!(parseInt(twinId) >= -(2 ** 31) && parseInt(twinId) <= 2 ** 31 - 1))
      this.twinIDErrorMessage = "Please enter a valid twin id";
    else if (parseInt(twinId) === this.$store.state.credentials.twin.id)
      this.twinIDErrorMessage = "You can't transfer to yourself";
    else {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timed out."));
        }, 6000);
      });
      try {
        const twinDetailsPromise = this.queryClient.twins.get({ id: parseInt(this.receptinTwinId) });
        const twinDetails = await Promise.race([twinDetailsPromise, timeoutPromise]);
        if (!twinDetails) {
          this.twinIDErrorMessage = "Twin ID doesn't exist";
        }
      } catch (error) {
        this.twinIDErrorMessage = "Twin ID doesn't exist";
      }
    }
    this.validatingTwinId = false;
  }

  clearInputValues() {
    this.receipientAddress = "";
    this.receptinTwinId = "";
    this.transferAmount = 1;
    this.twinIDErrorMessage = "";
    this.addressErrorMessage = "";
  }

  validateAddressTransfer() {
    // Validate the address
    const isValid = checkAddress(this.receipientAddress);
    if (!isValid) {
      this.addressErrorMessage = "Invalid address.";
      this.isValidAddressTransfer = false;
    } else if (this.receipientAddress === this.$store.state.credentials.account.address) {
      this.addressErrorMessage = "You can't transfer to yourself.";
      this.isValidAddressTransfer = false;
    } else {
      this.addressErrorMessage = "";
      this.isValidAddressTransfer = true;
    }

    return this.isValidAddressTransfer;
  }

  getAmountRules(value: any) {
    return [
      (v: any) => !!v || "Amount should be a number.",
      () => value > 0 || "Amount cannot be negative or 0.",
      () => value < parseFloat(this.$store.state.credentials.balance.free) || "Amount cannot exceed balance.",
    ];
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }

  async transferTFTWithTwinID() {
    const twinDetails = await this.queryClient.twins.get({ id: parseInt(this.receptinTwinId) });
    if (twinDetails != null) {
      const twinAddress = twinDetails.accountId;
      const client = new Client({
        url: window.configs.APP_API_URL,
        mnemonicOrSecret: this.$store.state.profile.mnemonic,
      });
      this.loadingTransfer = true;
      const decimalAmount = new Decimal(this.transferAmount);
      const milliAmount = decimalAmount.mul(10 ** 7).toNumber();
      try {
        const transferResult = await client.balances.transfer({
          address: twinAddress,
          amount: milliAmount,
        });
        this.$toasted.show(`Transaction submitted`);
        await transferResult.apply();

        this.$toasted.show("Transfer succeeded!");
        this.loadingTransfer = false;

        getBalance(this.$api, this.$store.state.credentials.account.address).then((balance: balanceInterface) => {
          this.$store.state.credentials.balance.free = balance.free;
          this.$store.state.credentials.balance.reserved = balance.reserved;
        });
      } catch (error) {
        this.$toasted.show("Transfer failed!");
        this.loadingTransfer = false;
      }
    } else {
      this.$toasted.show("Twin ID doesn't exist");
      this.loadingTransfer = false;
    }
  }

  transferTFTWithAddress() {
    transfer(
      this.$store.state.credentials.account.address,
      this.$api,
      this.receipientAddress,
      this.transferAmount,
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
