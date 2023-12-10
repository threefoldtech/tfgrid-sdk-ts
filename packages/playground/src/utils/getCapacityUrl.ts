import { NetworkEnv } from "@threefold/grid_client";

export function getCapacityURL(network: NetworkEnv) {
  if (network === NetworkEnv.main) {
    return "https://newstats.grid.tf/";
  }
  return `https://newstats.${network}.grid.tf/`;
}
