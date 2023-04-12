import { setTimeout } from "timers/promises";

import {
    AddWorkerModel,
    DeleteWorkerModel,
    FilterOptions,
    generateString,
    GridClient,
    K8SModel,
    randomChoice,
} from "../../src";
import { config, getClient } from "../client_loader";
import { bytesToGB, generateInt, log, RemoteRun, splitIP } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
    return (gridClient = await getClient());
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

// Skipped until this issue is fixed: https://github.com/threefoldtech/tf-images/issues/133
test.skip("TC1231 - Kubernetes: Deploy a Kubernetes Cluster (https://github.com/threefoldtech/tf-images/issues/133)", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1231 - Kubernetes: Deploy a Kubernetes Cluster
     Scenario:
        - Generate Test Data/Master Config/Worker Config.
        - Select Two Different Nodes To Deploy the Master
          and Worker on.
        - Deploy the Kubernetes Cluster.
        - Assert that the generated data matches
          the deployment details.
        - SSH to the Master and Verify that you can
          access it.
        - Verify the resources of the Master & Worker.
        - Assert that the Master and Worker are available
          when you execute `kubectl get nodes`.
    **********************************************/

    //Test Data
    const deploymentName = "K8s" + generateString(5);
    const secret = generateString(15);
    const networkName = generateString(15);
    const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
    const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
    const ipRangeClassC = "192.168.0.0/16";
    const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
    const masterName = "MR" + generateString(5);
    let masterCpu = generateInt(1, 4);
    let masterMemory = generateInt(1024, 4096);
    let masterRootfsSize = generateInt(2, 5);
    let masterDiskSize = generateInt(1, 20);
    const masterPublicIp = false;
    const workerName = "WR" + generateString(5);
    let workerCpu = generateInt(1, 4);
    let workerMemory = generateInt(1024, 4096);
    let workerRootfsSize = generateInt(2, 5);
    let workerDiskSize = generateInt(1, 20);
    const workerPublicIp = false;
    const metadata = "{'deploymentType':'k8s'}";
    const description = "test deploying k8s via ts grid3 client";

    //Master Node Selection
    let masterNode;
    try {
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        masterCpu = generateInt(1, masterCpu);
        masterMemory = generateInt(1024, masterMemory);
        masterRootfsSize = generateInt(2, masterRootfsSize);
        masterDiskSize = generateInt(1, masterDiskSize);

        //Search for another node with lower resources.
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }

    //Worker Node Selection
    let workerNode;
    try {
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu,
            mru: workerMemory / 1024,
            sru: workerRootfsSize + workerDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        workerCpu = generateInt(1, workerCpu);
        workerMemory = generateInt(1024, workerMemory);
        workerRootfsSize = generateInt(2, workerRootfsSize);
        workerDiskSize = generateInt(1, workerDiskSize);

        //Search for another node with lower resources.
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu,
            mru: workerMemory / 1024,
            sru: workerRootfsSize + workerDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }
    const masterNodeId = +randomChoice(masterNode).nodeId;
    let workerNodeId = +randomChoice(workerNode).nodeId;
    while (masterNodeId == workerNodeId) {
        workerNodeId = +randomChoice(workerNode).nodeId;
    }

    //K8s Model
    const k8s: K8SModel = {
        name: deploymentName,
        secret: secret,
        network: {
            name: networkName,
            ip_range: ipRange,
        },
        masters: [
            {
                name: masterName,
                node_id: masterNodeId,
                cpu: masterCpu,
                memory: masterMemory,
                rootfs_size: masterRootfsSize,
                disk_size: masterDiskSize,
                public_ip: masterPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        workers: [
            {
                name: workerName,
                node_id: workerNodeId,
                cpu: workerCpu,
                memory: workerMemory,
                rootfs_size: workerRootfsSize,
                disk_size: workerDiskSize,
                public_ip: workerPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        metadata: metadata,
        description: description,
        ssh_key: config.ssh_key,
    };

    const res = await gridClient.k8s.deploy(k8s);
    log(res);

    //Contracts Assertions
    expect(res.contracts.created).toHaveLength(4);
    expect(res.contracts.updated).toHaveLength(0);
    expect(res.contracts.deleted).toHaveLength(0);

    const result = await gridClient.k8s.getObj(k8s.name);
    log(result);

    //Master Assertions
    expect(result.masters[0].nodeId).toBe(masterNodeId);
    expect(result.masters[0].status).toBe("ok");
    expect(result.masters[0].planetary).toBeDefined();
    expect(result.masters[0].publicIP).toBeNull();
    expect(result.masters[0].interfaces[0]["network"]).toBe(networkName);
    expect(result.masters[0].interfaces[0]["ip"]).toContain(splitIP(ipRange));
    expect(result.masters[0].interfaces[0]["ip"]).toMatch(ipRegex);
    expect(result.masters[0].capacity["cpu"]).toBe(masterCpu);
    expect(result.masters[0].capacity["memory"]).toBe(masterMemory);
    expect(result.masters[0].mounts[0]["size"]).toBe(bytesToGB(masterDiskSize));
    expect(result.masters[0].mounts[0]["state"]).toBe("ok");
    expect(result.masters[0].env["K3S_NODE_NAME"]).toBe(masterName);
    expect(result.masters[0].metadata).toBe(metadata);
    expect(result.masters[0].description).toBe(description);

    //Worker Assertions
    expect(result.workers[0].nodeId).toBe(workerNodeId);
    expect(result.workers[0].status).toBe("ok");
    expect(result.workers[0].planetary).toBeDefined();
    expect(result.workers[0].publicIP).toBeNull();
    expect(result.workers[0].interfaces[0]["network"]).toBe(networkName);
    expect(result.workers[0].interfaces[0]["ip"]).toContain(splitIP(ipRange));
    expect(result.workers[0].interfaces[0]["ip"]).toMatch(ipRegex);
    expect(result.workers[0].capacity["cpu"]).toBe(workerCpu);
    expect(result.workers[0].capacity["memory"]).toBe(workerMemory);
    expect(result.workers[0].mounts[0]["size"]).toBe(bytesToGB(workerDiskSize));
    expect(result.workers[0].mounts[0]["state"]).toBe("ok");
    expect(result.workers[0].env["K3S_NODE_NAME"]).toBe(workerName);
    expect(result.workers[0].metadata).toBe(metadata);
    expect(result.workers[0].description).toBe(description);

    const masterPlanetaryIp = result.masters[0].planetary;
    const workerPlanetaryIp = result.workers[0].planetary;
    const user = "root";

    //Wait for 20 seconds until the master is ready
    const wait = await setTimeout(20000, "Waiting for K8s to be ready");
    log(wait);

    //SSH to the master
    const masterSSH = await RemoteRun(masterPlanetaryIp, user);

    try {
        //Verify Master Resources(CPU)
        await masterSSH.execCommand("lscpu").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[4]);
            expect(splittedRes[4]).toContain(masterCpu.toString());
        });

        //Verify Master Resources(Memeory)
        await masterSSH.execCommand("free -m").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[1]);
            const memoryValue = splittedRes[1].match(/^\d+|\d+\b|\d+(?=\w)/g);
            expect(+memoryValue[0]).toBeGreaterThanOrEqual(masterMemory - masterMemory * 0.2);
            expect(+memoryValue[0]).toBeLessThan(masterMemory);
        });

        //Execute kubectl get nodes.
        await masterSSH.execCommand("kubectl get nodes").then(async function (result) {
            log(result.stdout);
            expect(result.stdout).toContain(masterName.toLowerCase());
            expect(result.stdout).toContain(workerName.toLowerCase());
        });
    } finally {
        //Disconnect from the master
        await masterSSH.dispose();
    }

    //SSH to the worker
    const workerSSH = await RemoteRun(workerPlanetaryIp, user);

    try {
        //Verify Worker Resources (CPU)
        await workerSSH.execCommand("lscpu").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[4]);
            expect(splittedRes[4]).toContain(workerCpu.toString());
        });

        //Verify Worker Resources (Memory)
        await workerSSH.execCommand("free -m").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[1]);
            const memoryValue = splittedRes[1].match(/^\d+|\d+\b|\d+(?=\w)/g);
            expect(+memoryValue[0]).toBeGreaterThanOrEqual(workerMemory - workerMemory * 0.2);
            expect(+memoryValue[0]).toBeLessThan(workerMemory);
        });
    } finally {
        //Disconnect from the worker
        await workerSSH.dispose();
    }
});

