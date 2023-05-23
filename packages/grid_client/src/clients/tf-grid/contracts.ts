import { Contracts } from "@threefold/tfchain_client";
import { Decimal } from "decimal.js";

import { ContractStates } from "../../modules";
import { Graphql } from "../graphql/client";

export interface ListContractByTwinIdOptions {
  graphqlURL: string;
  twinId: number;
  stateList?: ContractStates[];
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
  async listContractsByTwinId(options: ListContractByTwinIdOptions) {
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
                  state
                  name
                  createdAt
                }
                nodeContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, limit: $nodeContractsCount) {
                  contractID
                  deploymentData
                  state
                  createdAt
                  nodeID
                }
                rentContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, limit: $rentContractsCount) {
                  contractID
                  state
                  createdAt
                  nodeID
                }
              }`;
      const response = await gqlClient.query(body, {
        nodeContractsCount: nodeContractsCount,
        nameContractsCount: nameContractsCount,
        rentContractsCount: rentContractsCount,
      });

      return response["data"];
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
      const billReports = response["data"]["contractBillReports"];
      if (billReports.length === 0) {
        return 0;
      } else {
        let duration: number;
        const amountBilled = new Decimal(billReports[0]["amountBilled"]);
        if (billReports.length === 2) {
          duration = (billReports[0]["timestamp"] - billReports[1]["timestamp"]) / 3600; // one hour
        } else {
          const nodeContracts = response["data"]["nodeContracts"];
          const nameContracts = response["data"]["nameContracts"];
          const rentContracts = response["data"]["rentContracts"];
          let createdAt: number;
          for (const contracts of [nodeContracts, nameContracts, rentContracts]) {
            if (contracts.length === 1) {
              createdAt = contracts[0]["createdAt"];
            }
            duration = (billReports[0]["timestamp"] - createdAt) / 3600;
            break;
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

  async listMyContracts(options: ListMyContractOptions) {
    const twinId = await this.client.twins.getMyTwinId();
    return await this.listContractsByTwinId({
      graphqlURL: options.graphqlURL,
      twinId: twinId,
      stateList: options.stateList,
    });
  }

  /**
   * WARNING: Please be careful when executing this method, it will delete all your contracts.
   * @param  {CancelMyContractOptions} options
   * @returns {Promise<Record<string, number>[]>}
   */
  async cancelMyContracts(options: CancelMyContractOptions): Promise<Record<string, number>[]> {
    const allContracts = await this.listMyContracts(options);
    const contracts = [
      ...allContracts["nameContracts"],
      ...allContracts["nodeContracts"],
      ...allContracts["rentContracts"],
    ];
    const ids: number[] = [];
    for (const contract of contracts) {
      ids.push(contract["contractID"]);
    }
    await this.batchCancelContracts(ids);
    return contracts;
  }

  async batchCancelContracts(ids: number[]): Promise<number[]> {
    const extrinsics = [];
    for (const id of ids) {
      extrinsics.push(await this.cancel({ id }));
    }
    await this.client.applyAllExtrinsics(extrinsics);
    return ids;
  }
}

export { TFContracts };
