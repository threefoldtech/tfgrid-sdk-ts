import { assertBoolean, assertId, assertIn, assertInt, assertNatural, assertPattern, assertString } from "../utils";
import { AbstractBuilder, BuilderMapper, BuilderMethods, BuilderValidator } from "./abstract_builder";
import { ID_PATTERN, NodeStatus } from "./gateways";

export interface NodesQuery {
  page: number;
  size: number;
  retCount: boolean;
  freeMru: number;
  freeHru: number;
  freeSru: number;
  totalMru: number;
  totalCru: number;
  totalSru: number;
  totalHru: number;
  freeIps: number;
  status: NodeStatus;
  city: string;
  country: string;
  farmName: string;
  ipv4: boolean;
  ipv6: boolean;
  domain: boolean;
  dedicated: boolean;
  rentable: boolean;
  rented: boolean;
  rentedBy: number;
  availableFor: number;
  farmIds: string;
  nodeId: number;
  certificationType: "NotCertified" | "Silver" | "Gold";
  hasGpu: boolean;
  gpuDeviceId: string;
  gpuDeviceName: string;
  gpuVendorId: string;
  gpuVendorName: string;
  gpuAvailable: boolean;
}

const NODES_MAPPER: BuilderMapper<NodesQuery> = {
  page: "page",
  size: "size",
  retCount: "ret_count",
  freeMru: "free_mru",
  freeHru: "free_hru",
  freeSru: "free_sru",
  freeIps: "free_ips",
  status: "status",
  city: "city",
  country: "country",
  farmName: "farm_name",
  domain: "domain",
  ipv4: "ipv4",
  ipv6: "ipv6",
  dedicated: "dedicated",
  rentable: "rentable",
  rented: "rented",
  rentedBy: "rented_by",
  availableFor: "available_for",
  farmIds: "farm_ids",
  nodeId: "node_id",
  certificationType: "certification_type",
  gpuAvailable: "gpu_available",
  gpuDeviceId: "gpu_device_id",
  gpuDeviceName: "gpu_device_name",
  gpuVendorId: "gpu_vendor_id",
  gpuVendorName: "gpu_vendor_name",
  hasGpu: "has_gpu",
  totalCru: "total_cru",
  totalHru: "total_hru",
  totalMru: "total_mru",
  totalSru: "total_sru",
};

const NODES_VALIDATOR: BuilderValidator<NodesQuery> = {
  page: assertNatural,
  size: assertNatural,
  retCount: assertBoolean,
  freeMru: assertNatural,
  freeHru: assertNatural,
  freeSru: assertNatural,
  freeIps: assertNatural,
  status(value) {
    assertIn(value, [NodeStatus.Up, NodeStatus.Down, NodeStatus.Standby]);
  },
  city: assertString,
  country: assertString,
  farmName: assertString,
  domain: assertBoolean,
  ipv4: assertBoolean,
  ipv6: assertBoolean,
  dedicated: assertBoolean,
  rentable: assertBoolean,
  rented: assertBoolean,
  rentedBy: assertId,
  availableFor: assertId,
  farmIds(value) {
    value.split(",").forEach(id => {
      assertPattern(id, ID_PATTERN);
      assertId(+id);
    });
  },
  nodeId: assertId,
  certificationType(value) {
    assertIn(value, ["NotCertified", "Silver", "Gold"]);
  },
  gpuAvailable: assertBoolean,
  gpuDeviceId: assertString,
  gpuDeviceName: assertString,
  gpuVendorId: assertString,
  gpuVendorName: assertString,
  hasGpu: assertBoolean,
  totalCru: assertInt,
  totalHru: assertInt,
  totalMru: assertInt,
  totalSru: assertInt,
};

export class NodesBuilder extends AbstractBuilder<NodesQuery> {
  constructor(public uri: string, queries: Partial<NodesQuery> = {}) {
    super({
      mapper: NODES_MAPPER,
      validator: NODES_VALIDATOR,
      queries,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NodesBuilder extends BuilderMethods<NodesQuery, NodesBuilder> {}
