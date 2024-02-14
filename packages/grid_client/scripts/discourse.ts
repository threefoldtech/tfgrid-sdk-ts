import { FilterOptions, generateString, MachinesModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, vms) {
  try {
    const res = await client.machines.deploy(vms);
    log("================= Deploying discourse =================");
    log(res);
    log("================= Deploying discourse =================");
  } catch (error) {
    log("Error while Deploying the VM " + error);
  }
}

async function getDeployment(client, vms) {
  try {
    const res = await client.machines.getObj(vms);
    log("================= Getting deployment information =================");
    log(res);
    log(`You can access discourse via the browser using: http://captain.${res[0].env.CAPROVER_ROOT_DOMAIN}`);
    log("================= Getting deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancel(client, vms) {
  try {
    const res = await client.machines.delete(vms);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    log("Error while canceling the deployment " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const vmQueryOptions: FilterOptions = {
    cru: 4,
    mru: 4, // GB
    sru: 10,
    farmId: 1,
  };

  const vms: MachinesModel = {
    name: "newVMS5",
    network: {
      name: "wedtest",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "testvm",
        node_id: +(await grid3.capacity.filterNodes(vmQueryOptions))[0].nodeId,
        disks: [
          {
            name: "wedDisk",
            size: 8,
            mountpoint: "/var/lib/docker",
          },
        ],
        public_ip: true,
        public_ip6: false,
        planetary: false,
        cpu: 4,
        memory: 1024 * 4,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/funkwhale-v3.1.1.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          MATTERMOST_DOMAIN: "gent02.dev.grid.tf",
          DISCOURSE_HOSTNAME: "",
          DISCOURSE_DEVELOPER_EMAILS: "test12@gmail.com",
          DISCOURSE_SMTP_ADDRESS: "",
          DISCOURSE_SMTP_PORT: "",
          DISCOURSE_SMTP_ENABLE_START_TLS: "",
          DISCOURSE_SMTP_USER_NAME: "",
          DISCOURSE_SMTP_PASSWORD: "",
          THREEBOT_PRIVATE_KEY: "",
          FLASK_SECRET_KEY: generateString(6),
        },
      },
    ],
    metadata: "",
    description: "discourse machine/node",
  };

  //Deploy discourse
  await deploy(grid3, vms);

  //Get the deployment
  await getDeployment(grid3, vms.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: vms.name });

  await grid3.disconnect();
}

main();
