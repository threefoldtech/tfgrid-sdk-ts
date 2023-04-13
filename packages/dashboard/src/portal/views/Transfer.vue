<template>
  <v-container>
    <v-card color="primary" class="white--text pa-5 my-5">
      <h3 class="text-center">Transfer TFTs on the TFChain</h3>
    </v-card>
    <v-card class="pa-5 my-5">
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
        <v-text-field
          @paste.prevent
          v-model="amount"
          label="Amount (TFT)"
          type="number"
          onkeydown="javascript: return event.keyCode == 69 || /^\+$/.test(event.key) ? false : true"
          :rules="[
            () => !!amount || 'This field is required',
            () =>
              (amount.toString().split('.').length > 1 ? amount.toString().split('.')[1].length <= 3 : true) ||
              'Amount must have 3 decimals only',
            () => amount > 0 || 'Amount cannot be negative or 0',
            () => amount < parseFloat($store.state.credentials.balance.free) || 'Amount cannot exceed balance',
          ]"
        >
        </v-text-field>
        <span class="fee">0.01 transaction fee will be deducted</span>
      </v-form>
      <v-card-actions>
        <v-spacer> </v-spacer>
        <v-btn @click="clearInput" color="grey lighten-2 black--text">Clear</v-btn>
        <v-btn class="primary white--text" @click="transferTFT" :loading="loadingTransfer" :disabled="!isTransferValid"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { checkAddress, transfer } from "../lib/transfer";
import QrcodeVue from "qrcode.vue";
import { accountInterface } from "../store/state";
import { balanceInterface, getBalance } from "../lib/balance";

@Component({
  name: "TransferView",
  components: { QrcodeVue },
})
export default class TransferView extends Vue {
  receipientAddress = "";
  accountsAddresses: any = [];
  $api: any;
  amount = 0;
  loadingTransfer = false;
  isTransferValid = false;

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
    this.amount = 0;
  }

  transferTFT() {
    transfer(
      this.$store.state.credentials.account.address,
      this.$api,
      this.receipientAddress,
      this.amount,
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

  setValue($event: { target: { value: string } }) {
    requestAnimationFrame(() => {
      this.receipientAddress = $event.target.value;
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
