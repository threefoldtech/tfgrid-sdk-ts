import { FilterOptions, GatewayNameModel, GridClient, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

function createNetworkModel(gwNode: number, name: string): NetworkModel {
  return {
    name,
    addAccess: true,
    accessNodeId: gwNode,
    ip_range: "10.238.0.0/16",
  } as NetworkModel;
}
function createMachineModel(node: number) {
  return {
    name: "testvm1",
    node_id: node,
    public_ip: false,
    planetary: true,
    cpu: 1,
    memory: 1024 * 2,
    rootfs_size: 0,
    disks: [],
    flist: "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-22.04.flist",
    entrypoint: "/usr/bin/python3 -m http.server --bind ::",
    env: {
      SSH_KEY: config.ssh_key,
    },
  } as MachineModel;
}
function createMachinesModel(vm: MachineModel, network: NetworkModel): MachinesModel {
  return {
    name: "newVMs",
    network,
    machines: [vm],
    metadata: "",
    description: "test deploying VMs with wireguard via ts grid3 client",
  } as MachinesModel;
}
function createGwModel(node_id: number, ip: string, networkName: string, name: string, port: number) {
  return {
    name,
    node_id,
    tls_passthrough: false,
    backends: [`http://${ip}:${port}`],
    network: networkName,
  } as GatewayNameModel;
}

async function main() {
  const grid3 = await getClient();

  const gwNode = +(await grid3.capacity.filterNodes({ gateway: true }))[0].nodeId;

  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 2, // GB
    availableFor: grid3.twinId,
    farmId: 1,
  };
  const vmNode = +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId;

  const network = createNetworkModel(gwNode, "monNetwork");
  const vm = createMachineModel(vmNode);
  const machines = createMachinesModel(vm, network);
  log(`Deploying vm on node: ${vmNode}, with network node: ${gwNode}`);

  // deploy the vm
  const vmResult = await grid3.machines.deploy(machines);
  log(vmResult);

  const deployedVm = await grid3.machines.getObj(machines.name);
  log("+++ deployed vm +++");
  log(deployedVm);

  const vmPrivateIP = (deployedVm as { interfaces: { ip: string }[] }[])[0].interfaces[0].ip;
  const gateway = createGwModel(gwNode, vmPrivateIP, network.name, "pyserver1", 8000);
  log(`deploying gateway ${network.name} on node ${gwNode}`);

  const gatewayResult = await grid3.gateway.deploy_name(gateway);
  log(gatewayResult);

  log("+++ Deployed gateway +++");

  const l = await grid3.gateway.getObj(gateway.name);
  log(l);

  // delete
  // const deletedMachines = await grid3.machines.delete({ name:  machines.name});
  // log(deletedMachines);
  // const deletedGW = await grid3.gateway.delete_name({ name: gateway.name});
  // log(deletedGW);

  await grid3.disconnect();
}

main();
