import type { Farm, Pagination, Twin } from "@threefold/gridproxy_client";

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

export async function getTwins(): Promise<Pagination<Twin[]>> {
  try {
    const twins: Pagination<Twin[]> = await gridProxyClient.twins.list();
    return JSON.parse(JSON.stringify(twins));
  } catch (error) {
    console.error("An error occurred while requesting twins:", error);
    throw error;
  }
}
