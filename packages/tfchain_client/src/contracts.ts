import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client, QueryClient } from "./client";
import { PublicIp } from "./types";

const TWO_WEEKS = 1209600000;

interface State {
  created: null;
  gracePeriod: number;
}
interface NameContract {
  name: string;
}

interface NodeContract {
  nodeId: number;
  deploymentHash: string;
  deploymentData: string;
  publicIps: number;
  publicIpsList: PublicIp[];
}

interface RentContract {
  nodeId: number;
}
interface ContractType {
  nameContract: NameContract;
  nodeContract: NodeContract;
  rentContract: RentContract;
}

interface Contract {
  version: number;
  state: State;
  contractId: number;
  twinId: number;
  contractType: ContractType;
  solutionProviderId: number;
}

enum ServiceState {
  Created = "Created",
  AgreementReady = "AgreementReady",
  ApprovedByBoth = "ApprovedByBoth",
}
interface ServiceContract {
  serviceContractId: number;
  serviceTwinId: number;
  consumerTwinId: number;
  baseFee: number;
  variableFee: number;
  metadata: string;
  acceptedByService: boolean;
  acceptedByConsumer: boolean;
  lastBill: number;
  state: ServiceState;
}

class QueryContracts {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  async get(id: number): Promise<Contract> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.smartContractModule.contracts, [id]);
    return res.toPrimitive();
  }

  async getContractIdByActiveRentForNode(nodeId: number): Promise<number> {
    const res = await this.client.checkConnectionAndApply(
      this.client.api.query.smartContractModule.activeRentContractForNode,
      [nodeId],
    );
    return res.toPrimitive();
  }

  async getContractIdByName(name: string): Promise<number> {
    const res = await this.client.checkConnectionAndApply(
      this.client.api.query.smartContractModule.contractIDByNameRegistration,
      [name],
    );
    return res.toPrimitive();
  }

  async getContractIdByNodeIdAndHash(nodeId: number, hash: string): Promise<number> {
    const res = await this.client.checkConnectionAndApply(
      this.client.api.query.smartContractModule.contractIDByNodeIDAndHash,
      [nodeId, hash],
    );
    return res.toPrimitive();
  }

  async getDeletionTime(id: number): Promise<number> {
    const contract = await this.get(id);
    if (!contract || contract.state.created === null) return 0;

    const blockNumber = contract.state.gracePeriod;

    try {
      const currentBlockNumber = +(await this.client.checkConnectionAndApply(this.client.api.query.system.number, []));

      // each block takes 6 seconds
      const gracePeriodStartTime = new Date().getTime() - (currentBlockNumber - blockNumber) * 6000;

      return gracePeriodStartTime + TWO_WEEKS;
    } catch (err) {
      throw Error(`Error getting current block number for contract ${id} deletion: ${err}`);
    }
  }

  async getService(serviceId: number): Promise<ServiceContract> {
    const res = await this.client.checkConnectionAndApply(this.client.api.query.smartContractModule.serviceContracts, [
      serviceId,
    ]);
    return res.toPrimitive();
  }
}

