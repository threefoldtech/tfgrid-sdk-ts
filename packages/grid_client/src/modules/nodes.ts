import { Contract, Node as TFChainNode } from "@threefold/tfchain_client";
import { BaseError, GridClientErrors, TFChainError } from "@threefold/types";

import { TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { events, validateInput } from "../helpers";
import { expose } from "../helpers/expose";
import { NodeInfo } from "../primitives";
import { capacity } from "./capacity";
import {
  AddPublicConfig,
  FilterOptions,
  NodeGetModel,
  NodePowerModel,
  RentContractCreateModel,
  RentContractDeleteModel,
  RentContractGetModel,
} from "./models";
import { checkBalance } from "./utils";

class Nodes {
  client: TFClient;
  capacity: capacity;
  /**
   * Class representing operations related to `nodes` management.
   *
   * This class provides methods to interact with `nodes`, including `reserving`, `unreserving`, `getting` `rent contract ID`,
   * `getting node information`, `setting node power`, `adding public configuration` to a node, `listing all nodes`, and `filtering nodes`.
   * It utilizes the `TFClient` and capacity classes for performing these operations.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the Nodes class.
   */
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
    this.capacity = new capacity(config);
  }

  /**
   * Reserves a node by creating a `rent contract`.
   *
   * This method first checks if the node is already rented by calling the `getRentContractId` method.
   * If the node is `available`, it creates a `rent contract` using the provided options.
   *
   * @param {RentContractCreateModel} options - The options for creating the `rent contract`, including the nodeId and optional solutionProviderId.
   * @returns {Promise<Contract>} - A promise that resolves with the created `rent contract` details.
   * @throws {`GridClientErrors.Nodes.UnavailableNodeError`} - If the node is already rented.
   * @throws {`BaseError`} - If an error occurs during the `rent contract` creation process.
   * @throws {`TFChainError`} - If a TFChain error occurs during the `rent contract` creation process.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async reserve(options: RentContractCreateModel): Promise<Contract> {
    const rentContractId = await this.getRentContractId({ nodeId: options.nodeId });
    if (rentContractId) {
      throw new GridClientErrors.Nodes.UnavailableNodeError(`Node is already rented.`);
    }
    try {
      const res = await (await this.client.contracts.createRent(options)).apply();
      events.emit("logs", `Rent contract with id: ${res.contractId} has been created.`);
      return res;
    } catch (e) {
      //TODO Errors should be handled in tfchain
      if (e instanceof BaseError) {
        e.message = `Failed to create rent contract on node ${options.nodeId} due to ${e.message}`;
        throw e;
      }
      throw new TFChainError(`Failed to create rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  /**
   * Unreserves a node by deleting its `rent contract`.
   *
   * This method first retrieves the `rent contract ID` for the specified node by calling the `getRentContractId` method.
   * If a `rent contract` exists, it deletes the `rent contract` associated with the node.
   * If no `rent contract` is found, it emits a log message and returns null.
   *
   * @param {RentContractDeleteModel} options - The options for deleting the `rent contract`, including the nodeId.
   * @returns {Promise<number>} - A promise that resolves with the result of deleting the `rent contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   * @throws {`BaseError`} - If an error occurs during the `rent contract` deletion process.
   * @throws {`TFChainError`} - If a TFChain error occurs during the `rent contract` deletion process.
   */
  @expose
  @validateInput
  @checkBalance
  async unreserve(options: RentContractDeleteModel): Promise<number> {
    const rentContractId = await this.getRentContractId({ nodeId: options.nodeId });
    if (!rentContractId) {
      events.emit("logs", `No rent contract found for node ${options.nodeId}`);
      return rentContractId;
    }
    try {
      const cancel = await this.client.contracts.cancel({ id: rentContractId });
      const res = await cancel!.apply();
      events.emit("logs", `Rent contract for node ${options.nodeId} has been deleted`);
      return res;
    } catch (e) {
      if (e instanceof BaseError) {
        e.message = `Failed to delete rent contract on node ${options.nodeId} due to ${e.message}`;
        throw e;
      }
      throw new TFChainError(`Failed to delete rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  /**
   * Retrieves the `rent contract ID` for a specific node.
   *
   * This method calls the `TFChain client` to get the `contract ID` for an active rent associated with the specified node.
   *
   * @param {RentContractGetModel} options - The options containing the nodeId for which to retrieve the `rent contract ID`.
   * @returns {Promise<number>} - A promise that resolves with the `rent contract ID`.
   * @throws {`TFChainError`} - If an error occurs while retrieving the `rent contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getRentContractId(options: RentContractGetModel): Promise<number> {
    return this.client.contracts
      .getContractIdByActiveRentForNode(options)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new TFChainError(`Error getting rent for node ${options.nodeId}: ${err}`);
      });
  }

  /**
   * Retrieves information about a specific node.
   *
   * This method calls the `TFChain client` to get detailed information about a node based on the provided options.
   *
   * @param {NodeGetModel} options - The options specifying the node ID for which to retrieve information.
   * @returns {Promise<TFChainNode>} - A promise that resolves with the detailed information about the `TFChainNode`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: NodeGetModel): Promise<TFChainNode> {
    return await this.client.nodes.get(options);
  }

  /**
   * Sets the power status of a specific node.
   *
   * This method calls the `TFChain client` to set the power status of a node based on the provided options.
   *
   * @param {NodePowerModel} options - The options specifying the node ID and the desired power status.
   * @returns {Promise<void>} - A promise that resolves once the power status of the node is set.
   * @throws {ValidationError} - If the balance is not enough to apply the power status change.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async setNodePower(options: NodePowerModel): Promise<void> {
    return (await this.client.nodes.setPower(options)).apply();
  }

  /**
   * Adds a public configuration to a node.
   *
   * This method calls the `TFChain client` to add a public configuration to a node based on the provided options.
   *
   * @param {AddPublicConfig} options - The options specifying the farmId, nodeId, and publicConfig to be added.
   * @returns {Promise<void>} - A promise that resolves once the public configuration is added to the node.
   * @throws {ValidationError} - If the balance is not enough to apply the public configuration.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance to ensure there are enough funds available.
   */
  @expose
  @validateInput
  @checkBalance
  async addNodePublicConfig(options: AddPublicConfig): Promise<void> {
    return (await this.client.nodes.addNodePublicConfig(options)).apply();
  }

  /**
   * Retrieves all nodes.
   *
   * This method calls the `getAllNodes` method from the `capacity` class to retrieve all nodes.
   *
   * @returns {Promise<NodeInfo[]>} - A promise that resolves with all nodes.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   */
  @expose
  async all(): Promise<NodeInfo[]> {
    return await this.capacity.getAllNodes();
  }

  /**
   * Filters nodes based on the provided options.
   *
   * This method calls the `filterNodes` method from the `capacity` class to filter nodes based on the specified options.
   *
   * @param {FilterOptions} [options] - The options to filter nodes, including criteria like capacity, location, status, etc.
   * @returns {Promise<NodeInfo[]>} - A promise that resolves with the filtered nodes based on the provided options.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async filter(options?: FilterOptions): Promise<NodeInfo[]> {
    return await this.capacity.filterNodes(options);
  }
}

export { Nodes as nodes };
