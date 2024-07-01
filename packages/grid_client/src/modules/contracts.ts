import { Contract, ContractLock, ServiceContract } from "@threefold/tfchain_client";
import { DeploymentKeyDeletionError, InsufficientBalanceError } from "@threefold/types";
import * as PATH from "path";

import { GqlContracts, GqlNameContract, GqlNodeContract, GqlRentContract, LockContracts } from "../clients/tf-grid";
import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { events } from "../helpers/events";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { Nodes } from "../primitives/nodes";
import { BaseModule } from "./base";
import * as modules from "./models";
import { checkBalance } from "./utils";

class Contracts {
  client: TFClient;
  nodes: Nodes;

  /**
   * Contracts class handles the creation, management, and retrieval of contracts.
   *
   * @param {GridClientConfig} config - The configuration object for the GridClient.
   */
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

  /**
   * Creates a new node contract.
   *
   * @param {modules.NodeContractCreateModel} options - The options for creating the node contract.
   * @returns {Promise<Contract> } A promise that resolves to the result of creating the node contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async create_node(options: modules.NodeContractCreateModel): Promise<Contract> {
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

  /**
   * Creates a new name contract.
   *
   * @param {modules.NameContractCreateModel} options - The options for creating the name contract.
   * @returns {Promise<Contract>} A promise that resolves to the result of creating the name contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async create_name(options: modules.NameContractCreateModel): Promise<Contract> {
    return (await this.client.contracts.createName(options)).apply();
  }

  /**
   * Creates a new rent contract.
   *
   * @param {modules.RentContractCreateModel} options - The options for creating the rent contract.
   * @returns {Promise<Contract>} A promise that resolves to the result of creating the rent contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async createRent(options: modules.RentContractCreateModel): Promise<Contract> {
    return (await this.client.contracts.createRent(options)).apply();
  }

  /**
   * Retrieves a contract based on the provided options.
   *
   * @param {modules.ContractGetModel} options - The options to retrieve the contract.
   * @returns {Promise<Contract>} A promise that resolves to the retrieved contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get(options: modules.ContractGetModel): Promise<Contract> {
    return this.client.contracts.get(options);
  }

  /**
   * Retrieves the contract ID based on the provided node ID and hash.
   *
   * @param {modules.ContractGetByNodeIdAndHashModel} options - The options containing the node ID and hash.
   * @returns {Promise<number>} A promise that resolves to the contract ID.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_contract_id_by_node_id_and_hash(options: modules.ContractGetByNodeIdAndHashModel): Promise<number> {
    return this.client.contracts.getContractIdByNodeIdAndHash({ nodeId: options.node_id, hash: options.hash });
  }

  /**
   * Retrieves a `name contract ID` based on the provided options.
   *
   * @param {modules.NameContractGetModel} options - The options to retrieve the name contract.
   * @returns {Promise<number>} A promise that resolves to the retrieved `name contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async get_name_contract(options: modules.NameContractGetModel): Promise<number> {
    return this.client.contracts.getContractIdByName(options);
  }

  /**
   * Retrieves the extra fee for a dedicated node based on the provided options.
   *
   * @param {modules.GetDedicatedNodePriceModel} options - The options to retrieve the extra fee for a dedicated node.
   * @returns {Promise<number>} A promise that resolves to the extra fee for the dedicated node.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getDedicatedNodeExtraFee(options: modules.GetDedicatedNodePriceModel): Promise<number> {
    return await this.client.contracts.getDedicatedNodeExtraFee(options);
  }

  /**
   * Retrieves active `contract IDs` based on the provided node ID.
   *
   * @param {modules.GetActiveContractsModel} options - The options containing the node ID.
   * @returns {Promise<number[]>} A promise that resolves to the active `contract IDs`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getActiveContracts(options: modules.GetActiveContractsModel): Promise<number[]> {
    return await this.client.contracts.getActiveContracts(options);
  }

  /**
   * Retrieves the active rent `contract ID` for a specific node based on the provided options.
   *
   * @param {modules.RentContractGetModel} options - The options to retrieve the active rent contract for a node.
   * @returns {Promise<number>} A promise that resolves to the active rent `contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async activeRentContractForNode(options: modules.RentContractGetModel): Promise<number> {
    return this.client.contracts.getContractIdByActiveRentForNode(options);
  }

  /**
   * Locks a contract based on the provided options.
   *
   * @param {modules.ContractLockModel} options - The options for locking the contract.
   * @returns {Promise<ContractLock>} A promise that resolves when the contract is successfully locked.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async contractLock(options: modules.ContractLockModel): Promise<ContractLock> {
    return this.client.contracts.contractLock(options);
  }

  /**
   * Updates a node contract.
   *
   * @param {modules.NodeContractUpdateModel} options - The options for updating the node contract.
   * @returns {Promise<Contract>} A promise that resolves to the result of updating the node contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async update_node(options: modules.NodeContractUpdateModel): Promise<Contract> {
    return (await this.client.contracts.updateNode(options)).apply();
  }

  /**
   * Cancels a contract based on the provided options.
   *
   * @param {modules.ContractCancelModel} options - The options for canceling the contract.
   * @returns {Promise<number>} A promise that resolves to the deleted `contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async cancel(options: modules.ContractCancelModel): Promise<number> {
    const deletedContract = await (await this.client.contracts.cancel(options)).apply();
    await this.invalidateDeployment(options.id);
    return deletedContract;
  }

  /**
   * Retrieves a list of `graphql contracts` associated with the current user.
   *
   * @param {modules.ContractState} [options] - The state of the contracts to filter by.
   * @returns {Promise<(GqlContracts<MGqlNameContract | GqlRentContract | GqlNodeContract>)[]>} A promise that resolves to an array of `graphql contracts`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listMyContracts(options?: modules.ContractState): Promise<GqlContracts> {
    return this.client.contracts.listMyContracts({ graphqlURL: this.config.graphqlURL, stateList: options?.state });
  }

  /**
   * Retrieves a list of `graphql contracts` associated with a specific twin ID.
   *
   * @param {modules.ContractsByTwinId} options - The options containing the twin ID.
   * @returns {Promise<GqlContracts> } A promise that resolves to the list of `graphql contracts` associated with the specified twin ID.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listContractsByTwinId(options: modules.ContractsByTwinId): Promise<GqlContracts> {
    return this.client.contracts.listContractsByTwinId({ graphqlURL: this.config.graphqlURL, twinId: options.twinId });
  }

  /**
   * Retrieves a list of `graphql contracts` associated with a specific address.
   *
   * @param {modules.ContractsByAddress} options - The options containing the address to retrieve `graphql contracts` for.
   * @returns {Promise<GqlContracts> } A promise that resolves to the list of `graphql contracts` associated with the specified address.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async listContractsByAddress(options: modules.ContractsByAddress): Promise<GqlContracts> {
    return this.client.contracts.listContractsByAddress({
      graphqlURL: this.config.graphqlURL,
      accountId: options.address,
    });
  }

  /**
   * Creates a new `service contract`.
   *
   * @param {modules.CreateServiceContractModel} options - The options for creating the `service contract`.
   * @returns {Promise<ServiceContract>} A promise that resolves to the result of creating the `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async createServiceContract(options: modules.CreateServiceContractModel): Promise<ServiceContract> {
    return (await this.client.contracts.createService(options)).apply();
  }

  /**
   * Approves a `service contract`.
   *
   * @param {modules.ServiceContractApproveModel} options - The options for approving the `service contract`.
   * @returns {Promise<ServiceContract>} A promise that resolves to the approved `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async approveServiceContract(options: modules.ServiceContractApproveModel): Promise<ServiceContract> {
    return (await this.client.contracts.approveService(options)).apply();
  }

  /**
   * Bills a `service contract` based on the provided options.
   *
   * @param {modules.ServiceContractBillModel} options - The options for billing the `service contract`.
   * @returns {Promise<ServiceContract>} A promise that resolves to the result of billing the `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async billServiceContract(options: modules.ServiceContractBillModel): Promise<ServiceContract> {
    return (await this.client.contracts.billService(options)).apply();
  }

  /**
   * Cancels a `service contract` based on the provided options.
   *
   * @param {modules.ServiceContractCancelModel} options - The options for canceling the `service contract`.
   * @returns {Promise<number>} A promise that resolves to the canceled `service contract ID`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async cancelServiceContract(options: modules.ServiceContractCancelModel): Promise<number> {
    return (await this.client.contracts.cancelService(options)).apply();
  }

  /**
   * Sets the fees for a `service contract`.
   *
   * @param {modules.SetServiceContractFeesModel} options - The options for setting the fees for the `service contract`.
   * @returns {Promise<ServiceContract>} A promise that resolves to the result of setting the fees for the `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async setFeesServiceContract(options: modules.SetServiceContractFeesModel): Promise<ServiceContract> {
    return (await this.client.contracts.setServiceFees(options)).apply();
  }

  /**
   * Sets the metadata for a `service contract`.
   *
   * @param {modules.SetServiceContractMetadataModel} options - The options for setting the metadata for the `service contract`.
   * @returns {Promise<ServiceContract>} A promise that resolves to the result of setting the metadata for the `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async setMetadataServiceContract(options: modules.SetServiceContractMetadataModel): Promise<ServiceContract> {
    return (await this.client.contracts.setServiceMetadata(options)).apply();
  }

  /**
   * Retrieves a `service contract` based on the provided options.
   *
   * @param {modules.GetServiceContractModel} options - The options to retrieve the `service contract`.
   * @returns {Promise<ServiceContract>} A Promise that resolves to the retrieved `service contract`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getServiceContract(options: modules.GetServiceContractModel): Promise<ServiceContract> {
    return this.client.contracts.getService(options);
  }

  /**
   * ### WARNING:
   * - `Please be careful when executing this method, it will delete all your contracts.`
   *
   * This method cancels all contracts associated with the current user.
   *
   * @returns {Promise<(GqlNameContract | GqlRentContract | GqlNodeContract)[]>} A promise that resolves to an array of canceled contracts.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
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

  /**
   * Cancels multiple contracts in batch.
   *
   * @param {modules.BatchCancelContractsModel} options - The options for batch canceling contracts.
   * @returns {Promise<number[]>} A promise that resolves to an array of canceled `contract IDs`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async batchCancelContracts(options: modules.BatchCancelContractsModel): Promise<number[]> {
    const contracts = await this.client.contracts.batchCancelContracts(options.ids);
    for (const id of options.ids) {
      await this.invalidateDeployment(id);
    }
    return contracts;
  }

  /**
   * Sets the extra fee for a `dedicated node`.
   *
   * @param {modules.SetDedicatedNodeExtraFeesModel} options - The options for setting the extra fee for the `dedicated node`.
   * @returns A promise that resolves to the result of setting the extra fee for the `dedicated node`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   * - `@checkBalance`: Checks the balance before proceeding.
   */
  @expose
  @validateInput
  @checkBalance
  async setDedicatedNodeExtraFee(options: modules.SetDedicatedNodeExtraFeesModel) {
    return (await this.client.contracts.setDedicatedNodeExtraFee(options)).apply();
  }

