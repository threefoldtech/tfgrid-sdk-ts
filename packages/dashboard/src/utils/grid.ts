import { BackendStorageType, GridClient, NetworkEnv } from "@threefold/grid_client";

export async function getGrid(mnemonic: string) {
  const grid = new GridClient({
    mnemonic,
    network: NetworkEnv.dev,
    backendStorageType: BackendStorageType.tfkvstore,
  });

  await grid.connect();
  return grid;
}
