<template>
  <div style="padding-top: 66px">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Actions } from "./store";
import { checkKeplr } from "./utils/checkKeplr";
import { ensureChain } from "./utils/keplr";

@Component({
  name: "Hub",
})
export default class Hub extends Vue {
  // error: string | null = null;

  // routes = [
  //   { label: "Send to Threefold Hub", path: "/", keplr: false },
  //   { label: "Send to BSC", path: "/bsc", keplr: true },
  //   { label: "Pending BSC transactions", path: "/list-bsc", keplr: true },
  //   { label: "Add proposal", path: "/add-proposal", keplr: true },
  //   { label: "Proposals", path: "/list-proposals", keplr: false },
  //   { label: "Validators", path: "/validators", keplr: false },
  // ];

  // get keplr(): Keplr {
  //   return this.$store.state.keplr;
  // }

  created() {
    this.$store.dispatch(Actions.CHECK_KEPLR);
    checkKeplr().then(_ => {
      ensureChain(
        this.$store.state.hub.config.chain_id,
        "tf",
        this.$store.state.hub.config.tendermint_rpc,
        this.$store.state.hub.config.cosmos_rest,
      ).catch(e => {
        console.log(e.message);
        // this.error =
        //   "Couldn't check whether keplr installed or not (refresh to try again): " +
        //   e.message;
      });
    });
  }
}
</script>
