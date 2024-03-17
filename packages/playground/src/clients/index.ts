import TFGridGqlClient from "@threefold/graphql_client";
import GridProxyClient from "@threefold/gridproxy_client";
import { QueryClient } from "@threefold/tfchain_client";

const network = process.env.NETWORK || window.env.NETWORK;

const gqlClient = new TFGridGqlClient(window.env.GRAPHQL_URL);
const gridProxyClient = new GridProxyClient(window.env.GRIDPROXY_URL);
const queryClient = new QueryClient(window.env.SUBSTRATE_URL);

export { gqlClient, gridProxyClient, queryClient };
export * from "./indexedDB";
