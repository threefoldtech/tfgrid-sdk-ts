import type { NodesQuery } from "tf_gridproxy_client";

import { gridProxyClient } from "@/clients";

import type { MixedFilter } from "./types";

export async function requestNodes(options: Partial<NodesQuery>) {
  const { count, data } = await gridProxyClient.nodes.list(options);
  return { count, data };
}

export const multiplyResource1024 = (resource: number | undefined): number => {
  return resource ? resource * 1024 * 1024 * 1024 : 0;
};

export const getFilterValues = (mixedFilters: MixedFilter): Partial<NodesQuery> => {
  const options: Partial<NodesQuery> = {
    retCount: true,
    nodeId: +mixedFilters.inputs.nodeId.value! || undefined,
    farmIds: mixedFilters.inputs.farmIds.value,
    farmName: mixedFilters.inputs.farmName.value,
    country: mixedFilters.inputs.country.value,
    status: mixedFilters.options.status,
    page: mixedFilters.options.page,
    size: mixedFilters.options.size,
    freeHru: multiplyResource1024(+mixedFilters.inputs.freeHru.value!),
    freeMru: multiplyResource1024(+mixedFilters.inputs.freeMru.value!),
    freeSru: multiplyResource1024(+mixedFilters.inputs.freeSru.value!),
  };
  return options;
};
