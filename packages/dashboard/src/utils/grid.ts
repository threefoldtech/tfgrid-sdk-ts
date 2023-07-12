import { BackendStorageType, GridClient, NetworkEnv } from "@threefold/grid_client";

import { Profile } from "@/store";

export async function getGrid(mnemonic: string) {
  const grid = new GridClient({
    mnemonic,
    network: NetworkEnv.dev,
    backendStorageType: BackendStorageType.tfkvstore,
  });

  await grid.connect();
  return grid;
}

export async function loadProfile(grid: GridClient): Promise<Profile> {
  return {
    mnemonic: grid.clientOptions!.mnemonic,
    ssh: await readSSH(grid),
    twin: grid!.twinId,
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

export function downloadAsFile(name: string, data: string) {
  const a = document.createElement("a");
  a.download = name;
  a.href = `data:text/raw;charset=utf-8,${encodeURIComponent(data)}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
