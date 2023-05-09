import { QueryClient } from "./client";
import { PublicIp } from "./types";
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

export { QueryFarms, Farm, Certification, FarmingPolicyLimits };
