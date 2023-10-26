import {
  ContractLockOptions,
  Contracts,
  ExtrinsicResult,
  GetDedicatedNodePriceOptions,
  SetDedicatedNodeExtraFeesOptions,
} from "@threefold/tfchain_client";
import { Decimal } from "decimal.js";

import { ContractStates } from "../../modules";
import { Graphql } from "../graphql/client";

export type DiscountLevel = "None" | "Default" | "Bronze" | "Silver" | "Gold";

export interface ListContractByTwinIdOptions {
  graphqlURL: string;
  twinId: number;
  stateList?: ContractStates[];
}

export interface ContractUsedResources {
  contract: GqlNodeContract;
  hru: number;
  sru: number;
  cru: number;
  mru: number;
}

export interface GqlBaseContract {
  id: string;
  gridVersion: string;
  contractID: string;
  twinID: string;
  state: string;
  createdAt: string;
  solutionProviderID: string;
}

export interface GqlNameContract extends GqlBaseContract {
  name: string;
}

export interface GqlNodeContract extends GqlBaseContract {
  nodeID: number;
  deploymentData: string;
  deploymentHash: string;
  numberOfPublicIPs: number;
  resourcesUsed: ContractUsedResources;
}

export interface GqlRentContract extends GqlBaseContract {
  nodeID: number;
}

export interface GqlContracts {
  nameContracts: GqlNameContract[];
  nodeContracts: GqlNodeContract[];
  rentContracts: GqlRentContract[];
}

export interface GqlConsumption {
  contracts: GqlContracts;
  billReports: GqlContractBillReports[];
}

export interface GqlContractBillReports {
  id: string;
  contractID: number;
  discountReceived: DiscountLevel;
  amountBilled: number;
  timestamp: number;
}

export interface ListContractByAddressOptions {
  graphqlURL: string;
  accountId: string;
  stateList?: ContractStates[];
}

export interface ListMyContractOptions {
  graphqlURL: string;
  stateList?: ContractStates[];
}

export interface GetConsumptionOptions {
  graphqlURL: string;
  id: number;
}

export interface CancelMyContractOptions {
  graphqlURL: string;
}

class TFContracts extends Contracts {
  async listContractsByTwinId(options: ListContractByTwinIdOptions): Promise<GqlContracts> {
    options.stateList = options.stateList || [ContractStates.Created, ContractStates.GracePeriod];
    const state = `[${options.stateList.join(", ")}]`;
    const gqlClient = new Graphql(options.graphqlURL);
    const opts = `(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, orderBy: twinID_ASC)`;
    try {
      const nameContractsCount = await gqlClient.getItemTotalCount("nameContracts", opts);
      const nodeContractsCount = await gqlClient.getItemTotalCount("nodeContracts", opts);
      const rentContractsCount = await gqlClient.getItemTotalCount("rentContracts", opts);
      const body = `query getContracts($nameContractsCount: Int!, $nodeContractsCount: Int!, $rentContractsCount: Int!){
                nameContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, limit: $nameContractsCount) {
                  contractID
                  createdAt
                  name
                  solutionProviderID
                  state
                  twinID
                }
                nodeContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, limit: $nodeContractsCount) {
                  contractID
                  deploymentData
                  state
                  createdAt
                  nodeID
                  numberOfPublicIPs
                }
                rentContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, limit: $rentContractsCount) {
                  contractID
                  createdAt
                  nodeID
                  solutionProviderID
                  state
                  twinID
                }
              }`;
      const response = await gqlClient.query(body, {
        nodeContractsCount: nodeContractsCount,
        nameContractsCount: nameContractsCount,
        rentContractsCount: rentContractsCount,
      });

      return response["data"] as GqlContracts;
    } catch (err) {
      throw Error(`Error listing contracts by twin id ${options.twinId}: ${err}`);
    }
  }

