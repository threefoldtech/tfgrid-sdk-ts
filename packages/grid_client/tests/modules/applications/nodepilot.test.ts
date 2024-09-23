import axios from "axios";
import { setTimeout } from "timers/promises";

import { FilterOptions, generateString, GridClient, MachinesModel, randomChoice } from "../../../src";
import { config, getClient } from "../../client_loader";
import { GBToBytes, generateInt, getOnlineNode, log, splitIP } from "../../utils";

jest.setTimeout(1250000);

let gridClient: GridClient;
let deploymentName: string;
const network_temp = config.network;

beforeAll(async () => {
  config.network = "main"; //Change network to mainnet, the only network with enough resources
  gridClient = await getClient();
  deploymentName = "np" + generateString(10);
  gridClient.clientOptions.projectName = `nodepilot/${deploymentName}`;
  gridClient._connect();
  return gridClient;
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test.skip("TC2701 - Applications: Deploy Nodepilot", async () => {
  /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC2701 - Applications: Deploy Nodepilot
     Scenario:
        - Generate Test Data/Nodepilot Config.
        - Select a Node To Deploy the Nodepilot on.
        - Deploy the Nodepilot solution.
        - Assert that the generated data matches
          the deployment details.
        - Assert that the generated data matches
          the deployment details.
        - Assert that the returned domain is working
          and returns correct data.
    **********************************************/

  //Test Data
  const cpu = 8;
  const memory = 8;
  const rootfsSize = 2;
  const disk1Size = 15;
  const disk2Size = 15;
  const networkName = generateString(15);
  const vmName = generateString(15);
  const disk1Name = generateString(15);
  const disk2Name = generateString(15);
  const mountPoint1 = "/mnt/disk1";
  const mountPoint2 = "/mnt/disk2";
  const publicIp = true;
  const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
  const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
  const ipRangeClassC = "192.168.0.0/16";
  const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
  const metadata = "{'deploymentType': 'nodepilot'}";
  const description = "test deploying Nodepilot via ts grid3 client";

  //Node Selection
  const nodes = await gridClient.capacity.filterNodes({
    cru: cpu,
    mru: memory,
    sru: rootfsSize + disk1Size + disk2Size,
    farmId: 1,
    publicIPs: publicIp,
    availableFor: await gridClient.twins.get_my_twin_id(),
    status: "up",
  } as FilterOptions);
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
        memory: 1024 * memory,
        rootfs_size: rootfsSize,
        disks: [
          {
            name: disk1Name,
            size: disk1Size,
            mountpoint: mountPoint1,
          },
          {
            name: disk2Name,
            size: disk2Size,
            mountpoint: mountPoint2,
          },
        ],
        flist: "https://hub.grid.tf/tf-official-vms/node-pilot-zdbfs.flist",
        entrypoint: "/",
        public_ip: publicIp,
        planetary: false,
        mycelium: false,
        env: {
          SSH_KEY: config.ssh_key,
        },
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
  expect(result[0].mounts).toHaveLength(2);
  expect(result[0].interfaces[0]["network"]).toBe(vms.network.name);
  expect(result[0].interfaces[0]["ip"]).toContain(splitIP(vms.network.ip_range));
  expect(result[0].interfaces[0]["ip"]).toMatch(ipRegex);
  expect(result[0].capacity["cpu"]).toBe(cpu);
  expect(result[0].capacity["memory"]).toBe(memory * 1024);
  expect(result[0].planetary).toBeUndefined();
  expect(result[0].publicIP).toBeDefined();
  expect(result[0].description).toBe(description);
  expect(result[0].mounts[0]["name"]).toBe(disk1Name);
  expect(result[0].mounts[0]["size"]).toBe(GBToBytes(disk1Size));
  expect(result[0].mounts[0]["mountPoint"]).toBe(mountPoint1);
  expect(result[0].mounts[0]["state"]).toBe("ok");
  expect(result[0].mounts[1]["name"]).toBe(disk2Name);
  expect(result[0].mounts[1]["size"]).toBe(GBToBytes(disk2Size));
  expect(result[0].mounts[1]["mountPoint"]).toBe(mountPoint2);
  expect(result[0].mounts[1]["state"]).toBe("ok");

  const site = "http://" + result[0].publicIP["ip"].slice(0, -3) + "/";
  let reachable = false;
  log(site);

  for (let i = 0; i <= 250; i++) {
    const wait = await setTimeout(5000, "Waiting for gateway to be ready");
    log(wait);

    await axios
      .get(site)
      .then(res => {
        log("gateway is reachable");
        log(res.status);
        log(res.statusText);
        log(res.data);
        expect(res.status).toBe(200);
        expect(res.statusText).toBe("OK");
        expect(res.data).toContain("Node Pilot");
        reachable = true;
      })
      .catch(() => {
        log("gateway is not reachable");
      });
    if (reachable) {
      break;
    } else if (i == 250) {
      throw new Error("Gateway is unreachable after multiple retries");
    }
  }
});

afterAll(async () => {
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
  config.network = network_temp; //Change network back as before.
  return await gridClient.disconnect();
}, 130000);
