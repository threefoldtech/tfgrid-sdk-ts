import type { NetworkEnv } from "@threefold/grid_client";

import CopyInputWrapper from "./components/copy_input_wrapper.vue";
import DTabs from "./components/dynamic_tabs.vue";
import FormValidator from "./components/form_validator.vue";
import InputTooltip from "./components/input_tooltip.vue";
import PasswordInputWrapper from "./components/password_input_wrapper.vue";
import ViewLayout from "./components/view_layout.vue";
import WebletLayout from "./components/weblet_layout.vue";

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    PasswordInputWrapper: typeof PasswordInputWrapper;
    WebletLayout: typeof WebletLayout;
    CopyInputWrapper: typeof CopyInputWrapper;
    DTabs: typeof DTabs;
    FormValidator: typeof FormValidator;
    ViewLayout: typeof ViewLayout;
    InputTooltip: typeof InputTooltip;
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
