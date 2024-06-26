import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { DeploymentResultContracts } from "../high_level";
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

  /**
   * Adds a node to a network.
   *
   * This method is responsible for adding a node to a specified network using the provided options.
   * It validates the input options, checks the balance, and then proceeds to add the node to the network.
   * If the node is added successfully, it returns a promise that resolves to the deployment result contracts.
   *
   * @param {NetworkAddNodeModel} options - The options for adding the node to the network.
   *   - `name` (string): The name of the network.
   *   - `ipRange` (string): The IP range for the network.
   *   - `nodeId` (number): The ID of the node to be added.
   *   - `solutionProviderId` (number | undefined): The ID of the solution provider (optional).
   *   - `mycelium` (boolean): Indicates whether mycelium is used.
   *   - `description` (string | undefined): The description of the node (optional).
   *   - `myceliumSeed` (string | undefined): The seed for mycelium (optional).
   *
   * @returns {Promise<BaseModuleTypes["networks"]["addNode"]>} A promise that resolves to an object containing the deployment result contracts.
   *
   * @example
   * const nodeOptions: NetworkAddNodeModel = {
   *   name: "exampleNetwork",
   *   ipRange: "10.0.0.0/16",
   *   nodeId: 123,
   *   solutionProviderId: 1,
   *   mycelium: true,
   *   description: "Example node",
   *   myceliumSeed: "seed123",
   * };
   * const result = await networkModule.addNode(nodeOptions);
   * console.log(result.contracts);
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async addNode(options: NetworkAddNodeModel): Promise<{ contracts: DeploymentResultContracts }> {
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

  /**
   * Retrieves a list of network names.
   *
   * This method exposes the functionality to retrieve a list of all network names associated with the current configuration.
   * It simply calls the internal `_list` method to perform the actual retrieval.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of network names.
   *
   * @example
   * const networkNames = await networkModule.list();
   * console.log(networkNames);
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   */
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
