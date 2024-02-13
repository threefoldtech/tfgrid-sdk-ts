import { MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, vms) {
  const res = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(res);
  log("================= Deploying VM =================");
}

async function getDeployment(client, vms) {
  const res = await client.machines.getObj(vms);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
}

async function cancel(client, vms) {
  const res = await client.machines.delete(vms);
  log("================= Canceling the deployment =================");
  log(res);
  log("================= Canceling the deployment =================");
}

async function main() {
  const grid3 = await getClient();

  const vms: MachinesModel = {
    name: "newMY",
    network: {
      name: "hellotest",
      ip_range: "10.249.0.0/16",
      // myceliumSeeds: [
      //   {
      //     nodeId: 168,
      //     seed: "050d109829d8492d48bfb33b711056080571c69e46bfde6b4294c4c5bf468a76", //(HexSeed of length 32)
      //   },
      // ],
    },
    machines: [
      {
        name: "testvmMY",
        node_id: 168,
        disks: [
          {
            name: "wedDisk",
            size: 8,
            mountpoint: "/testdisk",
          },
        ],
        public_ip: false,
        public_ip6: false,
        planetary: true,
        mycelium: true,
        // myceliumSeed: "1e1404279b3d", //(HexSeed of length 6)
        cpu: 1,
        memory: 1024 * 2,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/base:latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
        },
      },
    ],
    metadata: "",
    description: "test deploying single VM with mycelium via ts grid3 client",
  };

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
