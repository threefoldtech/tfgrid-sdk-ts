import Vue, { VNode } from "vue";

interface AppConfigs {
  APP_API_URL: string;
  APP_STELLAR_HORIZON_URL: string;
  APP_TFT_ASSET_ISSUER: string;
  APP_BRIDGE_TFT_ADDRESS: string;
  APP_ACTIVATION_SERVICE_URL: string;
  APP_EXPLORER_URL: string;
  APP_GRAPHQL_URL: string;
  APP_GRIDPROXY_URL: string;
  STELLAR_NETWORK: string;
  APP_NETWORK: string;
  APP_VERSION: string;
  RELAY: string;
  APP_GRAVITY_CONTRACT_ADDRESS: string;
  APP_TFT_TOKEN_CONTRACT_ADDRESS: string;
  APP_BRIDGE_FEES: string;
  APP_TFT_DECIMALS: number;
  APP_TFT_DENOM: string;
  APP_PROPOSAL_DENOM: string;
  APP_COSMOS_REST: string;
  APP_TENDERMINT_RPC: string;
  APP_GAS_PRICE: string;
  APP_CHAIN_ID: string;
  PLAYGROUND_URL: string;
}
declare let process: {
  env: {
    APP_API_URL: string;
    APP_STELLAR_HORIZON_URL: string;
    APP_TFT_ASSET_ISSUER: string;
    APP_BRIDGE_TFT_ADDRESS: string;
    APP_ACTIVATION_SERVICE_URL: string;
    APP_EXPLORER_URL: string;
    APP_GRAPHQL_URL: string;
    APP_GRIDPROXY_URL: string;
    STELLAR_NETWORK: string;
    APP_VERSION: string;
  };
};

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
    interface WindowInterface extends Window {
      [url: URL];
    }
  }

  interface Window {
    keplr: any;
    ethereum: any;
    config: any;
    configs: AppConfigs;
  }

  declare module "*.json" {
    let value: any;
    return value;
  }
}
