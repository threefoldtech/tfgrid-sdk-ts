import * as PATH from "path";

import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { BaseModule } from "./base";
import { NetworkGetModel } from "./models";

class NetworkModule extends BaseModule {
    moduleName = "networks";

    constructor(public config: GridClientConfig) {
        super(config);
    }

    @expose
    async list(): Promise<string[]> {
        return await this._list();
    }

    @expose
    @validateInput
    async getWireGuardConfigs(options: NetworkGetModel) {
        const path = PATH.join(this.getDeploymentPath(options.name), "info.json");
        const networkInfo = await this.backendStorage.load(path);
        return networkInfo["wireguardConfigs"];
    }
}

export { NetworkModule as networks };
