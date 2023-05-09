import { QueryClient } from "./client";
import { checkConnection } from "./utils";

interface Resource {
  value: number;
  unit: string;
}

interface PricingPolicy {
  version: number;
  id: number;
  name: string;
  su: Resource;
  cu: Resource;
  nu: Resource;
  ipu: Resource;
  uniqueName: Resource;
  domainName: Resource;
  foundationAccount: string;
  certifiedSalesAccount: string;
  discountForDedicationNodes: number;
}

interface QueryPricingGetOptions {
  id: number;
}

class QueryPricingPolicies {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryPricingGetOptions): Promise<PricingPolicy> {
    const res = await this.client.api.query.tfgridModule.pricingPolicies(options.id);
    return res.toPrimitive() as unknown as PricingPolicy;
  }
}

export { QueryPricingPolicies, PricingPolicy, Resource };
