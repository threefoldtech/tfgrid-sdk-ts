import { FilterOptions, GatewayNameModel, generateString, GridClient, MachinesModel, randomChoice } from "../../src";
import { config, getClient } from "../client_loader";
import { generateInt, log, splitIP } from "../utils";

const exec = require("child_process").exec;

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test("TC1237 - Gateways: Expose a VM Over Gateway", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1237 - Gateways: Expose a VM Over Gateway
     Scenario:
        - Generate Test Data/VM Config/Gateway Config.
        - Select a Node To Deploy the VM on.
        - Select a Gateway Node To Deploy the gateway on.
        - Deploy the VM.
        - Assert that the generated data matches
          the deployment details.
        - Pass the IP of the Created VM to the Gateway
          Config.
        - Deploy the Gateway
        - Assert that the generated data matches
          the deployment details.
        - Assert that the Gateway points at the IP
          of the created VM.
        - Assert that the returned domain is working
          and returns correct data.
    **********************************************/

    //Test Data
    const name = "gw" + generateString(10).toLowerCase();
    const tlsPassthrough = false;
    let cpu = generateInt(1, 4);
    let memory = generateInt(256, 4096);
    let rootfsSize = generateInt(2, 5);
    const deploymentName = generateString(15);
    const networkName = generateString(15);
    const vmName = generateString(15);
    const disks = [];
    const publicIp = false;
    const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
    const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
    const ipRangeClassC = "192.168.0.0/16";
    const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
    const metadata = "{'deploymentType': 'vm'}";
    const description = "test deploying VMs via ts grid3 client";
    const envVarValue = generateString(30);

    //GatewayNode Selection
    const gatewayNodes = await gridClient.capacity.filterNodes({
        gateway: true,
        farmId: 1,
        availableFor: await gridClient.twins.get_my_twin_id(),
    } as FilterOptions);
    const gatewayNodeId = +randomChoice(gatewayNodes).nodeId;

    //Node Selection
    let nodes;
    try {
        nodes = await gridClient.capacity.filterNodes({
            cru: cpu,
            mru: memory / 1024,
            sru: rootfsSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        cpu = generateInt(1, cpu);
        memory = generateInt(256, memory);
        rootfsSize = generateInt(2, rootfsSize);

        //Search for another node with lower resources.
        nodes = await gridClient.capacity.filterNodes({
            cru: cpu,
            mru: memory / 1024,
            sru: rootfsSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }
    const nodeId = +randomChoice(nodes).nodeId;

    //VM Model
    const vms: MachinesModel = {
        name: deploymentName,
        network: {
            name: networkName,
            ip_range: ipRange,
        },
        machines: [
            {
                name: vmName,
                node_id: nodeId,
                cpu: cpu,
                memory: memory,
                rootfs_size: rootfsSize,
                disks: disks,
                flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
                entrypoint: "/usr/bin/python3 -m http.server --bind ::",
                public_ip: publicIp,
                planetary: true,
                env: {
                    SSH_KEY: config.ssh_key,
                    Test_KEY: envVarValue,
                },
                solutionProviderID: null,
            },
        ],
        metadata: metadata,
        description: description,
    };
    const res = await gridClient.machines.deploy(vms);
    log(res);

    //Contracts Assertions
    expect(res.contracts.created).toHaveLength(2);
    expect(res.contracts.updated).toHaveLength(0);
    expect(res.contracts.deleted).toHaveLength(0);

    const vmsList = await gridClient.machines.list();
    log(vmsList);

    //VM List Assertions
    expect(vmsList.length).toBeGreaterThanOrEqual(1);
    expect(vmsList).toContain(vms.name);

    const result = await gridClient.machines.getObj(vms.name);
    log(result);

    //VM Assertions
    expect(result[0].nodeId).toBe(nodeId);
    expect(result[0].status).toBe("ok");
    expect(result[0].flist).toBe(vms.machines[0].flist);
    expect(result[0].entrypoint).toBe(vms.machines[0].entrypoint);
    expect(result[0].mounts).toHaveLength(0);
    expect(result[0].interfaces[0]["network"]).toBe(vms.network.name);
    expect(result[0].interfaces[0]["ip"]).toContain(splitIP(vms.network.ip_range));
    expect(result[0].interfaces[0]["ip"]).toMatch(ipRegex);
    expect(result[0].capacity["cpu"]).toBe(cpu);
    expect(result[0].capacity["memory"]).toBe(memory);
    expect(result[0].planetary).toBeDefined();
    expect(result[0].publicIP).toBeNull();
    expect(result[0].metadata).toBe(metadata);
    expect(result[0].description).toBe(description);

    const backends = ["http://[" + result[0].planetary + "]:8000"];
    log(backends);

    //Name Gateway Model
    const gw: GatewayNameModel = {
        name: name,
        node_id: gatewayNodeId,
        tls_passthrough: tlsPassthrough,
        backends: backends,
    };

    const gatewayRes = await gridClient.gateway.deploy_name(gw);
    log(gatewayRes);

    //Contracts Assertions
    expect(gatewayRes.contracts.created).toHaveLength(1);
    expect(gatewayRes.contracts.updated).toHaveLength(0);
    expect(gatewayRes.contracts.deleted).toHaveLength(0);
    expect(gatewayRes.contracts.created[0].contractType.nodeContract.nodeId).toBe(gatewayNodeId);

    const gatewayResult = await gridClient.gateway.getObj(gw.name);
    log(gatewayResult);

    //Gateway Assertions
    expect(gatewayResult[0].name).toBe(name);
    expect(gatewayResult[0].status).toBe("ok");
    expect(gatewayResult[0].type).toContain("name");
    expect(gatewayResult[0].domain).toContain(name);
    expect(gatewayResult[0].tls_passthrough).toBe(tlsPassthrough);
    expect(gatewayResult[0].backends).toStrictEqual(backends);

    const domain = "https://" + gatewayResult[0].domain;

    //Verify that the domain points to VM and lists the directories available in the VM
    exec("curl " + domain, function (_, stdout) {
        log(stdout);
        expect(stdout).toContain("Directory listing for /");
        expect(stdout).toContain("bin/");
        expect(stdout).toContain("dev/");
        expect(stdout).toContain("etc/");
    });
});

afterEach(async () => {
    const vmNames = await gridClient.machines.list();
    for (const name of vmNames) {
        const res = await gridClient.machines.delete({ name });
        log(res);
        expect(res.created).toHaveLength(0);
        expect(res.updated).toHaveLength(0);
        expect(res.deleted).toBeDefined();
    }

    const gwNames = await gridClient.gateway.list();
    for (const name of gwNames) {
        const res = await gridClient.gateway.delete_name({ name });
        log(res);
        expect(res.created).toHaveLength(0);
        expect(res.updated).toHaveLength(0);
        expect(res.deleted).toBeDefined();
    }
});

afterAll(async () => {
    return await gridClient.disconnect();
});
