/// <reference types="svelte" />

import type { NetworkEnv } from "@threefold/grid_client";
import * as grid3_client from "@threefold/grid_client";
import * as bip39 from "bip39";
import * as buffer from "buffer";

import balanceStore from "./stores/balance";
// stores
import baseConfigStore from "./stores/baseConfig";
import currentDeploymentStore from "./stores/currentDeployment";
import deploymentStore from "./stores/deploymentStore";
import notificationStore from "./stores/notifications";

interface AppConfigs {
  grid3_client: typeof grid3_client;
  baseConfig: typeof baseConfigStore;
  deploymentStore: typeof deploymentStore;
  notificationStore: typeof notificationStore;
  currentDeploymentStore: typeof currentDeploymentStore;
  balanceStore: typeof balanceStore;
  buffer: typeof buffer;
  bip39: typeof bip39;
}

interface EnvionmentVariables {
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
}

declare global {
  interface Window {
    configs: AppConfigs;
    env?: EnvionmentVariables;
  }
}
