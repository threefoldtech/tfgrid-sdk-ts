import { TFservicesLiveChecker } from "../src/index";
import { TFServices } from "../src/types";
async function HealthCheck() {
  /* urls.rmbProxy = "https://gridproxy.dev.grid.tf";
  urls.relay = "wss://relay.dev.grid.tf";
  urls.substrate = "wss://tfchain.dev.grid.tf/ws";
  urls.graphql = "https://graphql.dev.grid.tf/graphql";
   */
  try {
    const s: TFServices = {
      graphQL: { LivenessURL: "https://graphql.dev.grid.tf/graphql" },
      gridProxy: { LivenessURL: "https://gridproxy.dev.grid.tf" },
      tfChain: { LivenessURL: "wss://tfchain.dev.grid.tf/ws" },
      rmb: { LivenessURL: "wss://relay.dev.grid.tf" },
    };
    console.log(await TFservicesLiveChecker(s));
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
}

HealthCheck();
