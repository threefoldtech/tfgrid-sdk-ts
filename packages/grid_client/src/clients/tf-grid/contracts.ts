import GridProxyClient, {
  CertificationType,
  Contract as ProxyContract,
  ContractState,
  ContractType,
  Resources,
} from "@threefold/gridproxy_client";
import {
  BillingInformation,
  ContractLock,
  ContractLockOptions,
  Contracts,
  ExtrinsicResult,
  GetDedicatedNodePriceOptions,
  NodeContractUsedResources,
  SetDedicatedNodeExtraFeesOptions,
} from "@threefold/tfchain_client";
import { GridClientError } from "@threefold/types";
import { Decimal } from "decimal.js";

import { formatErrorMessage } from "../../helpers";
import { calculator, ContractStates } from "../../modules";
import { Graphql } from "../graphql/client";

export type DiscountLevel = "None" | "Default" | "Bronze" | "Silver" | "Gold";

export interface ListContractByTwinIdOptions {
  graphqlURL: string;
  twinId: number;
  stateList?: ContractStates[];
  type?: string;
  projectName?: string;
  nodeId?: number;
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
  updatedAt: string;
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
  resourcesUsed: ContractUsedResources | undefined;
  parsedDeploymentData?: { type: string; name: string; projectName: string };
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
  contractBillReports: GqlContractBillReports[];
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
  type?: string;
  projectName?: string;
  nodeId?: number;
}

export interface GetConsumptionOptions {
  graphqlURL: string;
  id: number;
}

export interface CancelMyContractOptions {
  graphqlURL: string;
}

export type LockDetails = { [key: number]: ContractLock };
export interface LockContracts {
  nameContracts: LockDetails;
  nodeContracts: LockDetails;
  rentContracts: LockDetails;
  totalAmountLocked: number;
}
interface CalcResourcesPrice extends Resources {
  certified: boolean;
  ipv4: number;
  calculator: calculator;
}

export interface CalculateOverdueOptions {
  contractID: number;
  gridProxyClient: GridProxyClient;
}

