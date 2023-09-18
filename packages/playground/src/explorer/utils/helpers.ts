import type { NodesQuery } from "tf_gridproxy_client";

import { gridProxyClient } from "@/clients";

export async function requestNodes(options?: Partial<NodesQuery>) {
  const { count, data } = await gridProxyClient.nodes.list(options ? options : {});
  return { count, data };
}
