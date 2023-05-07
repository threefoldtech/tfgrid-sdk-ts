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

export interface CreateNodeOptions {
  nodeID: number;
  hash: string;
  data: string;
  numberOfPublicIPs: number;
  solutionProviderId: number;
}

export interface UpdateNodeOptions {
  id: number;
  hash: string;
  data: string;
}

export interface CreateRentOptions {
  nodeId: number;
  solutionProviderId?: number;
}

export interface CreateServiceOptions {
  serviceAccount: string;
  consumerAccount: string;
}

export interface ApproveServiceOptions {
  serviceId: number;
  approve: boolean;
}

export interface BillServiceOptions {
  serviceId: number;
  variableAmount: number;
  metadata: string;
}

export interface SetServiceFeesOptions {
  serviceId: number;
  baseFee: number;
  variableFee: number;
}

export interface SetServiceMetadataOptions {
  serviceId: number;
  metadata: string;
}

class Contracts extends QueryContracts {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  async createNode(options: CreateNodeOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.createNodeContract,
      [options.nodeID, options.hash, options.data, options.numberOfPublicIPs, options.solutionProviderId],
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  async updateNode(options: UpdateNodeOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.updateNodeContract,
      [options.id, options.hash, options.data],
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  async createName(name: string) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.createNameContract,
      [name],
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  async createRent(options: CreateRentOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.createRentContract,
      [options.nodeId, options.solutionProviderId],
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  async cancel(id: number) {
    const contract = await this.get(id);
    if (!contract) {
      return;
    }
    const extrinsic = await this.client.checkConnectionAndApply(this.client.api.tx.smartContractModule.cancelContract, [
      id,
    ]);
    return this.client.patchExtrinsic(extrinsic, { map: () => id });
  }

  async createService(options: CreateServiceOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.serviceContractCreate,
      [options.serviceAccount, options.consumerAccount],
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  async approveService(options: ApproveServiceOptions) {
    let extrinsic: any;
    if (options.approve) {
      extrinsic = await this.client.checkConnectionAndApply(
        this.client.api.tx.smartContractModule.serviceContractApprove,
        [options.serviceId],
      );
    } else {
      extrinsic = await this.client.checkConnectionAndApply(
        this.client.api.tx.smartContractModule.serviceContractReject,
        [options.serviceId],
      );
    }
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  async billService(options: BillServiceOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.serviceContractBill,
      [options.serviceId, options.variableAmount, options.metadata],
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  async cancelService(serviceId: number) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.serviceContractCancel,
      [serviceId],
    );
    return this.client.patchExtrinsic(extrinsic, { map: () => serviceId });
  }

  async setServiceFees(options: SetServiceFeesOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.serviceContractSetFees,
      [options.serviceId, options.baseFee, options.variableFee],
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  async setServiceMetadata(options: SetServiceMetadataOptions) {
    const extrinsic = await this.client.checkConnectionAndApply(
      this.client.api.tx.smartContractModule.serviceContractSetMetadata,
      [options.serviceId, options.metadata],
    );

    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }
}

export {
  Contracts,
  Contract,
  QueryContracts,
  ContractType,
  State,
  ServiceContract,
  NameContract,
  NodeContract,
  RentContract,
  ServiceState,
};
