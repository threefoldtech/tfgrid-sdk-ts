import fs from "fs";
import path from "path";
import { env } from "process";

import { ClientOptions, GridClient, NetworkEnv } from "../src";

const network = env.NETWORK as NetworkEnv;
const mnemonic = env.MNEMONIC;
const storeSecret = env.STORE_SECRET;
const ssh_key = env.SSH_KEY;

let config: { ssh_key: string } & ClientOptions;
setConfig();

/**
 * Loads configuration either from environment variables or from a config.json file.
 * If environment variables are not fully set, it falls back to loading from the config.json file.
 */
function setConfig() {
  if (network === undefined || mnemonic === undefined || ssh_key === undefined) {
    console.log("Credentials not all found in env variables. Loading all credentials from default config.json...");
    config = JSON.parse(fs.readFileSync(path.join(__dirname, "./config.json"), "utf-8"));
  } else {
    console.log("Credentials loaded from env variables...");
    config = {
      network: network,
      mnemonic: mnemonic,
      storeSecret: storeSecret,
      ssh_key: ssh_key,
    };
  }
}

/**
 * Function to instantiate and connect a GridClient with a specified project name.
 *
 * The project name is important to list your deployments.
 * @example
 *
 * const deploymentName = 'testVM'
 * const projectName = 'vm/' + deploymentName
 * const gc = await getClient(projectName)
 * await gc.machines.deploy({...});
 * // When you deploy using this project name, you'll only be able to list your deployments using this same project name.
 * await gc.machines.getObj(deploymentName);
 *
 * @param projectName - Optional project name to use with the GridClient instance.
 * @returns {Promise<GridClient>} - A promise that resolves to a connected GridClient instance.
 */
async function getClient(projectName = ""): Promise<GridClient> {
  const gridClient = new GridClient({
    network: config.network,
    mnemonic: config.mnemonic,
    storeSecret: config.storeSecret,
    projectName,
  });
  await gridClient.connect();
  return gridClient;
}

/**
 * Function to instantiate and connect a new GridClient using the existing mnemonic as the store secret.
 *
 * @returns {Promise<GridClient>} - A promise that resolves to a connected GridClient instance.
 */
async function getNewClient(): Promise<GridClient> {
  const gridClient = new GridClient({
    network: config.network,
    mnemonic: config.mnemonic,
    storeSecret: config.mnemonic,
  });
  await gridClient.connect();
  return gridClient;
}

export { config, getClient, getNewClient };
