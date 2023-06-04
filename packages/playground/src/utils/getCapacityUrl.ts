import { NetworkEnv } from "@threefold/grid_client";

const network = process.env.NETWORK || (window as any).env.NETWORK;

const getCapacityURL = (network: NetworkEnv) => {
  if (network === NetworkEnv.main) {
    return "https://dashboard.grid.tf/explorer/statistics";
  }
  return `https://dashboard.${network}.grid.tf/explorer/statistics`;
};

const capacityURL = getCapacityURL(network);

export default capacityURL;
