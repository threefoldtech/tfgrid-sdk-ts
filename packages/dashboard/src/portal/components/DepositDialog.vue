<template>
  <v-container>
    <v-dialog transition="dialog-bottom-transition" max-width="900" v-model="depositDialog">
      <v-card>
        <v-toolbar color="primary" dark>Deposit TFT</v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                Send a {{ selectedName.toUpperCase() }} transaction with your TFT's to deposit to:
                <ul>
                  <li>
                    Destination: <b>{{ depositWallet }}</b>
                  </li>
                  <li>
                    Memo Text: <b>twin_{{ $store.state.credentials.twin.id }}</b>
                  </li>
                </ul>
              </v-col>
              <v-divider class="mx-4" vertical></v-divider>
              <v-col>
                Or use Threefold connect to scan this qr code:
                <div class="d-flex justify-center">
                  <qrcode-vue
                    :value="qrCodeText"
                    :size="200"
                    level="M"
                    render-as="svg"
                    style="background: white; padding: 6%"
                  />
                </div>
              </v-col>
            </v-row>
            <v-row class="d-flex row justify-center"
              >Amount: should be larger than {{ depositFee }}TFT (deposit fee is: {{ depositFee }}TFT)</v-row
            >
          </v-container>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="depositDialog = false" class="grey lighten-2 black--text">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script lang="ts">
import { QueryClient } from "@threefold/tfchain_client";
import QrcodeVue from "qrcode.vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { balanceInterface, getBalance } from "../lib/balance";
@Component({
  name: "DepositDialog",
  components: { QrcodeVue },
})
export default class DepositDialog extends Vue {
  @Prop({ required: true }) selectedName!: string;
  @Prop({ required: true }) depositWallet!: string;
  @Prop({ required: true }) qrCodeText!: string;
  @Prop({ required: true }) depositFee!: number;
  @Prop({ required: true }) openDepositDialog!: boolean;
  $api: any;
  client = new QueryClient(window.configs.APP_API_URL);
  private _destroyed = false;
  depositDialog = false;
  async created() {
    if (!this.openDepositDialog) return;
    this.depositDialog = true;
    try {
      const receivedDeposit = await this.client.tftBridge.listenToMintCompleted(
        this.$store.state.credentials.account.address,
      );
      if (this._destroyed) return;
      this.$toasted.show(`You have received ${receivedDeposit / 10000000} TFT`);
      getBalance(this.$api, this.$store.state.credentials.account.address).then((balance: balanceInterface) => {
        this.$store.state.credentials.balance.free = balance.free;
      });
    } catch (error) {
      if (this._destroyed) return;
      this.$toasted.show(error as string);
      this.handleClose();
    }
  }
  @Watch("depositDialog")
  handleClose() {
    if (!this.depositDialog) this.$emit("close");
  }
  destroyed() {
    this._destroyed = true;
  }
}
</script>
