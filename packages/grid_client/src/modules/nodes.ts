import { GridClientErrors, TFChainErrors } from "@threefold/types";

import { TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { events, validateInput } from "../helpers";
import { expose } from "../helpers/expose";
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
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
    this.capacity = new capacity(config);
  }

  @expose
  @validateInput
  @checkBalance
  async reserve(options: RentContractCreateModel) {
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
      throw new TFChainErrors.TFChainError(`Failed to create rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  @expose
  @validateInput
  @checkBalance
  async unreserve(options: RentContractDeleteModel) {
    const rentContractId = await this.getRentContractId({ nodeId: options.nodeId });
    if (!rentContractId) {
      events.emit("logs", `No rent contract found for node ${options.nodeId}`);
      return rentContractId;
    }
    try {
      const res = await (await this.client.contracts.cancel({ id: rentContractId })).apply();
      events.emit("logs", `Rent contract for node ${options.nodeId} has been deleted`);
      return res;
    } catch (e) {
      throw new TFChainErrors.TFChainError(`Failed to delete rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  @expose
  @validateInput
  async getRentContractId(options: RentContractGetModel) {
    return this.client.contracts
      .getContractIdByActiveRentForNode(options)
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new TFChainErrors.TFChainError(`Error getting rent for node ${options.nodeId}: ${err}`);
      });
  }

  @expose
  @validateInput
  async get(options: NodeGetModel) {
    return await this.client.nodes.get(options);
  }

  @expose
  @validateInput
  @checkBalance
  async setNodePower(options: NodePowerModel) {
    return (await this.client.nodes.setPower(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async addNodePublicConfig(options: AddPublicConfig) {
    return (await this.client.nodes.addNodePublicConfig(options)).apply();
  }

  @expose
  async all() {
    return await this.capacity.getAllNodes();
  }

  @expose
  @validateInput
  async filter(options?: FilterOptions) {
    return await this.capacity.filterNodes(options);
  }
}

export { Nodes as nodes };