  /**
   * Get contract consumption per hour in TFT.
   *
   * @param  {GetConsumptionOptions} options
   * @returns {Promise<number>}
   */
  async getConsumption(options: GetConsumptionOptions): Promise<number> {
    const gqlClient = new Graphql(options.graphqlURL);
    const body = `query getConsumption($contractId: BigInt!){
            contractBillReports(where: {contractID_eq: $contractId}, limit: 2 , orderBy: timestamp_DESC) {
                amountBilled
                timestamp
            }
            nodeContracts(where: {contractID_eq: $contractId}) {
                createdAt
              }
            nameContracts(where: {contractID_eq: $contractId}) {
                createdAt
              }
            rentContracts(where: {contractID_eq: $contractId}) {
                createdAt
              }
          }`;
    try {
      const response = await gqlClient.query(body, { contractId: options.id });
      const gqlConsumption: GqlConsumption = response["data"] as GqlConsumption;
      const billReports = gqlConsumption.billReports;
      if (billReports.length === 0) {
        return 0;
      } else {
        let duration: number;
        const amountBilled = new Decimal(billReports[0].amountBilled);
        if (billReports.length === 2) {
          duration = (billReports[0].timestamp - billReports[1].timestamp) / 3600; // one hour
        } else {
          let createdAt: number;
          for (const contracts of [
            gqlConsumption.contracts.nodeContracts,
            gqlConsumption.contracts.nameContracts,
            gqlConsumption.contracts.rentContracts,
          ]) {
            if (contracts.length === 1) {
              createdAt = +contracts[0].createdAt;
              duration = (billReports[0].timestamp - createdAt) / 3600;
              break;
            }
          }
        }
        if (!duration) {
          duration = 1;
        }
        return amountBilled
          .div(duration)
          .div(10 ** 7)
          .toNumber();
      }
    } catch (err) {
      throw Error(`Error getting consumption for contract ${options.id}: ${err}`);
    }
  }

  async listContractsByAddress(options: ListContractByAddressOptions) {
    const twinId = await this.client.twins.getTwinIdByAccountId({ accountId: options.accountId });
    return await this.listContractsByTwinId({
      graphqlURL: options.graphqlURL,
      twinId: twinId,
      stateList: options.stateList,
    });
  }

  async listMyContracts(options: ListMyContractOptions): Promise<GqlContracts> {
    const twinId = await this.client.twins.getMyTwinId();
    return await this.listContractsByTwinId({
      graphqlURL: options.graphqlURL,
      twinId: twinId,
      stateList: options.stateList,
    });
  }

  async contractLock(options: ContractLockOptions) {
    const res = await super.contractLock(options);
    const amountLocked = new Decimal(res.amountLocked);
    res.amountLocked = amountLocked.div(10 ** 7).toNumber();
    return res;
  }

  /**
   * WARNING: Please be careful when executing this method, it will delete all your contracts.
   * @param  {CancelMyContractOptions} options
   * @returns {Promise<Record<string, number>[]>}
   */
  async cancelMyContracts(
    options: CancelMyContractOptions,
  ): Promise<(GqlNameContract | GqlRentContract | GqlNodeContract)[]> {
    const allContracts = await this.listMyContracts(options);
    const contracts = [...allContracts.nameContracts, ...allContracts.nodeContracts, ...allContracts.rentContracts];

    const ids: number[] = [];
    for (const contract of contracts) {
      ids.push(+contract.contractID);
    }
    await this.batchCancelContracts(ids);
    return contracts;
  }

  async batchCancelContracts(ids: number[]): Promise<number[]> {
    const extrinsics: ExtrinsicResult<number>[] = [];
    for (const id of ids) {
      extrinsics.push(await this.cancel({ id }));
    }
    await this.client.applyAllExtrinsics(extrinsics);
    return ids;
  }

  async getDedicatedNodeExtraFee(options: GetDedicatedNodePriceOptions): Promise<number> {
    // converting fees from milli to usd before getting
    const fee = new Decimal(await super.getDedicatedNodeExtraFee(options));
    const feeUSD = fee.div(10 ** 3).toNumber();
    return feeUSD;
  }

  async setDedicatedNodeExtraFee(options: SetDedicatedNodeExtraFeesOptions) {
    // converting fees from usd to milli before setting
    const fee = new Decimal(options.extraFee);
    const feeUSD = fee.mul(10 ** 3).toNumber();

    return await super.setDedicatedNodeExtraFee({
      nodeId: options.nodeId,
      extraFee: feeUSD,
    });
  }
}

export { TFContracts };
