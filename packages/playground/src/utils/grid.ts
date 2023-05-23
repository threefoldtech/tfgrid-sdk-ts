import { BackendStorageType, GridClient, NetworkEnv } from "@threefold/grid_client";

import type { Profile } from "../stores/profile_manager";

const NETWORK = process.env.NETWORK as NetworkEnv;

export async function getGrid(profile: Pick<Profile, "mnemonic">, projectName?: string) {
  if (!profile) return null;
  const grid = new GridClient({
    mnemonic: profile.mnemonic,
    network: NETWORK,
    backendStorageType: BackendStorageType.tfkvstore,
    projectName,
  });
  await grid.connect();
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
    network: NETWORK,
    mnemonic: "",
    storeSecret: "test",
  });
  grid._connect();
  const relay = grid.getDefaultUrls(NETWORK).relay.slice(6);
  return grid.tfchain.createAccount(relay);
}

export interface Balance {
  free: number;
  locked: number;
}
export async function loadBalance(grid: GridClient): Promise<Balance> {
  const balance = await grid.balance.getMyBalance();
  return {
    free: +balance.free,
    locked: +balance.reserved,
  };
}

export async function loadProfile(grid: GridClient): Promise<Profile> {
  return {
    mnemonic: grid.clientOptions!.mnemonic,
    ssh: await readSSH(grid),
    twinId: grid!.twinId,
    address: grid.tfclient.address,
  };
}

export async function getMetadata(grid: GridClient): Promise<{ [key: string]: any }> {
  const metadata = await grid.kvstore.get({ key: "metadata" });
  try {
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
