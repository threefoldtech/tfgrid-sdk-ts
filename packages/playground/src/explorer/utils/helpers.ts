import GridProxyClient, {
  CertificationType,
  type GridNode,
  type NodesQuery,
  NodeStatus,
} from "@threefold/gridproxy_client";

import { isNumeric } from "../../utils/validators";
import type { FilterInputs, MixedFilter } from "./types";

export function requestNodes(options: Partial<NodesQuery>, loadFarm?: boolean) {
  const network = process.env.NETWORK || (window as any).env.NETWORK;
  const client = new GridProxyClient(network);
  return client.nodes.list(options, { loadFarm: loadFarm });
}

export function getNode(nodeId: number) {
  const network = process.env.NETWORK || (window as any).env.NETWORK;
  const client = new GridProxyClient(network);
  return client.nodes.byId(nodeId);
}

export const toBytes = (resource: number | undefined): number => {
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
    freeHru: toBytes(+mixedFilters.inputs.freeHru.value!),
    freeMru: toBytes(+mixedFilters.inputs.freeMru.value!),
    freeSru: toBytes(+mixedFilters.inputs.freeSru.value!),
    hasGpu: mixedFilters.options.gpu,
  };
  if (mixedFilters.options.gateway) {
    options.domain = mixedFilters.options.gateway;
    options.ipv4 = mixedFilters.options.gateway;
  }
  return options;
};

export const inputsInitializer: FilterInputs = {
  nodeId: {
    label: "Node ID",
    placeholder: "Filter by node id.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  farmIds: {
    label: "Farm IDs",
    placeholder: "e.g. 1, 2, 3",
    rules: [
      [
        isNumeric("This field accepts numbers only.", { no_symbols: true }),
        (value: string) => {
          const ids = value.split(",").map((id: string) => {
            if (isNaN(+id)) {
              return isNumeric("This field accepts numbers only.", { no_symbols: true });
            } else {
              return isNumeric("This field accepts numbers only.", { no_symbols: true });
            }
          });
          console.log(ids);
        },
      ],
    ],
    type: "text",
  },
  farmName: {
    label: "Farm Name",
    placeholder: "Filter by farm name.",
    type: "text",
  },
  country: {
    label: "Country Full Name",
    placeholder: "Filter by country.",
    type: "text",
  },
  freeSru: {
    label: "Free SRU (GB)",
    placeholder: "Filter by Free SSD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeHru: {
    label: "Free HRU (GB)",
    placeholder: "Filter by Free HDD greater than or equal to.",
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
  freeMru: {
    label: "Free MRU (GB)",
    placeholder: "Filter by Free Memory greater than or equal to.",
    value: undefined,
    rules: [[isNumeric("This field accepts numbers only.", { no_symbols: true })]],
    type: "text",
  },
};

export const nodeInitializer: GridNode = {
  id: "",
  nodeId: 0,
  farmId: 0,
  twinId: 0,
  country: "",
  gridVersion: 0,
  city: "",
  uptime: 0,
  created: 0,
  farmingPolicyId: 0,
  updatedAt: 0,
  total_resources: { mru: 0, sru: 0, hru: 0, cru: 0 },
  used_resources: { mru: 0, sru: 0, hru: 0, cru: 0 },
  location: { city: "", country: "" },
  publicConfig: { domain: "", gw4: "", ipv6: "", gw6: "", ipv4: "" },
  status: NodeStatus.Up,
  certificationType: CertificationType.Diy,
  dedicated: false,
  rentContractId: 0,
  rentedByTwinId: 0,
  farm: {
    certificationType: CertificationType.Diy,
    dedicated: false,
    farmId: 0,
    name: "",
    pricingPolicyId: 0,
    publicIps: [],
    twinId: 0,
    stellarAddress: "",
  },
  publicIps: { free: 0, total: 0, used: 0 },
};
