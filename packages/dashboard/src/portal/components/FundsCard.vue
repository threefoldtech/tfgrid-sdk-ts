<template>
  <v-container>
    <v-card class="d-flex align-center font-weight-bold mr-4 primary">
      <v-card-actions class="pr-0">
        <v-btn @click="addTFT()" style="max-width: 90px" :loading="loadingAddTFT">GET TFT</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import config from "@/portal/config";
import { getBalance, getMoreFunds } from "@/portal/lib/balance";

@Component({
  name: "FundsCard",
})
export default class FundsCard extends Vue {
  loadingAddTFT = false;
  $api: any;

  async addTFT() {
    if (config.network !== "dev" && config.network !== "qa") {
      window.open("https://gettft.com/gettft/", "_blank");
    } else {
      this.loadingAddTFT = true;
      getMoreFunds(
        this.$store.state.credentials.account.address,
        this.$api,
        (res: { events?: never[] | undefined; status: { type: string; asFinalized: string; isFinalized: string } }) => {
          console.log(res);
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
              this.$toasted.show("Get more TFT failed!");
              this.loadingAddTFT = false;
            } else {
              // Loop through Vec<EventRecord> to display all events
              events.forEach(({ phase, event: { data, method, section } }) => {
                console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
                if (section === "balances" && method === "Transfer") {
                  this.$toasted.show("Success!");
                  this.loadingAddTFT = false;
                  getBalance(this.$api, this.$store.state.credentials.account.address).then(balance => {
                    this.$store.state.credentials.balance.free = balance.free;
                    this.$store.state.credentials.balance.reserved = balance.reserved;
                  });
                } else if (section === "system" && method === "ExtrinsicFailed") {
                  this.$toasted.show("Get more TFT failed!");
                  this.loadingAddTFT = false;
                }
              });
            }
          }
        },
      ).catch((err: { message: string }) => {
        console.log(err.message);
        this.loadingAddTFT = false;
        this.$toasted.show("Get more TFT failed!");
      });
    }
  }
}
</script>
