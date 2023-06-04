import { NetworkEnv } from "@threefold/grid_client";

export function getCapacityURL(network: NetworkEnv) {
  if (network === NetworkEnv.main) {
    return "https://dashboard.grid.tf/explorer/statistics";
  }
  return `https://dashboard.${network}.grid.tf/explorer/statistics`;
}
