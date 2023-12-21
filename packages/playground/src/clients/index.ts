import TFGridGqlClient, { Networks } from "@threefold/graphql_client";
import GridProxyClient, { Network } from "@threefold/gridproxy_client";

export const network = process.env.NETWORK || window.env.NETWORK;

const gqlClient = new TFGridGqlClient(network as Networks, window.env.GRAPHQL_URL);
const gridProxyClient = new GridProxyClient(network as Network, window.env.GRIDPROXY_URL);

export { gqlClient, gridProxyClient };
