import TFGridGqlClient, { Networks } from "@threefold/graphql_client";
import GridProxyClient, { Network } from "@threefold/gridproxy_client";

const network = process.env.NETWORK || window.env.NETWORK;

const gqlClient = new TFGridGqlClient(network as Networks);
const gridProxyClient = new GridProxyClient(network as Network);

export { gqlClient, gridProxyClient };
