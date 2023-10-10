import * as PATH from "path";

import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { NetworkHL } from "../high_level/network";
import { BaseModule } from "./base";
import { NetworkAddNodeModel, NetworkGetModel } from "./models";
import { checkBalance } from "./utils";

class NetworkModule extends BaseModule {
  moduleName = "networks";
  network: NetworkHL;

  constructor(public config: GridClientConfig) {
    super(config);
    this.network = new NetworkHL(config);
  }

  @expose
  @validateInput
  @checkBalance
  async addNode(options: NetworkAddNodeModel) {
    const twinDeployments = await this.network.addNode(
      options.name,
      options.ipRange,
      options.nodeId,
      options.solutionProviderId!,
      options.description,
    );
    return { contracts: await this.twinDeploymentHandler.handle(twinDeployments) };
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
