import { NodeStatus } from "@threefold/gridproxy_client";

import { gqlClient, gridProxyClient } from "../clients";
import type { Locations } from "../types/nodeSelector";

export async function getLocations(): Promise<Locations> {
  const countries = await gqlClient.countries({ name: true, subregion: true });
  const stats = await gridProxyClient.stats.get({ status: NodeStatus.Up });
  const allowedCountriesList = Object.keys(stats.nodesDistribution);

  const locations: Locations = {};
  for (const country of countries) {
    if (allowedCountriesList.includes(country.name)) {
      locations[country.subregion] = locations[country.subregion] || [];
      locations[country.subregion].push(country.name);
    }
  }
  return locations;
}
