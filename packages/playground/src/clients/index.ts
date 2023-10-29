import GridProxyClient, { Network } from "@threefold/gridproxy_client";
import TFGridGqlClient, { Networks } from "tfgrid-gql";

const network = process.env.NETWORK || window.env.NETWORK;

const gqlClient = new TFGridGqlClient(network as Networks);
const gridProxyClient = new GridProxyClient(network as Network);

export { gqlClient, gridProxyClient };