class Contracts extends QueryContracts {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }
  async createNodeExtrinsic(
    nodeID: number,
    hash: string,
    data: string,
    numberOfPublicIPs: number,
    solutionProviderId: number,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.createNodeContract, [
      nodeID,
      hash,
      data,
      numberOfPublicIPs,
      solutionProviderId,
    ]);
  }

  async createNode(
    nodeID: number,
    hash: string,
    data: string,
    numberOfPublicIPs: number,
    solutionProviderId: number,
  ): Promise<Contract> {
    const extrinsic = await this.createNodeExtrinsic(nodeID, hash, data, numberOfPublicIPs, solutionProviderId);
    return this.client.applyExtrinsic<Contract>(extrinsic);
  }

  async updateNodeExtrinsic(
    id: number,
    hash: string,
    data: string,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.updateNodeContract, [
      id,
      hash,
      data,
    ]);
  }

  async updateNode(id: number, hash: string, data: string): Promise<Contract> {
    const extrinsic = await this.updateNodeExtrinsic(id, hash, data);
    return this.client.applyExtrinsic<Contract>(extrinsic);
  }

  async createNameExtrinsic(name: string): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.createNameContract, [name]);
  }

  async createName(name: string): Promise<Contract> {
    const extrinsic = await this.createNameExtrinsic(name);
    return this.client.applyExtrinsic<Contract>(extrinsic);
  }

  async createRentExtrinsic(
    nodeId: number,
    solutionProviderId?: number,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.createRentContract, [
      nodeId,
      solutionProviderId,
    ]);
  }

  async createRent(nodeId: number, solutionProviderId?: number): Promise<Contract> {
    const extrinsic = await this.createRentExtrinsic(nodeId, solutionProviderId);
    return this.client.applyExtrinsic<Contract>(extrinsic);
  }

  async cancelExtrinsic(id: number): Promise<SubmittableExtrinsic<"promise", ISubmittableResult> | undefined> {
    const contract = await this.get(id);
    if (!contract) {
      return;
    }
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.cancelContract, [id]);
  }

  async cancel(id: number): Promise<number> {
    const extrinsic = await this.cancelExtrinsic(id);
    if (extrinsic) return this.client.applyExtrinsic<number>(extrinsic);
    return id;
  }

  async createServiceExtrinsic(
    serviceAccount: string,
    consumerAccount: string,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractCreate, [
      serviceAccount,
      consumerAccount,
    ]);
  }

  async createService(serviceAccount: string, consumerAccount: string): Promise<ServiceContract> {
    const extrinsic = await this.createServiceExtrinsic(serviceAccount, consumerAccount);
    return this.client.applyExtrinsic<ServiceContract>(extrinsic);
  }
  async approveServiceExtrinsic(
    serviceId: number,
    approve: boolean,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    if (approve) {
      return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractApprove, [
        serviceId,
      ]);
    } else {
      return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractReject, [
        serviceId,
      ]);
    }
  }

  async approveService(serviceId: number, approve: boolean): Promise<ServiceContract> {
    const extrinsic = await this.approveServiceExtrinsic(serviceId, approve);
    return this.client.applyExtrinsic<ServiceContract>(extrinsic);
  }

  async billServiceExtrinsic(
    serviceId: number,
    variableAmount: number,
    metadata: string,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractBill, [
      serviceId,
      variableAmount,
      metadata,
    ]);
  }

  async billService(serviceId: number, variableAmount: number, metadata: string): Promise<ServiceContract> {
    const extrinsic = await this.billServiceExtrinsic(serviceId, variableAmount, metadata);
    return this.client.applyExtrinsic<ServiceContract>(extrinsic);
  }

  async cancelServiceExtrinsic(serviceId: number): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractCancel, [
      serviceId,
    ]);
  }

  async cancelService(serviceId: number): Promise<number> {
    const extrinsic = await this.cancelServiceExtrinsic(serviceId);
    return this.client.applyExtrinsic<number>(extrinsic);
  }

  async setServiceFeesExtrinsic(
    serviceId: number,
    baseFee: number,
    variableFee: number,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractSetFees, [
      serviceId,
      baseFee,
      variableFee,
    ]);
  }

  async setServiceFees(serviceId: number, baseFee: number, variableFee: number): Promise<ServiceContract> {
    const extrinsic = await this.setServiceFeesExtrinsic(serviceId, baseFee, variableFee);
    return this.client.applyExtrinsic<ServiceContract>(extrinsic);
  }

  async setServiceMetadataExtrinsic(
    serviceId: number,
    metadata: string,
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.serviceContractSetMetadata, [
      serviceId,
      metadata,
    ]);
  }

  async setServiceMetadata(serviceId: number, metadata: string): Promise<ServiceContract> {
    const extrinsic = await this.setServiceMetadataExtrinsic(serviceId, metadata);
    return this.client.applyExtrinsic<ServiceContract>(extrinsic);
  }
}

export { Contracts, Contract, QueryContracts };
