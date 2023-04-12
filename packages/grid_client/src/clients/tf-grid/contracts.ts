import { Decimal } from "decimal.js";

import { ContractStates } from "../../modules";
import { Graphql } from "../graphql/client";
import { TFClient } from "./client";

const TWO_WEEKS = 1209600000;

class Contracts {
    tfclient: TFClient;

    constructor(client: TFClient) {
        this.tfclient = client;
    }
    async createNode(nodeID: number, hash: string, data: string, publicIPs: number, solutionProviderID: number) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.createNodeContract,
            [nodeID, data, hash, publicIPs, solutionProviderID],
            "smartContractModule",
            ["ContractCreated"],
        );
    }

    async createName(name: string) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.createNameContract,
            [name],
            "smartContractModule",
            ["ContractCreated"],
        );
    }

    async createRentContract(nodeId: number, solutionProviderID: number) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.createRentContract,
            [nodeId, solutionProviderID],
            "smartContractModule",
            ["ContractCreated"],
        );
    }

    async activeRentContractForNode(nodeId: number) {
        return await this.tfclient.queryChain(this.tfclient.client.activeRentContractForNode, [nodeId]);
    }

    async updateNode(id: number, data: string, hash: string) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.updateNodeContract,
            [id, data, hash],
            "smartContractModule",
            ["ContractUpdated"],
        );
    }

    async cancel(id: number) {
        const contract = await this.get(id);
        if (!contract) {
            return id;
        }
        return await this.tfclient.applyExtrinsic(this.tfclient.client.cancelContract, [id], "smartContractModule", [
            "NodeContractCanceled",
            "NameContractCanceled",
            "RentContractCanceled",
            "ContractCanceled",
        ]);
    }

    async createServiceContract(serviceAccount: string, consumerAccount: string) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.createServiceContract,
            [serviceAccount, consumerAccount],
            "smartContractModule",
            ["ServiceContractCreated"],
        );
    }

    async serviceContractApprove(serviceContractId: number, approve: boolean) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.serviceContractApprove,
            [serviceContractId, approve],
            "smartContractModule",
            ["ServiceContractApproved"],
        );
    }

    async serviceContractBill(serviceContractId: number, variableAmount: number, metadata: string) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.serviceContractBill,
            [serviceContractId, variableAmount, metadata],
            "smartContractModule",
            ["ServiceContractBilled"],
        );
    }

    async serviceContractCancel(serviceContractId: number) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.serviceContractCancel,
            [serviceContractId],
            "smartContractModule",
            ["ServiceContractCanceled"],
        );
    }

    async setServiceContractFees(serviceContractId: number, baseFee: number, variableFee: number) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.setServiceContractFees,
            [serviceContractId, baseFee, variableFee],
            "smartContractModule",
            ["ServiceContractFeesSet"],
        );
    }

    async setServiceContractMetadata(serviceContractId: number, metadata: string) {
        return await this.tfclient.applyExtrinsic(
            this.tfclient.client.setServiceContractMetadata,
            [serviceContractId, metadata],
            "smartContractModule",
            ["ServiceContractMetadataSet"],
        );
    }

    async getServiceContract(serviceContractId: number) {
        return await this.tfclient.queryChain(this.tfclient.client.getServiceContract, [serviceContractId]);
    }
    async get(id: number) {
        return this.tfclient
            .queryChain(this.tfclient.client.getContractByID, [id])
            .then(res => {
                return res;
            })
            .catch(err => {
                throw Error(`Error getting contract ${id}: ${err}`);
            });
    }

    async getContractIdByNodeIdAndHash(nodeId: number, hash: string) {
        return await this.tfclient.queryChain(this.tfclient.client.contractIDByNodeIDAndHash, [nodeId, hash]);
    }

    async getNameContract(name: string) {
        return await this.tfclient.queryChain(this.tfclient.client.contractIDByNameRegistration, [name]);
    }

    async listContractsByTwinId(
        graphqlURL,
        twinId,
        stateList: ContractStates[] = [ContractStates.Created, ContractStates.GracePeriod],
    ) {
        const state = `[${stateList.join(", ")}]`;
        const gqlClient = new Graphql(graphqlURL);
        const options = `(where: {twinID_eq: ${twinId}, state_in: ${state}}, orderBy: twinID_ASC)`;
        try {
            const nameContractsCount = await gqlClient.getItemTotalCount("nameContracts", options);
            const nodeContractsCount = await gqlClient.getItemTotalCount("nodeContracts", options);
            const rentContractsCount = await gqlClient.getItemTotalCount("rentContracts", options);
            const body = `query getContracts($nameContractsCount: Int!, $nodeContractsCount: Int!, $rentContractsCount: Int!){
                nameContracts(where: {twinID_eq: ${twinId}, state_in: ${state}}, limit: $nameContractsCount) {
                  contractID
                  state
                  name
                  createdAt
                }
                nodeContracts(where: {twinID_eq: ${twinId}, state_in: ${state}}, limit: $nodeContractsCount) {
                  contractID
                  deploymentData
                  state
                  createdAt
                  nodeID
                }
                rentContracts(where: {twinID_eq: ${twinId}, state_in: ${state}}, limit: $rentContractsCount) {
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
            throw Error(`Error listing contracts by twin id ${twinId}: ${err}`);
        }
    }
    /**
     * Get contract consumption per hour in TFT.
     *
     * @param  {number} id
     * @param  {string} graphqlURL
     * @returns {Promise<number>}
     */
    async getConsumption(id: number, graphqlURL: string): Promise<number> {
        const gqlClient = new Graphql(graphqlURL);
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
            const response = await gqlClient.query(body, { contractId: id });
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
            throw Error(`Error getting consumption for contract ${id}: ${err}`);
        }
    }

    async listContractsByAddress(graphqlURL, address) {
        const twinId = await this.tfclient.twins.getTwinIdByAccountId(address);
        return await this.listContractsByTwinId(graphqlURL, twinId);
    }

    async listMyContracts(graphqlURL, state?: ContractStates[]) {
        const twinId = await this.tfclient.twins.getMyTwinId();
        return await this.listContractsByTwinId(graphqlURL, twinId, state);
    }

    /**
     * WARNING: Please be careful when executing this method, it will delete all your contracts.
     * @param  {string} graphqlURL
     * @returns Promise
     */
    async cancelMyContracts(graphqlURL: string): Promise<Record<string, number>[]> {
        const allContracts = await this.listMyContracts(graphqlURL);
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
            extrinsics.push(this.tfclient.client.api.tx.smartContractModule.cancelContract(id));
        }
        await this.tfclient.utility.batchAll(extrinsics);
        return ids;
    }

    async getDeletionTime(contractId: number): Promise<number> {
        const contract = await this.get(contractId);
        if (!contract || contract.state.created === null) return 0;

        const blockNumber = contract.state["gracePeriod"];

        try {
            const currentBlockNumber = +(await this.tfclient.queryChain(
                this.tfclient.client.api.query.system.number,
                [],
            ));

            // each block takes 6 seconds
            const gracePeriodStartTime = new Date().getTime() - (currentBlockNumber - blockNumber) * 6000;

            return gracePeriodStartTime + TWO_WEEKS;
        } catch (err) {
            throw Error(`Error getting current block number for contract ${contractId} deletion: ${err}`);
        }
    }
}

export { Contracts };
