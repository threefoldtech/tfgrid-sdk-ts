import { Client as RMBClient } from "@threefold/rmb_direct_client";

import { BackendStorageType } from "./storage/backend";
import BackendStorageInterface from "./storage/BackendStorageInterface";
import { KeypairType } from "./zos/deployment";

enum NetworkEnv {
    dev = "dev",
    test = "test",
    main = "main",
    qa = "qa",
    custom = "custom",
}

class GridClientConfig {
    network: NetworkEnv;
    mnemonic: string;
    storeSecret: string | Uint8Array;
    rmbClient: RMBClient;
    projectName: string;
    backendStorageType: BackendStorageType;
    backendStorage: BackendStorageInterface;
    keypairType: KeypairType;
    storePath: string;
    graphqlURL: string;
    proxyURL: string;
    substrateURL: string;
    activationURL: string;
    twinId: number;
    seed: string;
    deploymentTimeoutMinutes: number;
}
class ClientOptions {
    constructor(
        public mnemonic: string,
        public network: NetworkEnv,
        public storeSecret?: string,
        public projectName?: string,
        public backendStorageType?: BackendStorageType,
        public keypairType?: KeypairType,
        public backendStorage?: BackendStorageInterface,
        public seed?: string,
        public proxyURL?: string,
        public graphqlURL?: string,
        public substrateURL?: string,
        public relayURL?: string,
        public activationURL?: string,
        public deploymentTimeoutMinutes?: number,
    ) {}
}

export { GridClientConfig, NetworkEnv, ClientOptions };
