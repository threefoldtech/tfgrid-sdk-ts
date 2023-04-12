import { TFClient } from "./client";

interface PricingPolicy {
    version: string;
    id: string;
    name: string;
    su: { value: string; unit: string };
    cu: { value: string; unit: string };
    nu: { value: string; unit: string };
    ipu: { value: string; unit: string };
    uniqueName: { value: string; unit: string };
    domainName: { value: string; unit: string };
    foundationAccount: string;
    certifiedSalesAccount: string;
    discountForDedicationNodes: string;
}
class PricingPolicy {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async getPricingPolicyById(id: number): Promise<PricingPolicy> {
        return this.tfclient.queryChain(this.tfclient.client.getPricingPolicyById, [id]);
    }
}

export { PricingPolicy };
