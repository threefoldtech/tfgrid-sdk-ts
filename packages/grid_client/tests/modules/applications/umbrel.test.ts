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
  deploymentName = "um" + generateString(10);
  gridClient.clientOptions.projectName = `umbrel/${deploymentName}`;
  gridClient._connect();
  return gridClient;
});

//Private IP Regex
const ipRegex = /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;

test("TC2694 - Applications: Deploy Umbrel", async () => {
  /**********************************************
     Test Suite: Grid3_Client_TS (Automated)
     Test Cases: TC2694 - Applications: Deploy Umbrel
     Scenario:
        - Generate Test Data/Umbrel Config/Gateway Config.
        - Select a Node To Deploy the Umbrel on.
        - Select a Gateway Node To Deploy the gateway on.
        - Deploy the Umbrel solution.
        - Assert that the generated data matches
          the deployment details.
        - Pass the IP of the Created Umbrel to the Gateway
          Config.
        - Deploy the Gateway.
        - Assert that the generated data matches
          the deployment details.
        - Assert that the Gateway points at the IP
          of the created Umbrel.
        - Assert that the returned domain is working
          and returns correct data.
    **********************************************/

  const name = "gw" + generateString(10).toLowerCase();
  const subdomain = name;
  const cpu = 1;
  const memory = 2;
  const rootfsSize = 2;
  const disk1Size = 10;
  const disk2Size = 10;
  const networkName = generateString(15);
  const vmName = generateString(15);
  const disk1Name = generateString(15);
  const disk2Name = generateString(15);
  const mountPoint1 = "/var/lib/docker";
  const mountPoint2 = "/umbrelDisk";
  const publicIp = false;
  const ipRangeClassA = "10." + generateInt(1, 255) + ".0.0/16";
  const ipRangeClassB = "172." + generateInt(16, 31) + ".0.0/16";
  const ipRangeClassC = "192.168.0.0/16";
  const ipRange = randomChoice([ipRangeClassA, ipRangeClassB, ipRangeClassC]);
  const metadata = "{'deploymentType': 'umbrel'}";
  const description = "test deploying Umbrel via ts grid3 client";

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
    sru: rootfsSize + disk1Size + disk2Size,
    farmId: 1,
    availableFor: await gridClient.twins.get_my_twin_id(),
  } as FilterOptions);
  const nodeId = await getOnlineNode(nodes);
  if (nodeId === -1) throw new Error("No nodes available to complete this test");
  const domain = subdomain + "." + GatewayNode.publicConfig.domain;

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
        flist: "https://hub.grid.tf/tf-official-apps/umbrel-latest.flist",
        entrypoint: "/sbin/zinit init",
        public_ip: publicIp,
        planetary: true,
        mycelium: true,
        env: {
          SSH_KEY: config.ssh_key,
          UMBREL_DISK: mountPoint2,
          USERNAME: "admin",
          PASSWORD: "admin1234567",
        },
      },
    ],
    metadata: metadata,
    description: description,
  };

  const res = await gridClient.machines.deploy(vms);
  log(res);

  expect(res.contracts.created).toHaveLength(1);
  expect(res.contracts.updated).toHaveLength(0);
  expect(res.contracts.deleted).toHaveLength(0);

  const result = await gridClient.machines.getObj(vms.name);
  log(result);

  const wgnet = result[0].interfaces[0];

  const gateway: GatewayNameModel = {
    name: subdomain,
    network: wgnet.network,
    node_id: GatewayNode.nodeId,
    tls_passthrough: false,
    backends: [`http://${wgnet.ip}:80`],
  };

  const gatewayRes = await gridClient.gateway.deploy_name(gateway);
  log(gatewayRes);

  expect(gatewayRes.contracts.created).toHaveLength(1);

  const gatewayResult = await gridClient.gateway.getObj(gateway.name);
  log(gatewayResult);

  expect(gatewayResult[0].name).toBe(subdomain);
  expect(gatewayResult[0].backends).toStrictEqual(gateway.backends);

  const site = "http://" + gatewayResult[0].domain;
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
  }

  const gwNames = await gridClient.gateway.list();
  for (const name of gwNames) {
    const res = await gridClient.gateway.delete_name({ name });
    log(res);
  }

  return await gridClient.disconnect();
}, 130000);
