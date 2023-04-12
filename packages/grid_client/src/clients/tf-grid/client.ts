import AwaitLock from "await-lock";
import { default as Client } from "tfgrid-api-client";

import { KeypairType } from "../../zos/deployment";
import { Balance } from "./balance";
import { Contracts } from "./contracts";
import { ErrorsMap } from "./errors";
import { Farms } from "./farms";
import { KVStore } from "./kvstore";
import { NodePower } from "./nodePower";
import { PricingPolicy } from "./pricingPolicy";
import { TermsAndConditions } from "./terms";
import { TFTPrice } from "./tftPrice";
import { Twins } from "./twins";
import { Utility } from "./utility";

class TFClient {
    static clients: Record<string, TFClient> = {};
    static lock: AwaitLock = new AwaitLock();
    client;
    terms: TermsAndConditions;
    contracts: Contracts;
    twins: Twins;
    kvStore: KVStore;
    balance: Balance;
    tftPrice: TFTPrice;
    pricingPolcy: PricingPolicy;
    utility: Utility;
    nodePower: NodePower;
    farms: Farms;
    connectingLock = new AwaitLock();

    constructor(
        public url: string,
        public mnemonic: string,
        public storeSecret: string | Uint8Array,
        public keypairType: KeypairType = KeypairType.sr25519,
    ) {
        this.__connectHandler = this.__connectHandler.bind(this);

        if (!storeSecret) {
            throw new Error("Couldn't create TFClient without store secret");
        }
        const key = `${url}:${mnemonic}:${keypairType}:${storeSecret}`;
        if (Object.keys(TFClient.clients).includes(key)) {
            return TFClient.clients[key];
        }
        this.client = new Client(url, mnemonic, keypairType);
        this.contracts = new Contracts(this);
        this.twins = new Twins(this);
        this.kvStore = new KVStore(this);
        this.balance = new Balance(this);
        this.tftPrice = new TFTPrice(this);
        this.pricingPolcy = new PricingPolicy(this);
        this.terms = new TermsAndConditions(this);
        this.utility = new Utility(this);
        this.nodePower = new NodePower(this);
        this.farms = new Farms(this);
        TFClient.clients[key] = this;
    }

    private async __connectHandler() {
        await this.client.api.connect();
    }

    async connect(): Promise<void> {
        await this.connectingLock.acquireAsync();
        if (!this.isConnected()) {
            await this.client.init();
            this.client.api.on("disconnected", this.__connectHandler);
        }
        this.connectingLock.release();
    }

    async disconnect(): Promise<void> {
        if (this.isConnected()) {
            console.log("disconnecting");
            this.client.api.off("disconnected", this.__connectHandler);
            await this.client.api.disconnect();
        }
    }

    isConnected(): boolean {
        if (this.client.api) {
            return this.client.api.isConnected;
        }
        return false;
    }

    async _polkaMethodsWrapper(func: (args: unknown[]) => unknown, args: unknown[]) {
        const context = this.client;
        await this.connect();
        console.log(`Executing method: ${func.name} with args: ${args}`);
        return await func.apply(context, args);
    }

    async queryChain(func: (args: unknown[]) => unknown, args: unknown[]) {
        return await this._polkaMethodsWrapper(func, args);
    }

    async rpcCall(func: (args: unknown[]) => unknown, args: unknown[]) {
        return await this._polkaMethodsWrapper(func, args);
    }

    private async _applyExtrinsic(
        func: (args: unknown[]) => unknown,
        args: unknown[],
        resultSection: string,
        resultNames: string[],
    ) {
        const context = this.client;
        await this.connect();

        return new Promise(async (resolve, reject) => {
            function callback(res) {
                if (res instanceof Error) {
                    console.error(res);
                    reject(res);
                }
                const { events = [], status } = res;
                if (status.isFinalized) {
                    events.forEach(({ phase, event: { data, method, section } }) => {
                        console.log(`phase: ${phase}, section: ${section}, method: ${method}`);
                        if (section === "system" && method === "ExtrinsicFailed") {
                            const errorIndex = parseInt(data.toJSON()[0].module.error.replace(/0+$/g, ""));
                            const errorType = ErrorsMap[resultSection][errorIndex];
                            reject(
                                `Failed to apply ${func.name} in module ${resultSection} with ${args.slice(
                                    0,
                                    -1,
                                )} due to error: ${errorType}`,
                            );
                        } else if (section === resultSection && resultNames.includes(method)) {
                            resolve(data.toJSON()[0]);
                        }
                    });
                }
            }
            try {
                args.push(callback);
                await func.apply(context, args);
            } catch (e) {
                reject(e);
            }
        });
    }

    async applyExtrinsic(
        func: (args: unknown[]) => unknown,
        args: unknown[],
        resultSection: string,
        resultNames: string[],
    ) {
        await TFClient.lock.acquireAsync();
        console.log("Lock acquired");
        let result;
        try {
            result = await this._applyExtrinsic(func, args, resultSection, resultNames);
        } finally {
            TFClient.lock.release();
            console.log("Lock released");
        }
        return result;
    }
}
export { TFClient };
