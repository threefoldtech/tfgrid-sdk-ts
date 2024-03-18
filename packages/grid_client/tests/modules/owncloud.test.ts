import { FilterOptions, generateString, GridClient, MachineModel, MachinesModel, randomChoice } from "../../src";
import { config, getClient } from "../client_loader";
import { bytesToGB, generateInt, getOnlineNode, log, RemoteRun, splitIP } from "../utils";

jest.setTimeout(300000);

let gridClient: GridClient;

beforeAll(async () => {
  return (gridClient = await getClient());
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test("TC - Deploy owncloud", async () => {
  /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC - Deploy owncloud
     Scenario:
        - Generate Test Data/VM Config.
        - Select a Node To Deploy the owncloud on.
        - Deploy the owncloud solution.
        - Assert that the generated data matches
          the deployment details.
        - SSH to the VM and Verify that you can
          access it.
        - Assert that the Environment Variables
          Were passed successfully to the VM
        - Verify the resources of the owncloud solution.
    **********************************************/

  //Test Data
  let cpu = generateInt(1, 4);
  let memory = generateInt(256, 4096);
  let rootfsSize = generateInt(2, 5);
  const deploymentName = generateString(15);
  const networkName = generateString(15);
  const vmName = generateString(15);
  const disks = [];
  const publicIP = false;
  const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
  const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
  const ipRangeClassC = "192.168.0.0/16";
  const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
  const metadata = "{'deploymentType': 'owncloud'}";
  const description = "test deploying owncloud via ts grid3 client";
  const envVarValue = generateString(30);

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
  const nodeId = await getOnlineNode(nodes);
  if (nodeId == -1) throw new Error("no nodes available to complete this test");

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
        flist: "https://hub.grid.tf/tf-official-apps/owncloud-10.9.1.flist",
        entrypoint: "/sbin/zinit init",
        public_ip: publicIP,
        planetary: true,
        mycelium: true,
        env: {
          SSH_KEY: config.ssh_key,
          Test_KEY: envVarValue,
          OWNCLOUD_ADMIN_USERNAME: "test1",
          OWNCLOUD_ADMIN_PASSWORD: "123456",
          OWNCLOUD_DOMAIN: "gent01.dev.grid.tf",
        },
        solutionProviderId: null,
      },
    ],
    metadata: metadata,
    description: description,
  };

  const res = await gridClient.machines.deploy(vms);
  log(res);

  //Contracts Assertions
  expect(res.contracts.created).toHaveLength(1);
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

  const host = result[0].planetary;
  const user = "root";

  //SSH to the Created VM
  const ssh = await RemoteRun(host, user);

  try {
    //Verify that the added env var was successfully passed to the VM.
    await ssh.execCommand("cat /proc/1/environ").then(async function (result) {
      log(result.stdout);
      expect(result.stdout).toContain(envVarValue);
    });

    //verify zinit services
    await ssh.execCommand("zinit").then(async function (result) {
      log(result.stdout);
      expect(result.stdout).toContain("owncloud: Running");
    });
  } finally {
    //Disconnect from the machine
    await ssh.dispose();
  }
});
