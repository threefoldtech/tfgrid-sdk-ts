<template>
  <v-container fluid v-if="openDialog" height="100%">
    <v-dialog
      v-model="openDialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      style="background-color: black"
      :loading="loadingTC"
    >
      <iframe
        :src="documentLink"
        frameborder="0"
        style="background-color: white"
        allow="fullscreen"
        height="95%"
        width="100px"
        sandbox="allow-forms allow-modals allow-scripts allow-popups allow-same-origin "
      ></iframe>
      <v-btn @click="acceptTC" :loading="loadingAcceptedTC"> accept terms and conditions </v-btn>
    </v-dialog>
  </v-container>

  <v-container v-else-if="$store.state.portal.accounts.length === 0">
    <v-card transparent outlined>
      <WelcomeWindow />
    </v-card>
  </v-container>
  <v-container v-else-if="$store.state.credentials.loading">
    <div class="d-flex justify-center" style="display: block; padding: 10%">
      <v-progress-circular indeterminate color="blue" :size="335" :width="7">
        <span style="font-size: large; color: white">Loading Twin Details</span>
      </v-progress-circular>
    </div>
  </v-container>
  <v-container v-else-if="!$store.state.credentials.twin.id">
    <v-card class="text-center primary white--text py-5 my-3">
      <h2>
        Welcome aboard {{ $store.state.credentials.account.meta.name }}, <br />
        Let’s get you connected to the TF Grid by creating a twin!
      </h2>
    </v-card>

    <v-container fluid class="px-0">
      <v-card class="pa-5 text-center" height="175">
        <h3>Choose a Relay Address</h3>
        <v-form>
          <v-select
            :items="items"
            label="Please select a relay:"
            v-model="selectedItem.item_id"
            item-text="name"
            item-value="id"
          >
          </v-select>
        </v-form>
        <v-btn
          class="primary"
          :loading="loadingTwinCreate"
          @click="createTwinFunc(selectedName, $store.state.credentials.twin.pk)"
        >
          create
        </v-btn>
      </v-card>

      <!-- <v-row>
        <v-col>
          <v-card class="pa-5 text-center d-flex align-center justify-center">
            <v-btn
              class="primary"
              :target="'blank'"
              :href="'https://library.threefold.me/info/manual/#/manual__yggdrasil_client'"
              >Why do I even need a twin?</v-btn
            >
          </v-card>
        </v-col>
      </v-row> -->
    </v-container>
  </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { Component, Vue } from "vue-property-decorator";
import { createTwin } from "../lib/twin";
import md5 from "md5";
import { acceptTermsAndCondition, userAcceptedTermsAndConditions } from "../lib/accepttc";
import WelcomeWindow from "../components/WelcomeWindow.vue";
import { activateThroughActivationService } from "../lib/activation";
import Twin from "./Twin.vue";
import { accountInterface } from "../store/state";
import config from "@/portal/config";

@Component({
  name: "AccountView",
  components: { WelcomeWindow, Twin },
})
export default class AccountView extends Vue {
  documentLink = "https://library.threefold.me/info/legal/#/";
  documentHash = "";
  openDialog = false;
  $api: any;
  loadingTC = true;
  loadingTwinCreate = false;
  loadingAcceptedTC = false;
  items = [{ id: 1, name: config.relay }];
  selectedItem = {
    item_id: 1,
  };
  selectedName = "";

  async updated() {
    if (this.$api) {
      this.selectedName = this.items.filter(item => item.id === this.selectedItem.item_id)[0].name;
      if (this.$store.state.credentials.twin.id) {
        this.$router.push({
          name: "account-twin",
          path: "/:accountID/account-twin",
        });
      }
    }
    this.openDialog = !(await userAcceptedTermsAndConditions(this.$api, this.$route.params.accountID));
  }
  async mounted() {
    if (this.$api) {
      this.openDialog = !(await userAcceptedTermsAndConditions(this.$api, this.$route.params.accountID));
      let document = await axios.get(this.documentLink);
      this.documentHash = md5(document.data);
      this.selectedName = this.items.filter(item => item.id === this.selectedItem.item_id)[0].name;
    } else {
      this.$toasted.show(`Can't connect to Polkadot API right now, please refresh the page or try again later`);
      this.$router.push({
        name: "accounts",
        path: "/",
      });
    }
  }
  unmounted() {
    this.$route.params.accountID = "";
    this.$store.commit("UNSET_CREDENTIALS");
  }

  public async createTwinFunc(relay: string, pk: string | null) {
    this.loadingTwinCreate = true;
    await createTwin(
      this.$route.params.accountID,
      this.$api,
      relay,
      pk,
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
            this.$toasted.show("Twin creation failed!");
            this.loadingTwinCreate = false;
          } else {
            // Loop through Vec<EventRecord> to display all events
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "tfgridModule" && method === "TwinStored") {
                const selectedAccount: accountInterface = this.$store.state.portal.accounts.filter(
                  (account: accountInterface) => account.address == this.$route.params.accountID,
                )[0];
                selectedAccount.active = true;
                this.$store.commit("SET_CREDENTIALS", { api: this.$api, account: selectedAccount });
                this.$store.state.credentials.twin.relay = relay;
                this.$toasted.show("Twin created!");
                // this.$store.state.credentials.initialized = true;
                // this.$store.state.credentials.loading = false;
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("Twin creation failed!");
              }
              this.loadingTwinCreate = false;
            });
          }
        }
      },
    ).catch((err: { message: string }) => {
      this.$toasted.show(err.message);
      this.loadingTwinCreate = false;
    });
  }
  public acceptTC() {
    this.loadingAcceptedTC = true;
    activateThroughActivationService(this.$route.params.accountID);
    acceptTermsAndCondition(
      this.$api,
      this.$route.params.accountID,
      this.documentLink,
      this.documentHash,
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
            this.openDialog = false;
        }
        if (status.isFinalized) {
          console.log(`Transaction included at blockHash ${status.asFinalized}`);
          if (!events.length) {
            this.$toasted.show("rejected");
            this.loadingAcceptedTC = false;
          } else {
            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              if (section === "system" && method === "ExtrinsicSuccess") {
                this.$toasted.show("Accepted!");
                this.loadingTC = false;
                this.loadingAcceptedTC = false;
              } else if (section === "system" && method === "ExtrinsicFailed") {
                this.$toasted.show("rejected");
                this.loadingAcceptedTC = false;
              }
            });
          }
        }
      },
    ).catch((err: { message: string }) => {
      this.$toasted.show(err.message);
      this.loadingAcceptedTC = false;
    });
  }
}
</script>
