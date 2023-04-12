import { TFClient } from "./client";

class TFTPrice {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    async getPrice(): Promise<number> {
        const priceInMili = await this.tfclient.queryChain(this.tfclient.client.tftPrice, []);
        return priceInMili / 1000;
    }
}

export { TFTPrice };
