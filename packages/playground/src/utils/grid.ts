import { BackendStorageType, GridClient, KeypairType, NetworkEnv } from "@threefold/grid_client";
import { InsufficientBalanceError } from "@threefold/types";

import type { Profile } from "../stores/profile_manager";
const network = (process.env.NETWORK as NetworkEnv) || window.env.NETWORK;
export async function getGrid(
  profile: Pick<Profile, "mnemonic"> & Partial<Pick<Profile, "keypairType">>,
  projectName?: string,
) {
  if (!profile) return null;
  const grid = new GridClient({
    mnemonic: profile.mnemonic,
    network,
    backendStorageType: BackendStorageType.tfkvstore,
    keypairType: profile.keypairType || KeypairType.sr25519,
    projectName,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });
  try {
    await grid.connect();
  } catch (e) {
    if (!(e instanceof InsufficientBalanceError)) throw e;
  }
  return grid;
}

interface UpdateGridOptions {
  projectName?: string;
}
export function updateGrid(grid: GridClient, options: UpdateGridOptions) {
  grid.clientOptions!.projectName = options.projectName;
  grid._connect();
  return grid;
}

export function createAccount() {
  const grid = new GridClient({
    network,
    mnemonic: "",
    storeSecret: "test",
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });
  grid._connect();
  const relay = grid.getDefaultUrls(network).relay.slice(6);
  return grid.tfchain.createAccount(relay);
}

export function activateAccountAndCreateTwin(mnemonic: string) {
  const grid = new GridClient({
    network,
    mnemonic,
    storeSecret: mnemonic,
    substrateURL: window.env.SUBSTRATE_URL,
    proxyURL: window.env.GRIDPROXY_URL,
    graphqlURL: window.env.GRAPHQL_URL,
    activationURL: window.env.ACTIVATION_SERVICE_URL,
    relayURL: window.env.RELAY_DOMAIN,
  });
  grid._connect();
  const relay = grid.getDefaultUrls(network).relay.slice(6);
  return grid.tfchain.activateAccountAndCreateTwin(mnemonic, relay, true);
}

export interface Balance {
  free: number;
  locked: number;
}
export async function loadBalance(grid: GridClient): Promise<Balance> {
  const balance = await grid.balance.getMyBalance();
  return {
    free: +balance.free,
    locked: +balance.frozen,
  };
}

export async function loadProfile(grid: GridClient): Promise<Profile> {
  return {
    mnemonic: grid._mnemonic,
    ssh: await readSSH(grid),
    twinId: grid.twinId,
    address: grid.tfclient.address,
    relay: grid.getDefaultUrls(network).relay.slice(6),
    pk: (await grid.twins.get({ id: grid!.twinId })).pk,
    keypairType: grid.clientOptions!.keypairType,
    email: await readEmail(grid),
  };
}

export async function getMetadata(grid: GridClient): Promise<{ [key: string]: any }> {
  try {
    const metadata = await grid.kvstore.get({ key: "metadata" });
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

export async function readSSH(grid: GridClient): Promise<string> {
  const metadata = await getMetadata(grid);
  return metadata.sshkey || "";
}

export async function storeSSH(grid: GridClient, newSSH: string): Promise<void> {
  const metadata = await getMetadata(grid);
  const ssh = metadata.sshkey;
  if (ssh === newSSH) return;

  return grid.kvstore.set({
    key: "metadata",
    value: JSON.stringify({
      ...metadata,
      sshkey: newSSH,
    }),
  });
}

export async function readEmail(grid: GridClient): Promise<string> {
  const metadata = await getMetadata(grid);

  return metadata.email || "";
}

export async function storeEmail(grid: GridClient, newEmail: string): Promise<void> {
  const metadata = await getMetadata(grid);
  const email = metadata.email;
  if (email === newEmail) return;

  return grid.kvstore.set({
    key: "metadata",
    value: JSON.stringify({
      ...metadata,
      email: newEmail,
    }),
  });
}
