import type { Farm } from "@threefold/gridproxy_client";

import { gridProxyClient } from "@/clients";
export async function getFarms(): Promise<Farm[]> {
  try {
    const farms = await gridProxyClient.farms.listAll();
    return farms;
  } catch (error) {
    console.error("An error occurred while requesting farms:", error);
    throw error;
  }
}
