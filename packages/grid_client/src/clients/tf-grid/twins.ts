import * as secp from "@noble/secp256k1";
import * as bip39 from "bip39";

import { TFClient } from "./client";

class Twins {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }

    getPublicKey(mnemonic: string) {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const privKey = new Uint8Array(seed).slice(0, 32);
        const pk = Buffer.from(secp.getPublicKey(privKey, true)).toString("hex");
        return pk;
    }

    async create(relay: string) {
        const pk = this.getPublicKey(this.tfclient.mnemonic);

        return this.tfclient.applyExtrinsic(this.tfclient.client.createTwin, [relay, pk], "tfgridModule", [
            "TwinStored",
        ]);
    }

    async update(relay: string) {
        const pk = this.getPublicKey(this.tfclient.mnemonic);

        return this.tfclient.applyExtrinsic(this.tfclient.client.updateTwin, [relay, pk], "tfgridModule", [
            "TwinUpdated",
        ]);
    }

    async get(id: number) {
        return await this.tfclient.queryChain(this.tfclient.client.getTwinByID, [id]);
    }

    async getMyTwinId(): Promise<number> {
        await this.tfclient.connect();
        const pubKey = this.tfclient.client.address;
        return this.getTwinIdByAccountId(pubKey);
    }

    async getTwinIdByAccountId(publicKey: string): Promise<number> {
        return await this.tfclient.queryChain(this.tfclient.client.getTwinIdByAccountId, [publicKey]);
    }

    async list() {
        return await this.tfclient.queryChain(this.tfclient.client.listTwins, []);
    }

    async delete(id: number) {
        return this.tfclient.applyExtrinsic(this.tfclient.client.deleteTwin, [id], "tfgridModule", ["TwinDeleted"]);
    }
}

export { Twins };
