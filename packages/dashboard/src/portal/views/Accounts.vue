<template>
  <div>Please connect your wallet</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import FundsCard from "../components/FundsCard.vue";
import { accountInterface } from "../store/state";
import Account from "./Account.vue";

@Component({
  name: "AccountsView",
  components: { Account, FundsCard },
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
