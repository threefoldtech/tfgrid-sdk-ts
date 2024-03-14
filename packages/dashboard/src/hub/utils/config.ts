import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export interface Config {
  gravity_contract_address: string;
  tft_token_contract_address: string;
  bridge_fees: BigNumber;
  tft_decimals: number;
  tft_denom: string;

  cosmos_rest: string;
  tendermint_rpc: string;
  proposal_denom: string;
  gas_price: string;
  chain_id: string;
}

async function validateConfig(config: { [key: string]: any }) {
  const props = [
    "APP_BRIDGE_FEES",
    "APP_TFT_TOKEN_CONTRACT_ADDRESS",
    "APP_GRAVITY_CONTRACT_ADDRESS",
    "APP_TFT_DECIMALS",
    "APP_TFT_DENOM",
    "APP_COSMOS_REST",
    "APP_TENDERMINT_RPC",
    "APP_PROPOSAL_DENOM",
    "APP_GAS_PRICE",
    "APP_CHAIN_ID",
  ];
  const numbers = ["APP_BRIDGE_FEES", "APP_TFT_DECIMALS"];
  for (const prop of props) {
    if (config[prop] === undefined) {
      throw new Error(prop + " is required and not present in the env vars");
    }
  }
  for (const prop of numbers) {
    if (isNaN(+config[prop])) {
      throw new Error(((prop + "=" + config[prop]) as string) + " is not a valid number");
    }
  }
}

export function loadConfig(): Config {
  const config = window.configs;
  validateConfig(config);
  const tft_decimals = +config["APP_TFT_DECIMALS"];
  return {
    bridge_fees: parseUnits(config["APP_BRIDGE_FEES"], tft_decimals),
    tft_token_contract_address: config["APP_TFT_TOKEN_CONTRACT_ADDRESS"],
    gravity_contract_address: config["APP_GRAVITY_CONTRACT_ADDRESS"],
    tft_decimals: tft_decimals,
    tft_denom: config["APP_TFT_DENOM"],
    cosmos_rest: config["APP_COSMOS_REST"],
    tendermint_rpc: config["APP_TENDERMINT_RPC"],
    proposal_denom: config["APP_PROPOSAL_DENOM"],
    gas_price: config["APP_GAS_PRICE"],
    chain_id: config["APP_CHAIN_ID"],
  };
}
