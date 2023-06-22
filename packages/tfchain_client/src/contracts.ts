import { Client, QueryClient } from "./client";
import { PublicIp } from "./types";
import { checkConnection } from "./utils";

const TWO_WEEKS = 1209600000;

interface State {
  created: null;
  gracePeriod: number;
}
interface NameContract {
  name: string;
}

export interface ContractLockOptions {
  id: number;
}

export interface ContractLock {
  amountLocked: number;
  lockUpdated: number;
  cycles: number;
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

interface QueryContractsGetOptions {
  id: number;
}

interface QueryContractsGetContractByActiveRentOptions {
  nodeId: number;
}

interface QueryContractGetContractByNameOptions {
  name: string;
}

interface QueryContractGetContractByIdAndHashOptions {
  nodeId: number;
  hash: string;
}

interface QueryContractGetServiceOptions {
  serviceId: number;
}

class QueryContracts {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(options: QueryContractsGetOptions): Promise<Contract> {
    const res = await this.client.api.query.smartContractModule.contracts(options.id);
    return res.toPrimitive() as unknown as Contract;
  }

  @checkConnection
  async getContractIdByActiveRentForNode(options: QueryContractsGetContractByActiveRentOptions): Promise<number> {
    const res = await this.client.api.query.smartContractModule.activeRentContractForNode(options.nodeId);
    return res.toPrimitive() as number;
  }

  @checkConnection
  async getContractIdByName(options: QueryContractGetContractByNameOptions): Promise<number> {
    const res = await this.client.api.query.smartContractModule.contractIDByNameRegistration(options.name);
    return res.toPrimitive() as number;
  }

  @checkConnection
  async getContractIdByNodeIdAndHash(options: QueryContractGetContractByIdAndHashOptions): Promise<number> {
    const res = await this.client.api.query.smartContractModule.contractIDByNodeIDAndHash(options.nodeId, options.hash);
    return res.toPrimitive() as number;
  }

  @checkConnection
  async contractLock(options: ContractLockOptions): Promise<ContractLock> {
    const res = await this.client.api.query.smartContractModule.contractLock(options.id);
    return res.toPrimitive() as unknown as ContractLock;
  }

  @checkConnection
  async getDeletionTime(options: QueryContractsGetOptions): Promise<number> {
    const contract = await this.get(options);
    if (!contract || contract.state.created === null) return 0;

    const blockNumber = contract.state.gracePeriod;

    try {
      const currentBlockNumber = +(await this.client.api.query.system.number());

      // each block takes 6 seconds
      const gracePeriodStartTime = new Date().getTime() - (currentBlockNumber - blockNumber) * 6000;

      return gracePeriodStartTime + TWO_WEEKS;
    } catch (err) {
      throw Error(`Error getting current block number for contract ${options.id} deletion: ${err}`);
    }
  }

  @checkConnection
  async getService(options: QueryContractGetServiceOptions): Promise<ServiceContract> {
    const res = await this.client.api.query.smartContractModule.serviceContracts(options.serviceId);
    return res.toPrimitive() as unknown as ServiceContract;
  }

  @checkConnection
  async getDedicatedNodeExtraFee(options: GetDedicatedNodePriceOptions): Promise<number> {
    const res = await this.client.api.query.smartContractModule.dedicatedNodesExtraFee(options.nodeId);
    return res.toPrimitive() as number;
  }
}

export interface CreateNodeOptions {
  nodeId: number;
  hash: string;
  data: string;
  numberOfPublicIps: number;
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
export interface SetDedicatedNodeExtraFeesOptions {
  nodeId: number;
  extraFee: number;
}

export interface GetDedicatedNodePriceOptions {
  nodeId: number;
}

export interface SetServiceMetadataOptions {
  serviceId: number;
  metadata: string;
}

export interface CreateNameOptions {
  name: string;
}

export interface CancelOptions {
  id: number;
}

export interface CancelServiceOptions {
  serviceId: number;
}

class Contracts extends QueryContracts {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async createNode(options: CreateNodeOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.createNodeContract(
      options.nodeId,
      options.hash,
      options.data,
      options.numberOfPublicIps,
      options.solutionProviderId,
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  @checkConnection
  async updateNode(options: UpdateNodeOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.updateNodeContract(
      options.id,
      options.hash,
      options.data,
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  @checkConnection
  async createName(options: CreateNameOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.createNameContract(options.name);
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  @checkConnection
  async createRent(options: CreateRentOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.createRentContract(
      options.nodeId,
      options.solutionProviderId,
    );
    return this.client.patchExtrinsic<Contract>(extrinsic);
  }

  @checkConnection
  async cancel(options: CancelOptions) {
    const contract = await this.get(options);
    if (!contract) {
      return;
    }
    const extrinsic = await this.client.api.tx.smartContractModule.cancelContract(options.id);
    return this.client.patchExtrinsic(extrinsic, {
      map: () => options.id,
      resultEvents: ["NodeContractCanceled", "NameContractCanceled", "RentContractCanceled", "ContractCanceled"],
    });
  }

  @checkConnection
  async createService(options: CreateServiceOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.serviceContractCreate(
      options.serviceAccount,
      options.consumerAccount,
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  @checkConnection
  async approveService(options: ApproveServiceOptions) {
    let extrinsic: any;
    if (options.approve) {
      extrinsic = await this.client.api.tx.smartContractModule.serviceContractApprove(options.serviceId);
    } else {
      extrinsic = await this.client.api.tx.smartContractModule.serviceContractReject(options.serviceId);
    }
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  @checkConnection
  async billService(options: BillServiceOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.serviceContractBill(
      options.serviceId,
      options.variableAmount,
      options.metadata,
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  @checkConnection
  async cancelService(options: CancelServiceOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.serviceContractCancel(options.serviceId);
    return this.client.patchExtrinsic(extrinsic, { map: () => options.serviceId });
  }

  @checkConnection
  async setServiceFees(options: SetServiceFeesOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.serviceContractSetFees(
      options.serviceId,
      options.baseFee,
      options.variableFee,
    );
    return this.client.patchExtrinsic<ServiceContract>(extrinsic);
  }

  @checkConnection
  async setDedicatedNodeExtraFee(options: SetDedicatedNodeExtraFeesOptions) {
    const extrinsic = this.client.api.tx.smartContractModule.setDedicatedNodeExtraFee(options.nodeId, options.extraFee);
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async setServiceMetadata(options: SetServiceMetadataOptions) {
    const extrinsic = await this.client.api.tx.smartContractModule.serviceContractSetMetadata(
      options.serviceId,
      options.metadata,
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
