import * as PATH from "path";

import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { NetworkHL } from "../high_level/network";
import { BaseModule } from "./base";
import { NetworkAddNodeModel, NetworkGetModel, NetworkHasNodeModel } from "./models";
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
      options.mycelium,
      options.description,
      "",
      [{ nodeId: options.nodeId, seed: options.myceliumSeed! }],
    );
    return { contracts: await this.twinDeploymentHandler.handle(twinDeployments) };
  }

  @expose
  async list(): Promise<string[]> {
    return await this._list();
  }

  @expose
  @validateInput
  async hasNode(options: NetworkHasNodeModel): Promise<boolean> {
    return await this.network.hasNode(options.name, options.ipRange, options.nodeId);
  }

  @expose
  @validateInput
  async getWireGuardConfigs(options: NetworkGetModel) {
    return await this.network.getWireguardConfigs(options.name, options.ipRange);
  }
}

export { NetworkModule as networks };
