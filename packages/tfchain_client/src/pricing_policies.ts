import { QueryClient } from "./client";

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

class QueryPricingPolicies {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(id: number): Promise<PricingPolicy> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.tfgridModule.pricingPolicies, [id]);
    return res.toPrimitive();
  }
}

export { QueryPricingPolicies, PricingPolicy };