  /**
   * Get contract consumption per hour in TFT.
   *
   * @param  {ContractConsumption} options
   * @returns {Promise<number>}
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getConsumption(options: modules.ContractConsumption): Promise<number> {
    return this.client.contracts.getConsumption({ id: options.id, graphqlURL: this.config.graphqlURL });
  }

  /**
   * Retrieves the deletion time of a contract based on the provided options.
   *
   * @param {modules.ContractGetModel} options - The options to retrieve the deletion time of the contract.
   * @returns {Promise<number>} A promise that resolves to the deletion time of the contract.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async getDeletionTime(options: modules.ContractGetModel): Promise<number> {
    return this.client.contracts.getDeletionTime(options);
  }

  /**
   * Retrieves lock details of contracts.
   * @returns {Promise<LockContracts>} A Promise that resolves to an object of type LockContracts containing details of locked contracts.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
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
    const contracts = await this.listMyContracts({ state: [modules.ContractStates.GracePeriod] });

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
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async unlockContracts(ids: number[]): Promise<number[]> {
    return await this.client.contracts.batchUnlockContracts(ids);
  }
  /**
   * Unlocks contracts associated with the current user.
   * @returns A Promise that resolves to an array of billed contracts.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  async unlockMyContracts(): Promise<number[]> {
    return await this.client.contracts.unlockMyContracts(this.config.graphqlURL);
  }
}

export { Contracts as contracts };
