import {
    ContractGetByNodeIdAndHashModel,
    FilterOptions,
    generateString,
    GridClient,
    NameContractCreateModel,
    NameContractGetModel,
    NodeContractCreateModel,
    NodeContractUpdateModel,
    randomChoice,
} from "../../src";
import { getClient } from "../client_loader";
import { generateHash, log } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

test("TC1269 - Contracts: Create Node Contract", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1269 - Contracts: Create Node Contract
     Scenario:
        - Generate Test Data/Contract Details.
        - Create the Node Contract.
        - Assert that the data of the created contract
          matches the generated data.
    **********************************************/

    //TestData
    const nodes = await gridClient.capacity.filterNodes({
        availableFor: await gridClient.twins.get_my_twin_id(),
        farmId: 1,
    } as FilterOptions);
    const nodeId = +randomChoice(nodes).nodeId;
    const hash = generateHash(generateString(8));
    const data = generateString(64);
    const publicIp = 0;
    const twinId = await gridClient.twins.get_my_twin_id();

    //Create Node Contract
    const contract: NodeContractCreateModel = {
        node_id: nodeId,
        hash: hash,
        data: data,
        public_ip: publicIp,
    };
    const res = await gridClient.contracts.create_node(contract);
    log(res);

    expect(res.contractId).toBeDefined();
    expect(res.twinId).toBe(twinId);
    expect(res.contractType.nodeContract.nodeId).toBe(nodeId);
    expect(res.contractType.nodeContract.deploymentHash).toBeDefined();
    expect(res.contractType.nodeContract.deploymentData).toBeDefined();
    expect(res.contractType.nodeContract.publicIps).toBe(publicIp);
});

test("TC1270 - Contracts: Create Name Contract", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1270 - Contracts: Create Name Contract
     Scenario:
        - Generate Test Data/Contract Details.
        - Create the Name Contract.
        - Assert that the data of the created contract
          matches the generated data.
    **********************************************/

    //TestData
    const name = generateString(15).toLowerCase();
    const twinId = await gridClient.twins.get_my_twin_id();

    //Create Name Contract
    const contract: NameContractCreateModel = {
        name: name,
    };
    const res = await gridClient.contracts.create_name(contract);
    log(res);

    expect(res.contractId).toBeDefined();
    expect(res.twinId).toBe(twinId);
    expect(res.contractType.nameContract.name).toBeDefined();
});

test("TC1271 - Contracts: Get Node Contract By Node ID & Contract Hash", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1271 - Contracts: Get Node Contract By Node ID & Contract Hash
     Scenario:
        - Generate Test Data/Contract Details.
        - Create the Node Contract.
        - Assert that the data of the created contract
          matches the generated data.
        - Get the contract By Node ID & Hash.
        - Assert that the returned contract ID is the
          same ID of the created contract.
    **********************************************/

    //TestData
    const nodes = await gridClient.capacity.filterNodes({
        availableFor: await gridClient.twins.get_my_twin_id(),
        farmId: 1,
    } as FilterOptions);
    const nodeId = +randomChoice(nodes).nodeId;
    const hash = generateHash(generateString(8));
    const data = generateString(64);
    const publicIp = 0;
    const twinId = await gridClient.twins.get_my_twin_id();

    // Create Contract
    const contract: NodeContractCreateModel = {
        node_id: nodeId,
        hash: hash,
        data: data,
        public_ip: publicIp,
    };
    const res = await gridClient.contracts.create_node(contract);
    log(res);

    //Get Contract
    const getContract: ContractGetByNodeIdAndHashModel = {
        node_id: nodeId,
        hash: hash,
    };
    const newRes = await gridClient.contracts.get_contract_id_by_node_id_and_hash(getContract);
    log(newRes);

    expect(newRes).toBe(res.contractId);
});

test("TC1272 - Contracts: Get Name Contract", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1272 - Contracts: Get Name Contract
     Scenario:
        - Generate Test Data/Contract Details.
        - Create the Name Contract.
        - Assert that the data of the created contract
          matches the generated data.
        - Get the contract ID.
        - Assert that the returned contract ID is the
          same ID of the created contract.
    **********************************************/

    //TestData
    const name = generateString(15).toLowerCase();
    const twinId = await gridClient.twins.get_my_twin_id();

    //Create Contract
    const contract: NameContractCreateModel = {
        name: name,
    };
    const res = await gridClient.contracts.create_name(contract);
    log(res);

    //Get Contract
    const getContract: NameContractGetModel = {
        name: name,
    };
    const newRes = await gridClient.contracts.get_name_contract(getContract);
    log(newRes);

    expect(newRes).toBe(res.contractId);
});

test("TC1273 - Contracts: Update Node Contract", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1273 - Contracts: Update Node Contract
     Scenario:
        - Generate Test Data/Contract Details.
        - Create the Node Contract.
        - Assert that the data of the created contract
          matches the generated data.
        - Update the contract with new Hash & Data.
        - Assert that the data of the updated contract
          matches the new data.
        - Assert that the returned contract ID is the
          same ID of the created contract.
    **********************************************/

    //TestData
    const nodes = await gridClient.capacity.filterNodes({
        availableFor: await gridClient.twins.get_my_twin_id(),
        farmId: 1,
    } as FilterOptions);
    const nodeId = +randomChoice(nodes).nodeId;
    const hash = generateHash(generateString(8));
    const data = generateString(64);
    const newHash = generateHash(generateString(8));
    const newData = generateString(64);
    const publicIp = 0;
    const twinId = await gridClient.twins.get_my_twin_id();

    // Create Contract
    const contract: NodeContractCreateModel = {
        node_id: nodeId,
        hash: hash,
        data: data,
        public_ip: publicIp,
    };
    const res = await gridClient.contracts.create_node(contract);
    log(res);

    //Store the ID of the created Contract
    const contractId = res.contractId;

    //Update Contract
    const getContract: NodeContractUpdateModel = {
        id: contractId,
        hash: newHash,
        data: newData,
    };
    const newRes = await gridClient.contracts.update_node(getContract);
    log(newRes);

    expect(newRes.contractId).toBe(contractId);
    expect(newRes.twinId).toBe(twinId);
    expect(newRes.contractType.nodeContract.nodeId).toBe(nodeId);
    expect(newRes.contractType.nodeContract.deploymentHash).toBeDefined();
    expect(newRes.contractType.nodeContract.deploymentData).toBeDefined();
});

afterEach(async () => {
    await gridClient.contracts
        .cancelMyContracts()
        .then(cancellation_res => {
            log(cancellation_res);
            expect(cancellation_res).toBeDefined();
        })
        .catch(err => {
            throw err;
        });
});

afterAll(async () => {
    return await gridClient.disconnect();
});
