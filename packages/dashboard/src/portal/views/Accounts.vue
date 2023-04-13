<template>
  <v-container v-if="!$store.state.portal.accounts.length">
    <WelcomeWindow />
  </v-container>
  <v-container v-else style="">
    <h1 class="text-center">Connected Accounts</h1>

    <v-container fluid>
      <v-row>
        <v-col>
          <v-text-field
            v-model="searchTerm"
            color="primary darken-2"
            label="Search by account name or address"
          ></v-text-field>
        </v-col>
      </v-row>
      <div v-if="accounts.length">
        <v-card
          v-for="account in filteredAccounts()"
          :key="account.address"
          @click="onSelectAccount(account)"
          class="my-4 primary white--text"
        >
          <div class="d-flex justify-space-between">
            <div class="d-inline-block text-truncate">
              <v-card-title>{{ account.meta.name }}</v-card-title>
              <v-card-subtitle>
                {{ account.address }}
              </v-card-subtitle>
            </div>
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </v-card>
      </div>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { accountInterface } from "../store/state";
import WelcomeWindow from "../components/WelcomeWindow.vue";
import Account from "./Account.vue";
import FundsCard from "../components/FundsCard.vue";

@Component({
  name: "AccountsView",
  components: { WelcomeWindow, Account, FundsCard },
})
export default class AccountsView extends Vue {
  searchTerm = "";
  accounts: accountInterface[] = [];
  $api: any;

  mounted() {
    this.accounts = this.$store.state.portal.accounts;
  }

  updated() {
    this.accounts = this.$store.state.portal.accounts;
  }

  unmounted() {
    this.$store.commit("UNSET_CREDENTIALS");
  }

  public filteredAccounts() {
    if (this.searchTerm.length !== 0) {
      return this.accounts.filter(
        account =>
          account.meta.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          account.address.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }
    return this.accounts;
  }

  public async onSelectAccount(account: accountInterface) {
    this.accounts.map(account => (account.active = false));
    account.active = true;
    this.$store.commit("SET_CREDENTIALS", { api: this.$api, account: account });
    this.$root.$emit("selectAccount");
    this.$router.push({
      name: "account",
      path: "account",
      params: { accountID: `${account.address}` },
    });
  }
}
</script>
