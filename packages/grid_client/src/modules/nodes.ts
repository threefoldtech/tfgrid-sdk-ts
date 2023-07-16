import urlJoin from "url-join";

import { TFClient } from "../clients";
import { GridClientConfig } from "../config";
import { events, send, validateInput } from "../helpers";
import { expose } from "../helpers/expose";
import {
  NodeGetModel,
  NodePowerModel,
  RentContractCreateModel,
  RentContractDeleteModel,
  RentContractGetModel,
} from "./models";
import { checkBalance } from "./utils";

class Nodes {
  client: TFClient;
  constructor(public config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }

  @expose
  @validateInput
  @checkBalance
  async reserve(options: RentContractCreateModel) {
    const rentContractId = await this.getRentContractId({ nodeId: options.nodeId });
    if (rentContractId !== 0) {
      throw Error(`Node is already rented`);
    }
    try {
      const res = await (await this.client.contracts.createRent(options)).apply();
      events.emit("logs", `Rent contract with id: ${res.contractId} has been created`);
      return res;
    } catch (e) {
      throw Error(`Failed to create rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  @expose
  @validateInput
  @checkBalance
  async unreserve(options: RentContractDeleteModel) {
    const rentContractId = await this.getRentContractId({ nodeId: options.nodeId });
    if (rentContractId === 0) {
      events.emit("logs", `No rent contract found for node ${options.nodeId}`);
      return rentContractId;
    }
    try {
      const res = await (await this.client.contracts.cancel({ id: rentContractId })).apply();
      events.emit("logs", `Rent contract for node ${options.nodeId} has been deleted`);
      return res;
    } catch (e) {
      throw Error(`Failed to delete rent contract on node ${options.nodeId} due to ${e}`);
    }
  }

  @expose
  @validateInput
  async getRentContractId(options: RentContractGetModel) {
    const proxyURL = this.config.proxyURL;
    return send("get", urlJoin(proxyURL, `/nodes/${options.nodeId}`), "", {})
      .then(res => {
        return res.rentContractId;
      })
      .catch(err => {
        throw Error(`Error getting rent for node ${options.nodeId}: ${err}`);
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
}

export { Nodes as nodes };