// Skipped until this issue is fixed: https://github.com/threefoldtech/tf-images/issues/133
test.skip("TC1232 - Kubernetes: Add Worker (https://github.com/threefoldtech/tf-images/issues/133)", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1232 - Kubernetes: Add Worker
     Scenario:
        - Generate Test Data/Master Config/Worker Config.
        - Select Two Different Nodes To Deploy the Master
          and Worker on.
        - Deploy the Kubernetes Cluster.
        - Assert that the generated data matches
          the deployment details.
        - SSH to the Master and Verify that you can
          access it.
        - Verify the resources of the Master & Worker.
        - Assert that the Master and Worker are available
          when you execute `kubectl get nodes`.
        - Deploy Another Worker and Assert that 
          its data matches the deployment details.
        - SSH to the Master again.
        - Assert that the New Worker is available
          when you execute `kubectl get nodes`.
        - Verify the resources of the New Worker.
    **********************************************/

    //Test Data
    const deploymentName = "K8s" + generateString(5);
    const secret = generateString(15);
    const networkName = generateString(15);
    const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
    const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
    const ipRangeClassC = "192.168.0.0/16";
    const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
    const masterName = "MR" + generateString(5);
    let masterCpu = generateInt(1, 4);
    let masterMemory = generateInt(1024, 4096);
    let masterRootfsSize = generateInt(2, 5);
    let masterDiskSize = generateInt(1, 20);
    const masterPublicIp = false;
    const workerName = "WR" + generateString(5);
    let workerCpu = generateInt(1, 4);
    let workerMemory = generateInt(1024, 4096);
    let workerRootfsSize = generateInt(2, 5);
    let workerDiskSize = generateInt(1, 20);
    const workerPublicIp = false;
    const metadata = "{'deploymentType':'k8s'}";
    const description = "test deploying k8s via ts grid3 client";
    const newWorkerName = "WR" + generateString(5);

    //Master Node Selection
    let masterNode;
    try {
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        masterCpu = generateInt(1, masterCpu);
        masterMemory = generateInt(1024, masterMemory);
        masterRootfsSize = generateInt(2, masterRootfsSize);
        masterDiskSize = generateInt(1, masterDiskSize);

        //Search for another node with lower resources.
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }

    //Worker Node Selection
    let workerNode;
    try {
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu * 2,
            mru: (workerMemory / 1024) * 2,
            sru: (workerRootfsSize + workerDiskSize) * 2,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        workerCpu = generateInt(1, workerCpu);
        workerMemory = generateInt(1024, workerMemory);
        workerRootfsSize = generateInt(2, workerRootfsSize);
        workerDiskSize = generateInt(1, workerDiskSize);

        //Search for another node with lower resources.
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu * 2,
            mru: (workerMemory / 1024) * 2,
            sru: (workerRootfsSize + workerDiskSize) * 2,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }
    const masterNodeId = +randomChoice(masterNode).nodeId;
    let workerNodeId = +randomChoice(workerNode).nodeId;
    while (masterNodeId == workerNodeId) {
        workerNodeId = +randomChoice(workerNode).nodeId;
    }

    //K8s Model
    const k8s: K8SModel = {
        name: deploymentName,
        secret: secret,
        network: {
            name: networkName,
            ip_range: ipRange,
        },
        masters: [
            {
                name: masterName,
                node_id: masterNodeId,
                cpu: masterCpu,
                memory: masterMemory,
                rootfs_size: masterRootfsSize,
                disk_size: masterDiskSize,
                public_ip: masterPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        workers: [
            {
                name: workerName,
                node_id: workerNodeId,
                cpu: workerCpu,
                memory: workerMemory,
                rootfs_size: workerRootfsSize,
                disk_size: workerDiskSize,
                public_ip: workerPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        metadata: metadata,
        description: description,
        ssh_key: config.ssh_key,
    };

    //Add Worker Model
    const worker: AddWorkerModel = {
        deployment_name: deploymentName,
        name: newWorkerName,
        node_id: workerNodeId,
        cpu: workerCpu,
        memory: workerMemory,
        rootfs_size: workerRootfsSize,
        disk_size: workerDiskSize,
        public_ip: workerPublicIp,
        public_ip6: false,
        planetary: true,
    };

    const res = await gridClient.k8s.deploy(k8s);
    log(res);

    //Contract Assertions
    expect(res.contracts.created).toHaveLength(4);
    expect(res.contracts.updated).toHaveLength(0);
    expect(res.contracts.deleted).toHaveLength(0);

    const result = await gridClient.k8s.getObj(k8s.name);
    log(result);

    const masterPlanetaryIp = result.masters[0].planetary;
    const user = "root";

    const newRes = await gridClient.k8s.add_worker(worker);
    log(newRes);

    //New Contract Assertions
    expect(newRes.contracts.created).toHaveLength(0);
    expect(newRes.contracts.updated).toHaveLength(1);
    expect(newRes.contracts.deleted).toHaveLength(0);

    const newResult = await gridClient.k8s.getObj(k8s.name);
    log(newResult);

    //New Worker Assertions
    expect(newResult.workers[1].nodeId).toBe(workerNodeId);
    expect(newResult.workers[1].status).toBe("ok");
    expect(newResult.workers[1].planetary).toBeDefined();
    expect(newResult.workers[1].publicIP).toBeNull();
    expect(newResult.workers[1].interfaces[0]["network"]).toBe(networkName);
    expect(newResult.workers[1].interfaces[0]["ip"]).toContain(splitIP(ipRange));
    expect(newResult.workers[1].interfaces[0]["ip"]).toMatch(ipRegex);
    expect(newResult.workers[1].capacity["cpu"]).toBe(workerCpu);
    expect(newResult.workers[1].capacity["memory"]).toBe(workerMemory);
    expect(newResult.workers[1].mounts[0]["size"]).toBe(bytesToGB(workerDiskSize));
    expect(newResult.workers[1].mounts[0]["state"]).toBe("ok");
    expect(newResult.workers[1].metadata).toBe(metadata);
    expect(newResult.workers[1].description).toBe(description);

    const newWorkerPlanetaryIp = newResult.workers[1].planetary;

    //Wait for 20 seconds until the master is ready
    const wait2 = await setTimeout(20000, "Waiting for K8s to be ready");
    log(wait2);

    //SSH to the master after the new worker is added.
    const masterSSH = await RemoteRun(masterPlanetaryIp, user);

    //Execute kubectl get nodes.
    try {
        await masterSSH.execCommand("kubectl get nodes").then(async function (result) {
            log(result.stdout);
            expect(result.stdout).toContain(masterName.toLowerCase());
            expect(result.stdout).toContain(workerName.toLowerCase());
            expect(result.stdout).toContain(newWorkerName.toLowerCase());
        });
    } finally {
        await masterSSH.dispose();
    }

    //SSH to the new worker
    const newWorkerSSH = await RemoteRun(newWorkerPlanetaryIp, user);

    try {
        //Verify Worker Resources (CPU)
        await newWorkerSSH.execCommand("lscpu").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[4]);
            expect(splittedRes[4]).toContain(workerCpu.toString());
        });
        //Verify Worker Resources (Memory)
        await newWorkerSSH.execCommand("free -m").then(async function (result) {
            const splittedRes = result.stdout.split("\n");
            log(splittedRes[1]);
            const memoryValue = splittedRes[1].match(/^\d+|\d+\b|\d+(?=\w)/g);
            expect(+memoryValue[0]).toBeGreaterThanOrEqual(workerMemory - workerMemory * 0.2);
            expect(+memoryValue[0]).toBeLessThan(workerMemory);
        });
    } finally {
        //Disconnect from the worker
        await newWorkerSSH.dispose();
    }
});

