import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

enum Certification {
  Certified = "Certified",
  NotCertified = "NotCertified",
}

interface FarmingPolicyLimits {
  farmingPolicyId: number;
  cu: number;
  su: number;
  end: number;
  nodeCount: number;
  nodeCertification: boolean;
}

interface Farm {
  version: number;
  id: number;
  name: string;
  twinId: number;
  pricingPolicyId: number;
  certification: Certification;
  publicIps: PublicIp[];
  dedicatedFarm: boolean;
  farmingPolicyLimits: FarmingPolicyLimits;
}

interface QueryFarmsGetOptions {
  id: number;
}

interface PublicIp {
  ip: string;
  gw: string;
  contractId?: number;
}

interface CreateFarmOptions {
  name: string;
  publicIps?: PublicIp[];
}
interface AddFarmIPOptions {
  farmId: number;
  ip: string;
  gw: string;
}

interface RemoveFarmIPOptions {
  farmId: number;
  ip: string;
}

interface AddStellarOptions {
  farmId: number;
  stellarAddress: string;
}
class QueryFarms {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryFarmsGetOptions): Promise<Farm> {
    const res = await this.client.api.query.tfgridModule.farms(options.id);
    return res.toPrimitive() as unknown as Farm;
  }
}

class Farms extends QueryFarms {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async create(options: CreateFarmOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.createFarm(options.name, options.publicIps);
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async addFarmIp(options: AddFarmIPOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.addFarmIp(options.farmId, options.ip, options.gw);
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async removeFarmIp(options: RemoveFarmIPOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.removeFarmIp(options.farmId, options.ip);
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async addStellarAddress(options: AddStellarOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.addStellarPayoutV2address(options.farmId, options.stellarAddress);
    return this.client.patchExtrinsic(extrinsic);
  }
}

export { QueryFarms, Farms, Farm, Certification, FarmingPolicyLimits };
