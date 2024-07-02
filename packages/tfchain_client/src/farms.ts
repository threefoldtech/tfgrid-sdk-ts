import { Client, QueryClient } from "./client";
import type { ExtrinsicResult } from "./types";
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

  /**
   * Retrieves information about a farm based on the provided options.
   *
   * @param options - The options to specify which farm to retrieve.
   * @returns A Promise that resolves to the farm information.
   */
  @checkConnection
  async get(options: QueryFarmsGetOptions): Promise<Farm> {
    const res = await this.client.api.query.tfgridModule.farms(options.id);
    return res.toPrimitive() as unknown as Farm;
  }
}

class Farms extends QueryFarms {
  /**
   * Represents a class that provides methods for interacting with farms.
   * Inherits from QueryFarms class.
   *
   * @class Farms
   */
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  /**
   * Create a new farm.
   *
   * @param options - The options for creating a new farm.
   * @param options.name - The name of the new farm.
   * @param options.publicIps - Optional array of public IPs for the new farm.
   * @returns A promise that resolves to the created farm object.
   */
  @checkConnection
  async create(options: CreateFarmOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.createFarm(options.name, options.publicIps);
    return this.client.patchExtrinsic<Farm>(extrinsic);
  }

  /**
   * Add a public IP to a farm.
   *
   * @param options - The options for adding a public IP to a farm.
   * @param options.farmId - The ID of the farm to add the public IP to.
   * @param options.ip - The IP address to add to the farm.
   * @param options.gw - The gateway for the IP address.
   * @returns A promise that resolves to the updated farm object after adding the public IP.
   */
  @checkConnection
  async addFarmIp(options: AddFarmIPOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.addFarmIp(options.farmId, options.ip, options.gw);
    return this.client.patchExtrinsic<Farm>(extrinsic);
  }

  /**
   * Remove a public IP from a farm.
   *
   * @param options - The options for removing a public IP from a farm.
   * @param options.farmId - The ID of the farm from which to remove the public IP.
   * @param options.ip - The IP address to remove from the farm.
   * @returns A promise that resolves to the updated farm object after removing the public IP.
   */
  @checkConnection
  async removeFarmIp(options: RemoveFarmIPOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.removeFarmIp(options.farmId, options.ip);
    return this.client.patchExtrinsic<Farm>(extrinsic);
  }

  /**
   * Add a Stellar address for payout to a farm.
   *
   * @param options - The options for adding a Stellar address.
   * @param options.farmId - The ID of the farm to add the Stellar address to.
   * @param options.stellarAddress - The Stellar address to add for payout.
   * @returns A promise that resolves to the updated farm object after adding the Stellar address.
   */
  @checkConnection
  async addStellarAddress(options: AddStellarOptions) {
    const extrinsic = this.client.api.tx.tfgridModule.addStellarPayoutV2address(options.farmId, options.stellarAddress);
    return this.client.patchExtrinsic<Farm>(extrinsic);
  }
}

export { QueryFarms, Farms, Farm, Certification, FarmingPolicyLimits };
