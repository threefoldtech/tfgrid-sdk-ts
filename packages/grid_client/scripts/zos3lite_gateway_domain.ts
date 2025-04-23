import { Features, FilterOptions, GatewayNameModel, GridClient, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log, pingNodes } from "./utils";

async function deployVM(client: GridClient, vms: MachinesModel) {
  const res = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(res);
  log("================= Deploying VM =================");
}

async function deployGateway(client: GridClient, gw: GatewayNameModel) {
  const res = await client.gateway.deploy_name(gw);
  log("================= Deploying Gateway =================");
  log(res);
  log("================= Deploying Gateway =================");
}

async function getDeployment(client: GridClient, name: string) {
  const res = await client.machines.getObj(name);
  log("================= Getting VM Deployment =================");
  log(res);
  log("================= Getting VM Deployment =================");

  const resGW = await client.gateway.getObj(name);
  log("================= Getting Gateway Deployment =================");
  log(resGW);
  log(`https://${resGW[0].domain}`);
  log("================= Getting Gateway Deployment =================");
}

async function cancel(client: GridClient, name: string, subdomain: string) {
  const resVM = await client.machines.delete({ name });
  log("================= Canceling VM Deployment =================");
  log(resVM);
  log("================= Canceling VM Deployment =================");

  const resGW = await client.gateway.delete_name({ name: subdomain });
  log("================= Canceling Gateway Deployment =================");
  log(resGW);
  log("================= Canceling Gateway Deployment =================");
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
        node_id: nodeId,
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

  //Deploy VM
  await deployVM(grid3, vms);

  const vm = (await grid3.machines.getObj(vms.name))[0];
  const vmIP = vm.myceliumIP;

  const gatewayOptions: FilterOptions = {
    gateway: true,
    features: [Features.mycelium],
    availableFor: grid3.twinId,
  };

  const gatewayNode = { nodeId };

  const gw: GatewayNameModel = {
    name: subdomain,
    network: vmIP,
    node_id: gatewayNode!.nodeId,
    tls_passthrough: false,
    backends: [`http://[${vmIP}]:80`],
  };

  //Deploy gateway
  await deployGateway(grid3, gw);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, vms.name, subdomain);

  grid3.disconnect();
}

main();
