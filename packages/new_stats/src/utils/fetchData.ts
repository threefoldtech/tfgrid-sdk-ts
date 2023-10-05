import GridProxyClient, { Network, NodeStatus } from "@threefold/gridproxy_client";

import type { NetworkStats } from "@/types";

/**
 * Retrieves statistics for a specific network using the provided GridProxyClient.
 *
 * @param {GridProxyClient} client - The GridProxyClient instance for the network.
 *
 * @returns {Promise<StatsResponse>} A promise that resolves to an object containing statistics data.
 *
 * @throws {Error} If there is an issue with the network connection or the request.
 */
async function getStats(client: GridProxyClient) {
  try {
    return await client.stats.get({ status: NodeStatus.Up });
  } catch (error) {
    throw new Error(`Failed to retrieve statistics on ${client.uri}: ${error}`);
  }
}

/**
 * Retrieves statistics for multiple networks.
 *
 * @param {Network[]} networks - An array of network types for which to retrieve statistics.
 *
 * @returns {Promise<NetworkStats>} A promise that resolves to an object containing statistics data for the specified networks.
 *
 * @throws {Error} If there is an issue with the network connection or the request for any of the specified networks.
 */
async function networkStats(networks: Network[]): Promise<NetworkStats> {
  const res: NetworkStats = {};

  if (networks.includes(Network.Dev)) {
    res[Network.Dev] = await getStats(new GridProxyClient(Network.Dev));
  }

  if (networks.includes(Network.Test)) {
    res[Network.Test] = await getStats(new GridProxyClient(Network.Test));
  }

  if (networks.includes(Network.Main)) {
    res[Network.Main] = await getStats(new GridProxyClient(Network.Main));
  }

  return res;
}

export async function fetchStats(networks: Network[]) {
  let retryCount = 0;
  const fetchDataWithRetry = async (): Promise<NetworkStats> => {
    try {
      return await networkStats(networks);
    } catch (error) {
      if (retryCount < 3) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchDataWithRetry();
      } else {
        throw new Error(`Failed to fetch data after three tries: ${error}`);
      }
    }
  };
  return fetchDataWithRetry();
}
