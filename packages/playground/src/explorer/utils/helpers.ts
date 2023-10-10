import type { Farm, Pagination } from "@threefold/gridproxy_client";

import { gridProxyClient } from "@/clients";
export async function getFarms(): Promise<Pagination<Farm[]>> {
  try {
    const farms = await gridProxyClient.farms.list();
    return farms;
  } catch (error) {
    console.error("An error occurred while requesting farms:", error);
    throw error;
  }
}
