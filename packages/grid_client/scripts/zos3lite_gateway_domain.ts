import { Features, FilterOptions, GatewayNameModel, GridClient, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log, pingNodes } from "./utils";

async function deployVM(client: GridClient, vms: MachinesModel) {
  const res = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(res);
  return res;
}

async function deployGateway(client: GridClient, gw: GatewayNameModel) {
  const res = await client.gateway.deploy_name(gw);
  log("================= Deploying Gateway =================");
  log(res);
  return res;
}

async function main() {
  const name = "zos3litegw1";
  const grid3 = await getClient(`zos3lite/${name}`);
  const subdomain = `gw${grid3.twinId}${name}`;

  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 1,
    sru: 14,
    availableFor: grid3.twinId,
    features: [Features.zmachinelight, Features.networklight, Features.mycelium],
    nodeExclude: [259],
    farmName: "LiriaFarm",
  };

  const nodeId = await pingNodes(grid3, await grid3.capacity.filterNodes(vmQueryOptions));

  const vms: MachinesModel = {
    name,
    network: {
      name: "liteNetwork",
      ip_range: "10.238.0.0/16",
      accessNodeId: nodeId,
    },
    machines: [
      {
        name: "testvm11",
        node_id: nodeId!,
        disks: [{ name: "newDisk11", size: 5, mountpoint: "/newDisk1" }],
        public_ip: false,
        public_ip6: false,
        planetary: false,
        mycelium: true,
        cpu: 1,
        memory: 1024,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/base:latest.flist",
        entrypoint: "/sbin/zinit init",
        env: { SSH_KEY: config.ssh_key },
      },
    ],
    metadata: "",
    description: "ZOS3 Lite VM for gateway test",
  };

  // Deploy the VM
  const vmResult = await deployVM(grid3, vms);

  // Extract the deployed VM's Mycelium IP
  const vm = (await grid3.machines.getObj(vms.name))[0];
  const vmIP = vm.interfaces[0].ip;

  const gatewayOptions: FilterOptions = {
    gateway: true,
    availableFor: grid3.twinId,
  };

  const gatewayNodes = await grid3.capacity.filterNodes(gatewayOptions);
  const gatewayNodeId = await pingNodes(grid3, gatewayNodes);
  const gatewayNode = gatewayNodes.find(n => n.nodeId === gatewayNodeId);

  const gateway: GatewayNameModel = {
    name: subdomain,
    network: vm.interfaces[0].network,
    node_id: gatewayNode!.nodeId,
    tls_passthrough: false,
    backends: [`http://${vmIP}:80`], // change port if different inside container
  };

  // Deploy the Gateway
  const gwRes = await deployGateway(grid3, gateway);

  // Ping the domain
  const domainURL = `https://${gwRes[0].domain}`;
  log(`Trying to ping domain: ${domainURL}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(domainURL, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Unexpected status: ${res.status}`);
    log(`✅ Domain is reachable: ${domainURL}`);
  } catch (e) {
    log(`❌ Failed to ping domain: ${e.message}`);
    throw e;
  }

  await grid3.disconnect();
}

main();
