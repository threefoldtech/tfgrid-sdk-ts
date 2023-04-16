import type { NetworkGetModel } from "@threefold/grid_client";
import { get } from "svelte/store";

import type { IProfile } from "../types/Profile";
import getGrid from "./getGrid";

export default async function getWireguardConfig(network: NetworkGetModel) {
  try {
    const profile = get(window.configs.baseConfig);
    if (!profile) return;
    const client = await getGrid(profile as unknown as IProfile, c => c, "");

    const wireguard = await client.networks.getWireGuardConfigs({ name: network.name });
    return wireguard;
  } catch (error) {
    console.log("error", error);
  }
}