const SECONDS_ONE_HOUR = 60 * 60;

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
      (err as Error).message = formatErrorMessage(`Error listing contracts by twin id ${options.twinId}.`, err);
      throw err;
    }
  }

  async listNodeContractsByTwinId(options: ListContractByTwinIdOptions): Promise<GqlNodeContract[]> {
    options.stateList = options.stateList || [ContractStates.Created, ContractStates.GracePeriod];
    const state = `[${options.stateList.join(", ")}]`;
    const gqlClient = new Graphql(options.graphqlURL);
    const opts = `(where: {twinID_eq: ${options.twinId}, state_in: ${state}}, orderBy: twinID_ASC)`;

    // filter contracts based on deploymentData
    let filterQuery = "";
    if (options.nodeId) {
      filterQuery += ` , nodeID_eq: ${options.nodeId}`;
    }
    if (options.type || options.projectName) {
      filterQuery += " , AND: [";

      if (options.type) {
        // eslint-disable-next-line no-useless-escape
        filterQuery += `{ deploymentData_contains: \"\\\"type\\\":\\\"${options.type}\\\"\" },`;
      }

      if (options.projectName) {
        // eslint-disable-next-line no-useless-escape
        filterQuery += `{ deploymentData_contains: \"\\\"projectName\\\":\\\"${options.projectName}\" }`;
      }

      filterQuery += "]";
    }

    try {
      const nodeContractsCount = await gqlClient.getItemTotalCount("nodeContracts", opts);
      const body = `query getContracts($nodeContractsCount: Int!){
                nodeContracts(where: {twinID_eq: ${options.twinId}, state_in: ${state}${filterQuery}}, limit: $nodeContractsCount) {
                  contractID
                  deploymentData
                  state
                  createdAt
                  nodeID
                  numberOfPublicIPs
                }
              }`;
      const response = await gqlClient.query(body, {
        nodeContractsCount,
      });

      return (response["data"] as GqlContracts).nodeContracts;
    } catch (err) {
      (err as Error).message = formatErrorMessage(`Error listing contracts by twin id ${options.twinId}.`, err);
      throw err;
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
      const billReports = gqlConsumption.contractBillReports;
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
      (err as Error).message = formatErrorMessage(`Error getting consumption for contract ${options.id}.`, err);
      throw err;
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

  async listMyNodeContracts(options: ListMyContractOptions): Promise<GqlNodeContract[]> {
    const twinId = await this.client.twins.getMyTwinId();
    return await this.listNodeContractsByTwinId({
      graphqlURL: options.graphqlURL,
      twinId: twinId,
      stateList: options.stateList,
      type: options.type,
      projectName: options.projectName,
      nodeId: options.nodeId,
    });
  }

  async contractLock(options: ContractLockOptions) {
    const res = await super.contractLock(options);
    const amountLocked = new Decimal(res.amountLocked);
    res.amountLocked = amountLocked.div(10 ** 7).toNumber();
    return res;
  }

  /**
   * Retrieves the `payment state` of a contract based on the provided `contract ID`.
   *
   * @param contractID - The ID for which contract to retrieve its `payment state`.
   * @returns {Promise<ContractLock>} A Promise that resolves to the `ContractPaymentState` of the specified contract.
   */
  async getContractPaymentState(contractID: number) {
    return this.client.contracts.getContractPaymentState(contractID);
  }

  private async getNodeDetailsById(nodeID: number, proxy: GridProxyClient) {
    return await proxy.nodes.byId(nodeID);
  }

  private async getContractInfoByContractId(id: number, proxy: GridProxyClient) {
    const res = await proxy.contracts.list({ contractId: id });
    return res["data"][0];
  }

  private async convertTomTFT(mUSD: Decimal) {
    try {
      const tftPrice = (await this.client.tftPrice.get()) ?? 0;
      const tft = mUSD.div(tftPrice);
      return tft.mul(10 ** 7);
    } catch (error) {
      throw new GridClientError(`Failed to convert to mTFT due: ${error}`);
    }
  }

  private async getContractsCostOnRentedNode(nodeId: number, proxy: GridProxyClient) {
    const contracts = await proxy.contracts.list({ nodeId, state: [ContractState.GracePeriod], numberOfPublicIps: 1 });
    const ipPrice = (await this.client.pricingPolicies.get({ id: 1 })).ipu.value;
    const BillingInformationPromises = contracts.data.reduce((acc: Promise<BillingInformation>[], contract) => {
      acc.push(this.client.contracts.getContractBillingInformationByID(contract.contract_id));
      return acc;
    }, []);

    const cost = await Promise.all(BillingInformationPromises);
    const totalNUCost = cost.reduce((acc: number, billingInfo) => acc + billingInfo.amountUnbilled, 0);
    const totalIPCost = ipPrice * (contracts.count || 0);

    //Todo verify the contract nu cost as it always added to the overdue amount whatever the contract type is.
    return totalNUCost + totalIPCost;
  }

  private async calcResourcesPrice(options: CalcResourcesPrice) {
    const { cru, hru, sru, mru, calculator, ipv4, certified } = options;
    const res = await calculator.calculateWithMyBalance({
      cru,
      mru: mru / Math.pow(1024, 3),
      sru: sru / Math.pow(1024, 3),
      hru: hru / Math.pow(1024, 3),
      certified,
      ipv4u: !!ipv4,
    });

    return {
      dedicatedPrice: res.dedicatedPrice,
      sharedPrice: res.sharedPrice,
    };
  }

  async getContractCost(contract: ProxyContract, elapsedSeconds: number, proxy: GridProxyClient) {
    const calc = new calculator(this.client);

    if (contract.type == ContractType.Name) {
      const mUSDCostPerSecond = await calc.namePricing({ elapsedSeconds: elapsedSeconds });
      /** return cost per month */
      return mUSDCostPerSecond * 60 * 60 * 24 * 30;
    }

    //TODO allow ipv4 to be number

    /** Other contract types need the node information */
    const nodeDetails = await proxy.nodes.byId(contract.details.nodeId);

    const certified = nodeDetails.certificationType == CertificationType.Certified ? true : false;

    if (contract.type == ContractType.Rent) {
      // get the contracts on the rented node, calculate the nu, then add the ipv4 cost
      const totalContractsCost = await this.getContractsCostOnRentedNode(contract.details.nodeId, proxy);

      const mUSDCost = (
        await this.calcResourcesPrice({
          calculator: calc,
          ipv4: 0,
          certified,
          ...nodeDetails.total_resources,
        })
      ).dedicatedPrice;

      /**returns the cost of renting the node with its contracts cost */
      return (await this.convertTomTFT(new Decimal(mUSDCost))).add(totalContractsCost);
    }

    /** Node contract on rented node */
    //TODO should be verified
    if (nodeDetails.rented) return 0;

    /**2 cases 
    --> if resume rent contract resume its node contracts ---> should be handled in UI, will return zero,
    TODO add ipv4 
    --> if not should handled 
    */

    /** Node Contract */
    const usedREsources: NodeContractUsedResources = await this.client.contracts.getNodeContractResources({
      id: contract.contract_id,
    });

    const mUSDCost = (
      await this.calcResourcesPrice({
        calculator: calc,
        ...usedREsources.used,
        certified,
        ipv4: contract.details.number_of_public_ips ?? 0,
      })
    ).sharedPrice;

    return await this.convertTomTFT(new Decimal(mUSDCost));
  }

  /**
   * Calculates the overdue amount for a contract.
   *
   * This method calculates the overdue amount by summing the overdraft amounts
   * from the contract payment state and  the unbilled network usage then sum the total by the product of:
   * 1. The time elapsed since the last billing in seconds (with an additional time allowance).
   * 2. The contract cost per second.
   *
   * The resulting overdue amount represents the amount that needs to be addressed.
   *
   * @param {CalculateOverdueOptions} options - The options containing the contract ID.
   * @returns {Promise<number>} - The calculated overdue amount.
   */
  async calculateContractOverDue(options: CalculateOverdueOptions) {
    //init clients

    const contractInfo = await this.getContractInfoByContractId(options.contractID, options.gridProxyClient);

    /** Get the Un-billed amount for the network usage */
    const unbilledNU = (await this.client.contracts.getContractBillingInformationByID(contractInfo.contract_id))
      .amountUnbilled;

    const { standardOverdraft, additionalOverdraft, lastUpdatedSeconds } =
      await this.client.contracts.getContractPaymentState(options.contractID);

    /**Calculate the elapsed seconds since last pilling*/
    const elapsedSeconds = Date.now() / 1000 - lastUpdatedSeconds;

    const contractMonthlyCost = new Decimal(await this.getContractCost(contractInfo, elapsedSeconds, proxy));

    /**Calculate total over overDraft added to the NU unbilled amount*/
    const totalOverDraft = new Decimal(standardOverdraft).add(additionalOverdraft);

    // time since the last billing with allowance time of **one hour**
    const totalPeriodTime = elapsedSeconds + SECONDS_ONE_HOUR;

    //mUSD
    const contractCostPerSecond = contractMonthlyCost.div(30 * 24 * SECONDS_ONE_HOUR);

    const mTFTCost = await this.convertTomTFT(contractCostPerSecond);

    // cost of the current billing period with the mentioned allowance time
    const totalPeriodCost = mTFTCost.times(totalPeriodTime);

    const mTFTOverdue = totalOverDraft.add(totalPeriodCost).add(unbilledNU);
    const overdueTFTs = mTFTOverdue.div(10 ** 7);
    return overdueTFTs;
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

  //TODO refactor unlock functions to use new calculation in the conditions

  async batchCancelContracts(ids: number[]): Promise<number[]> {
    const extrinsics: ExtrinsicResult<number>[] = [];
    for (const id of ids) {
      extrinsics.push(await this.cancel({ id }));
    }
    await this.client.applyAllExtrinsics(extrinsics);
    return ids;
  }

  async batchUnlockContracts(ids: number[], proxy: GridProxyClient) {
    const billableContractsIDs: number[] = [];
    //Todo could be parallel
    for (const id of ids) {
      const contractOverdue = (
        await this.calculateContractOverDue({ contractID: id, gridProxyClient: proxy })
      ).toNumber();
      if (contractOverdue > 0) billableContractsIDs.push(id);
    }
    const extrinsics: ExtrinsicResult<number>[] = [];
    for (const id of billableContractsIDs) {
      extrinsics.push(await this.unlock(id));
    }
    return this.client.applyAllExtrinsics(extrinsics);
  }

  async unlockMyContracts(gridProxyUrl: string) {
    const proxy = new GridProxyClient(gridProxyUrl);

    const contracts = await proxy.contracts.list({
      state: [ContractState.GracePeriod],
      twinId: await this.client.twins.getMyTwinId(),
    });

    const ids: number[] = contracts.data.map(contract => contract.contract_id);

    return await this.batchUnlockContracts(ids, proxy);
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
