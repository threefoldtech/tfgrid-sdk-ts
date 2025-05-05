import axios from "axios";
import { setTimeout } from "timers/promises";

import {
  Features,
  FilterOptions,
  GatewayNameModel,
  generateString,
  GridClient,
  MachinesModel,
  randomChoice,
} from "../../../src";
import { config, getClient } from "../../client_loader";
import { GBToBytes, generateInt, getOnlineNode, log, splitIP } from "../../utils";

jest.setTimeout(1250000);

let gridClient: GridClient;
let deploymentName: string;

beforeAll(async () => {
  gridClient = await getClient();
  deploymentName = "tg" + gridClient.twinId + generateString(5);
  gridClient.clientOptions.projectName = `taiga/${deploymentName}`;
  gridClient._connect();
  return gridClient;
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test("TC2691 - Applications: Deploy Taiga", async () => {
  /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC2691 - Applications: Deploy Taiga
     Scenario:
        - Generate Test Data/Taiga Config/Gateway Config.
        - Select a Node To Deploy the Taiga on.
        - Select a Gateway Node To Deploy the gateway on.
        - Deploy the Taiga solution.
        - Assert that the generated data matches
          the deployment details.
        - Pass the IP of the Created Taiga to the Gateway
          Config.
        - Deploy the Gateway.
        - Assert that the generated data matches
          the deployment details.
        - Assert that the Gateway points at the IP
          of the created Taiga.
        - Assert that the returned domain is working
          and returns correct data.
    **********************************************/

  //Test Data
  const name = "tg" + generateString(10).toLowerCase();
  const subdomain = name;
  const tlsPassthrough = false;
  const cpu = 2;
  const memory = 4;
  const rootfsSize = 2;
  const diskSize = 50;
  const networkName = generateString(15);
  const vmName = generateString(15);
  const diskName = generateString(15);
  const mountPoint = "/var/lib/docker";
  const publicIp = false;
  const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
  const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
  const ipRangeClassC = "192.168.0.0/16";
  const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
  const metadata = "{'deploymentType': 'taiga'}";
  const description = "test deploying Taiga via ts grid3 client";

  //GatewayNode Selection
  const gatewayNodes = await gridClient.capacity.filterNodes({
    features: [Features.wireguard, Features.mycelium],
    gateway: true,
    farmId: 1,
    availableFor: await gridClient.twins.get_my_twin_id(),
  } as FilterOptions);
  if (gatewayNodes.length === 0) throw new Error("No nodes available to complete this test");
  const GatewayNode = gatewayNodes[generateInt(0, gatewayNodes.length - 1)];

  const nodes = await gridClient.capacity.filterNodes({
    features: [Features.wireguard, Features.mycelium],
    cru: cpu,
    mru: memory,
    sru: rootfsSize + diskSize,
    farmId: 1,
    availableFor: await gridClient.twins.get_my_twin_id(),
  } as FilterOptions);
  const nodeId = await getOnlineNode(nodes);
  if (nodeId === -1) throw new Error("No nodes available to complete this test");
  const domain = subdomain + "." + GatewayNode.publicConfig.domain;

  //VM Model
  const vms: MachinesModel = {
    name: deploymentName,
    network: {
      name: networkName,
      ip_range: ipRange,
      addAccess: true,
      accessNodeId: GatewayNode.nodeId,
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
            name: diskName,
            size: diskSize,
            mountpoint: mountPoint,
          },
        ],
        flist: "https://hub.grid.tf/tf-official-apps/grid3_taiga_docker-latest.flist",
        entrypoint: "/sbin/zinit init",
        public_ip: publicIp,
        planetary: true,
        mycelium: true,
        env: {
          SSH_KEY: config.ssh_key,
          DOMAIN_NAME: domain,
          ADMIN_USERNAME: "admin123",
          ADMIN_PASSWORD: "admin123",
          ADMIN_EMAIL: "admin123@taiga.com",
        },
      },
    ],
    metadata: metadata,
    description: description,
  };

  const res = await gridClient.machines.deploy(vms);
  log(res);

  //  Contracts Assertions
  expect(res.contracts.created).toHaveLength(1);
  expect(res.contracts.updated).toHaveLength(0);
  expect(res.contracts.deleted).toHaveLength(0);

  // VM Assertions
  const vmsList = await gridClient.machines.list();
  log(vmsList);
  expect(vmsList.length).toBeGreaterThanOrEqual(1);
  expect(vmsList).toContain(vms.name);

  const result = await gridClient.machines.getObj(vms.name);
  log(result);

  expect(result[0].nodeId).toBe(nodeId);
  expect(result[0].status).toBe("ok");
  expect(result[0].flist).toBe(vms.machines[0].flist);
  expect(result[0].entrypoint).toBe(vms.machines[0].entrypoint);
  expect(result[0].mounts).toHaveLength(1);
  expect(result[0].interfaces[0]["network"]).toBe(vms.network.name);
  expect(result[0].interfaces[0]["ip"]).toContain(splitIP(vms.network.ip_range));
  expect(result[0].interfaces[0]["ip"]).toMatch(ipRegex);
  expect(result[0].capacity["cpu"]).toBe(cpu);
  expect(result[0].capacity["memory"]).toBe(memory * 1024);
  expect(result[0].planetary).toBeDefined();
  expect(result[0].myceliumIP).toBeDefined();
  expect(result[0].publicIP).toBeNull();
  expect(result[0].description).toBe(description);
  expect(result[0].mounts[0]["name"]).toBe(diskName);
  expect(result[0].mounts[0]["size"]).toBe(GBToBytes(diskSize));
  expect(result[0].mounts[0]["mountPoint"]).toBe(mountPoint);
  expect(result[0].mounts[0]["state"]).toBe("ok");

  const wgnet = result[0].interfaces[0];

  //Name Gateway Model
  const gateway: GatewayNameModel = {
    name: subdomain,
    network: wgnet.network,
    node_id: GatewayNode.nodeId,
    tls_passthrough: tlsPassthrough,
    backends: [`http://${wgnet.ip}:9000`],
  };

  const gatewayRes = await gridClient.gateway.deploy_name(gateway);
  log(gatewayRes);

  // Gateway Contracts Assertions
  expect(gatewayRes.contracts.created).toHaveLength(1);
  expect(gatewayRes.contracts.updated).toHaveLength(0);
  expect(gatewayRes.contracts.deleted).toHaveLength(0);
  expect(gatewayRes.contracts.created[0].contractType.nodeContract.nodeId).toBe(GatewayNode.nodeId);

  // Gateway Assertions
  const gatewayResult = await gridClient.gateway.getObj(gateway.name);
  log(gatewayResult);

  expect(gatewayResult[0].name).toBe(subdomain);
  expect(gatewayResult[0].backends).toStrictEqual(gateway.backends);
  expect(gatewayResult[0].status).toBe("ok");
  expect(gatewayResult[0].type).toContain("name");
  expect(gatewayResult[0].domain).toContain(name);
  expect(gatewayResult[0].tls_passthrough).toBe(gateway.tls_passthrough);

  const site = "https://" + gatewayResult[0].domain;
  let reachable = false;

  for (let i = 0; i <= 250; i++) {
    const wait = await setTimeout(5000, "Waiting for gateway to be ready");
    log(wait);

    await axios
      .get(site)
      .then(res => {
        log("Gateway is reachable");
        log(res.status);
        log(res.statusText);
        expect(res.status).toBe(200);
        expect(res.data).toContain("Taiga is a project management platform");
        reachable = true;
      })
      .catch(() => {
        log("Gateway is not reachable");
      });
    if (reachable) break;
    if (i === 250) throw new Error("Gateway is unreachable after retries");
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
  return await gridClient.disconnect();
}, 130000);
