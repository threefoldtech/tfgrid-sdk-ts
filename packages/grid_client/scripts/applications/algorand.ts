import { FilterOptions, MachinesModel } from "../../src";
import { config, getClient } from "../client_loader";
import { log, pingNodes } from "../utils";

async function deploy(client, vms) {
  const resultVM = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(resultVM);
  log("================= Deploying VM =================");
}

async function getDeployment(client, vms) {
  const resultVM = await client.machines.getObj(vms.name);
  log("================= Getting deployment information =================");
  log(resultVM);
  log("================= Getting deployment information =================");
}

async function cancel(client, vms) {
  const resultVM = await client.machines.delete(vms);
  log("================= Canceling the deployment =================");
  log(resultVM);
  log("================= Canceling the deployment =================");
}

async function main() {
  const name = "newalgorand";
  const grid3 = await getClient(`algorand/${name}`);
  const instanceCapacity = { cru: 2, mru: 4, sru: 100 }; // Update the instance capacity values according to your requirements.

  //VMNode Selection
  const vmQueryOptions: FilterOptions = {
    cru: instanceCapacity.cru,
    mru: instanceCapacity.mru,
    sru: instanceCapacity.sru,
    availableFor: grid3.twinId,
    farmId: 1,
  };
  const nodes = await grid3.capacity.filterNodes(vmQueryOptions);
  const vmNode = await pingNodes(grid3, nodes);

  const vms: MachinesModel = {
    name,
    network: {
      name: "wedtest",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "algorand",
        node_id: vmNode,
        disks: [
          {
            name: "docker",
            size: instanceCapacity.sru,
            mountpoint: "/var/lib/docker",
          },
        ],
        planetary: true,
        public_ip: false,
        public_ip6: false,
        mycelium: false,
        cpu: instanceCapacity.cru,
        memory: 1024 * instanceCapacity.mru,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/algorand-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          // Select a network to work against.
          NETWORK: "mainnet",
          // Default, Relay, Indexer
          NODE_TYPE: "default",
        },
      },
    ],
    metadata: "",
    description: "test deploying Algorand via ts grid3 client",
  };

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name });

  await grid3.disconnect();
}

main();
