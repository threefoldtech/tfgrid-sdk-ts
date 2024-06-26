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

  /**
   * The `NetworkModule` class provides methods to interact with network operations.
   *
   * Initializes a new instance of the `NetworkModule` class.
   *
   * @param {GridClientConfig} config - The grid client configuration.
   */
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
   * This method exposes the functionality to retrieve a list of all network names associated with the current account.
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

  /**
   * Checks if a node exists in the network based on the specified options.
   *
   * This method validates the input options and checks if a node with the specified network name, IP range, and node ID
   * exists within the network associated with the current configuration.
   *
   * @param {NetworkHasNodeModel} options - The options for checking if the node exists.
   *   - `name` (string): The name of the network.
   *   - `ipRange` (string): The IP range of the network.
   *   - `nodeId` (number): The ID of the node to check.
   *
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the node exists in the network.
   *
   * @example
   * const options = {
   *   name: "exampleNetwork",
   *   ipRange: "10.0.0.0/16",
   *   nodeId: 123
   * };
   * const doesNodeExist = await networkModule.hasNode(options);
   * console.log(doesNodeExist); // true or false
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async hasNode(options: NetworkHasNodeModel): Promise<boolean> {
    return await this.network.hasNode(options.name, options.ipRange, options.nodeId);
  }

  /**
   * Retrieves WireGuard configurations for a network based on the specified options.
   *
   * This method validates the input options and retrieves the WireGuard configurations
   * for the specified network name and IP range.
   *
   * @param {NetworkGetModel} options - The options for retrieving WireGuard configurations.
   *   - `name` (string): The name of the network.
   *   - `ipRange` (string): The IP range of the network.
   *
   * @returns {Promise<string[]>} A promise that resolves to an array of WireGuard configuration strings.
   *
   * @example
   * const options = {
   *   name: "exampleNetwork",
   *   ipRange: "10.0.0.0/16"
   * };
   * const wireGuardConfigs = await networkModule.getWireGuardConfigs(options);
   * console.log(wireGuardConfigs); // ["config1", "config2", ...]
   *
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getWireGuardConfigs(options: NetworkGetModel): Promise<string[]> {
    return await this.network.getWireguardConfigs(options.name, options.ipRange);
  }
}

export { NetworkModule as networks };
