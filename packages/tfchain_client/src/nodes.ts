import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

export interface SetPowerOptions {
  nodeId: number;
  power: boolean;
}

export interface Node {
  id: number;
  farmId: number;
  twinId: number;
  resources: NodeResources;
  location: NodeLocation;
  publicConfig: PublicConfig;
  created: number;
  farmingPolicyId: number;
  interfaces: NetworkInterfaceType[];
  certification: string;
  secureBoot: boolean;
  virtualized: boolean;
  serialNumber: string;
  connectionPrice: number;
}

interface NetworkInterfaceType {
  name: string;
  mac: string;
  ips: string[];
}

interface IPConfigInterface {
  ip: string;
  gw: string;
}
interface PublicConfig {
  ip4: IPConfigInterface;
  ip6: IPConfigInterface;
  domain: string;
}

interface NodeResources {
  hru: number;
  sru: number;
  cru: number;
  mru: number;
}

interface NodeLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface QueryNodesGetOptions {
  id: number;
}

class QueryNodes {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryNodesGetOptions): Promise<Node> {
    if (isNaN(options.id) || options.id <= 0) {
      throw Error("Invalid node id. Node id must be positive integer");
    }
    const res = await this.client.api.query.tfgridModule.nodes(options.id);
    return res.toPrimitive() as unknown as Node;
  }
}

class Nodes extends QueryNodes {
  constructor(public client: Client) {
    super(client);
  }

  @checkConnection
  async setPower(options: SetPowerOptions) {
    let powerTarget: { up?: boolean; down?: boolean };
    if (options.power) {
      powerTarget = {
        up: options.power,
      };
    } else {
      powerTarget = {
        down: !options.power,
      };
    }

    const extrinsic = await this.client.api.tx.tfgridModule.changePowerTarget(options.nodeId, powerTarget);
    return this.client.patchExtrinsic<void>(extrinsic);
  }
}

export { Nodes, QueryNodes };