test("TC1233 - Kubernetes: Delete Worker", async () => {
    /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC1233 - Kubernetes: Delete Worker
     Scenario:
        - Generate Test Data/Master Config/Worker Config.
        - Select Two Different Nodes To Deploy the Master
          and Worker on.
        - Deploy the Kubernetes Cluster.
        - Assert that the generated data matches
          the deployment details.
        - SSH to the Master and Verify that you can
          access it.
        - Verify the resources of the Master & Worker.
        - Assert that the Master and Worker are available
          when you execute `kubectl get nodes`.
        - Delete the Worker and Assert that the
          workers list is empty in the deployment details.
    **********************************************/

    //Test Data
    const deploymentName = "K8s" + generateString(5);
    const secret = generateString(15);
    const networkName = generateString(15);
    const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
    const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
    const ipRangeClassC = "192.168.0.0/16";
    const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
    const masterName = "MR" + generateString(5);
    let masterCpu = generateInt(1, 4);
    let masterMemory = generateInt(1024, 4096);
    let masterRootfsSize = generateInt(2, 5);
    let masterDiskSize = generateInt(1, 20);
    const masterPublicIp = false;
    const workerName = "WR" + generateString(5);
    let workerCpu = generateInt(1, 4);
    let workerMemory = generateInt(1024, 4096);
    let workerRootfsSize = generateInt(2, 5);
    let workerDiskSize = generateInt(1, 20);
    const workerPublicIp = false;
    const metadata = "{'deploymentType':'k8s'}";
    const description = "test deploying k8s via ts grid3 client";

    //Master Node Selection
    let masterNode;
    try {
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        masterCpu = generateInt(1, masterCpu);
        masterMemory = generateInt(1024, masterMemory);
        masterRootfsSize = generateInt(2, masterRootfsSize);
        masterDiskSize = generateInt(1, masterDiskSize);

        //Search for another node with lower resources.
        masterNode = await gridClient.capacity.filterNodes({
            cru: masterCpu,
            mru: masterMemory / 1024,
            sru: masterRootfsSize + masterDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }

    //Worker Node Selection
    let workerNode;
    try {
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu,
            mru: workerMemory / 1024,
            sru: workerRootfsSize + workerDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    } catch (error) {
        //Log the resources that were not found.
        log("A Node was not found with the generated resources." + error);
        log("Regenerating test data with lower resources....");

        //Generate lower resources.
        workerCpu = generateInt(1, workerCpu);
        workerMemory = generateInt(1024, workerMemory);
        workerRootfsSize = generateInt(2, workerRootfsSize);
        workerDiskSize = generateInt(1, workerDiskSize);

        //Search for another node with lower resources.
        workerNode = await gridClient.capacity.filterNodes({
            cru: workerCpu,
            mru: workerMemory / 1024,
            sru: workerRootfsSize + workerDiskSize,
            farmId: 1,
            availableFor: await gridClient.twins.get_my_twin_id(),
        } as FilterOptions);
    }
    const masterNodeId = +randomChoice(masterNode).nodeId;
    let workerNodeId = +randomChoice(workerNode).nodeId;
    while (masterNodeId == workerNodeId) {
        workerNodeId = +randomChoice(workerNode).nodeId;
    }

    //K8s Model
    const k8s: K8SModel = {
        name: deploymentName,
        secret: secret,
        network: {
            name: networkName,
            ip_range: ipRange,
        },
        masters: [
            {
                name: masterName,
                node_id: masterNodeId,
                cpu: masterCpu,
                memory: masterMemory,
                rootfs_size: masterRootfsSize,
                disk_size: masterDiskSize,
                public_ip: masterPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        workers: [
            {
                name: workerName,
                node_id: workerNodeId,
                cpu: workerCpu,
                memory: workerMemory,
                rootfs_size: workerRootfsSize,
                disk_size: workerDiskSize,
                public_ip: workerPublicIp,
                public_ip6: false,
                planetary: true,
            },
        ],
        metadata: metadata,
        description: description,
        ssh_key: config.ssh_key,
    };

    //Delete Worker Model
    const deleteWorker: DeleteWorkerModel = {
        deployment_name: deploymentName,
        name: workerName,
    };

    const res = await gridClient.k8s.deploy(k8s);
    log(res);

    //Contract Assertions
    expect(res.contracts.created).toHaveLength(4);
    expect(res.contracts.updated).toHaveLength(0);
    expect(res.contracts.deleted).toHaveLength(0);

    const result = await gridClient.k8s.getObj(k8s.name);
    log(result);

    //Delete Worker
    const newRes = await gridClient.k8s.delete_worker(deleteWorker);
    log(newRes);

    //New Contract Assertions
    expect(newRes["created"]).toHaveLength(0);
    expect(newRes["updated"]).toHaveLength(0);
    expect(newRes["deleted"]).toHaveLength(2);

    const newResult = await gridClient.k8s.getObj(k8s.name);
    log(newResult);

    //Deleted Worker assertions
    expect(newResult.workers).toHaveLength(0);
});

afterEach(async () => {
    const k8sNames = await gridClient.k8s.list();
    for (const name of k8sNames) {
        const res = await gridClient.k8s.delete({ name });
        log(res);
        expect(res.created).toHaveLength(0);
        expect(res.updated).toHaveLength(0);
        expect(res.deleted).toBeDefined();
    }
});

afterAll(async () => {
    return await gridClient.disconnect();
});
