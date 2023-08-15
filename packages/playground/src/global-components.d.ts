import type { NetworkEnv } from "@threefold/grid_client";

import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    WebletLayout: typeof WebletLayout;
    ViewLayout: typeof ViewLayout;
  }
}

declare global {
  interface Window {
    env: {
      NETWORK: NetworkEnv;
      GRAPHQL_URL: string;
      GRIDPROXY_URL: string;
      SUBSTRATE_URL: string;
      ACTIVATION_SERVICE_URL: string;
      RELAY_DOMAIN: string;
      BRIDGE_TFT_ADDRESS: string;
      STELLAR_NETWORK: string;
      STELLAR_HORIZON_URL: string;
      TFT_ASSET_ISSUER: string;
    };
  }
}
