import { Contract } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError, InsufficientBalanceError } from "@threefold/types";
import * as PATH from "path";

import { GqlNameContract, GqlNodeContract, GqlRentContract, LockContracts } from "../clients/tf-grid";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { Nodes } from "../primitives/nodes";
import { BaseModule } from "./base";
import {
  BatchCancelContractsModel,
  ContractCancelModel,
  ContractConsumption,
  ContractGetByNodeIdAndHashModel,
  ContractGetModel,
  ContractLockModel,
  ContractsByAddress,
  ContractsByTwinId,
  ContractState,
  ContractStates,
  CreateServiceContractModel,
  GetActiveContractsModel,
  GetDedicatedNodePriceModel,
  GetServiceContractModel,
  NameContractCreateModel,
  NameContractGetModel,
  NodeContractCreateModel,
  NodeContractUpdateModel,
  RentContractCreateModel,
  RentContractGetModel,
  ServiceContractApproveModel,
  ServiceContractBillModel,
  ServiceContractCancelModel,
  SetDedicatedNodeExtraFeesModel,
  SetServiceContractFeesModel,
  SetServiceContractMetadataModel,
} from "./models";
import { checkBalance } from "./utils";

class Contracts {
  client: TFClient;
  nodes: Nodes;
  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
    this.nodes = new Nodes(config.graphqlURL, config.proxyURL, config.rmbClient);
  }

  private async invalidateDeployment(contractId: number) {
    const baseModule = new BaseModule(this.config);
    const contractPath = PATH.join(this.config.storePath, "contracts", `${contractId}.json`);
    let contractInfo;
    try {
      contractInfo = await baseModule.backendStorage.load(contractPath);
    } catch (e) {
      events.emit("logs", `Couldn't delete the deployment's cached data for contract id: ${contractId} due to ${e}`);
    }
    if (contractInfo) {
      baseModule.moduleName = contractInfo["moduleName"];
      baseModule.projectName = contractInfo["projectName"];
      try {
        await baseModule._get(contractInfo["deploymentName"]);
      } catch (e) {
        if (e instanceof InsufficientBalanceError)
          throw new DeploymentKeyDeletionError(
            `Couldn't delete the deployment's cached data for contract ${contractInfo["deploymentName"]} due to \n\t${e}`,
          );
        else throw e;
      }
    }
  }

  @expose
  @validateInput
  @checkBalance
  async create_node(options: NodeContractCreateModel) {
    return (
      await this.client.contracts.createNode({
        nodeId: options.node_id,
        hash: options.hash,
        data: options.data,
        numberOfPublicIps: options.public_ip,
        solutionProviderId: options.solutionProviderId,
      })
    ).apply();
  }
  @expose
  @validateInput
  @checkBalance
  async create_name(options: NameContractCreateModel) {
    return (await this.client.contracts.createName(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async createRent(options: RentContractCreateModel) {
    return (await this.client.contracts.createRent(options)).apply();
  }

  @expose
  @validateInput
  async get(options: ContractGetModel) {
    return this.client.contracts.get(options);
  }
  @expose
  @validateInput
  async get_contract_id_by_node_id_and_hash(options: ContractGetByNodeIdAndHashModel) {
    return this.client.contracts.getContractIdByNodeIdAndHash({ nodeId: options.node_id, hash: options.hash });
  }

  @expose
  @validateInput
  async get_name_contract(options: NameContractGetModel) {
    return this.client.contracts.getContractIdByName(options);
  }

  @expose
  @validateInput
  async getDedicatedNodeExtraFee(options: GetDedicatedNodePriceModel) {
    return await this.client.contracts.getDedicatedNodeExtraFee(options);
  }

  @expose
  @validateInput
  async getActiveContracts(options: GetActiveContractsModel) {
    return await this.client.contracts.getActiveContracts(options);
  }

  @expose
  @validateInput
  async activeRentContractForNode(options: RentContractGetModel) {
    return this.client.contracts.getContractIdByActiveRentForNode(options);
  }

  @expose
  @validateInput
  async contractLock(options: ContractLockModel) {
    return this.client.contracts.contractLock(options);
  }

  @expose
  @validateInput
  @checkBalance
  async update_node(options: NodeContractUpdateModel) {
    return (await this.client.contracts.updateNode(options)).apply();
  }
  @expose
  @validateInput
  @checkBalance
  async cancel(options: ContractCancelModel) {
    const deletedContract = await (await this.client.contracts.cancel(options)).apply();
    await this.invalidateDeployment(options.id);
    return deletedContract;
  }

  @expose
  @validateInput
  async listMyContracts(options?: ContractState) {
    return this.client.contracts.listMyContracts({ graphqlURL: this.config.graphqlURL, stateList: options?.state });
  }

  @expose
  @validateInput
  async listContractsByTwinId(options: ContractsByTwinId) {
    return this.client.contracts.listContractsByTwinId({ graphqlURL: this.config.graphqlURL, twinId: options.twinId });
  }

  @expose
  @validateInput
  async listContractsByAddress(options: ContractsByAddress) {
    return this.client.contracts.listContractsByAddress({
      graphqlURL: this.config.graphqlURL,
      accountId: options.address,
    });
  }

  @expose
  @validateInput
  @checkBalance
  async createServiceContract(options: CreateServiceContractModel) {
    return (await this.client.contracts.createService(options)).apply();
  }
  @expose
  @validateInput
  @checkBalance
  async approveServiceContract(options: ServiceContractApproveModel) {
    return (await this.client.contracts.approveService(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async billServiceContract(options: ServiceContractBillModel) {
    return (await this.client.contracts.billService(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async cancelServiceContract(options: ServiceContractCancelModel) {
    return (await this.client.contracts.cancelService(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async setFeesServiceContract(options: SetServiceContractFeesModel) {
    return (await this.client.contracts.setServiceFees(options)).apply();
  }

  @expose
  @validateInput
  @checkBalance
  async setMetadataServiceContract(options: SetServiceContractMetadataModel) {
    return (await this.client.contracts.setServiceMetadata(options)).apply();
  }

  @expose
  @validateInput
  async getServiceContract(options: GetServiceContractModel) {
    return this.client.contracts.getService(options);
  }
  /**
   * WARNING: Please be careful when executing this method, it will delete all your contracts.
   * @returns Promise
   */
  @expose
  @validateInput
  @checkBalance
  async cancelMyContracts(): Promise<(GqlNameContract | GqlRentContract | GqlNodeContract)[]> {
    const contracts = await this.client.contracts.cancelMyContracts({ graphqlURL: this.config.graphqlURL });
    for (const contract of contracts) {
      await this.invalidateDeployment(+contract.contractID);
    }
    return contracts;
  }

  @expose
  @validateInput
  @checkBalance
  async batchCancelContracts(options: BatchCancelContractsModel): Promise<number[]> {
    const contracts = await this.client.contracts.batchCancelContracts(options.ids);
    for (const id of options.ids) {
      await this.invalidateDeployment(id);
    }
    return contracts;
  }

  @expose
  @validateInput
  @checkBalance
  async setDedicatedNodeExtraFee(options: SetDedicatedNodeExtraFeesModel) {
    return (await this.client.contracts.setDedicatedNodeExtraFee(options)).apply();
  }

  /**
   * Get contract consumption per hour in TFT.
   *
   * @param  {ContractConsumption} options
   * @returns {Promise<number>}
   */
  @expose
  @validateInput
  async getConsumption(options: ContractConsumption): Promise<number> {
    return this.client.contracts.getConsumption({ id: options.id, graphqlURL: this.config.graphqlURL });
  }

  @expose
  @validateInput
  async getDeletionTime(options: ContractGetModel): Promise<string | number> {
    return this.client.contracts.getDeletionTime(options);
  }
  /**
   * Retrieves lock details of contracts.
   * @returns A Promise that resolves to an object of type LockContracts containing details of locked contracts.
   */
  @expose
  @validateInput
  async getContractsLockDetails(): Promise<LockContracts> {
    const LockedContracts: LockContracts = {
      nameContracts: {},
      nodeContracts: {},
      rentContracts: {},
      totalAmountLocked: 0,
    };
    const contracts = await this.listMyContracts({ state: [ContractStates.GracePeriod] });

    if (contracts == undefined) return LockedContracts;

    const contractTypes = ["nameContracts", "nodeContracts", "rentContracts"];

    for (const type of contractTypes) {
      for (const contract of contracts[type]) {
        const contractID = parseInt(contract.contractID);
        const contractLockDetails = await this.contractLock({ id: contractID });
        LockedContracts[type][contractID] = contractLockDetails;
        LockedContracts.totalAmountLocked += contractLockDetails.amountLocked;
      }
    }
    return LockedContracts;
  }

  /**
   * Unlocks multiple contracts.
   * @param ids An array of contract IDs to be unlocked.
   * @returns A Promise that resolves to an array of billed contracts representing the result of batch unlocking.
   */
  @expose
  @validateInput
  async unlockContracts(ids: number[]): Promise<number[]> {
    return await this.client.contracts.batchUnlockContracts(ids);
  }
  /**
   * Unlocks contracts associated with the current user.
   * @returns A Promise that resolves to an array of billed contracts.
   */
  @expose
  @validateInput
  async unlockMyContracts(): Promise<number[]> {
    return await this.client.contracts.unlockMyContracts(this.config.graphqlURL);
  }
}

export { Contracts as contracts };
