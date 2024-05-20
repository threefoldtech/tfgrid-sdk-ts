import { FilterOptions, GatewayNameModel, MachinesModel } from "../../src";
import { config, getClient } from "../client_loader";
import { log } from "../utils";

async function pingNodes(client, nodes) {
  for (const node of nodes) {
    try {
      await client.zos.pingNode({ nodeId: node.nodeId });
      return node.nodeId;
    } catch (error) {
      console.log("node " + node.nodeId + " is not responding, trying different node.");
    }
  }
  throw new Error("No avaiable nodes");
}

async function deploy(client, vms) {
  const res = await client.machines.deploy(vms);
  log("================= Deploying VM =================");
  log(res);
  log("================= Deploying VM =================");
}

async function deployGW(client, gw) {
  const res = await client.gateway.deploy_name(gw);
  log("================= Deploying name gateway =================");
  log(res);
  log("================= Deploying name gateway =================");
}

async function getDeployment(client, vms) {
  const res = await client.machines.getObj(vms);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
  return res;
}

async function getDeploymentGW(client, gw) {
  const res = await client.gateway.getObj(gw);
  log("================= Getting deployment information =================");
  log(res);
  log("================= Getting deployment information =================");
  return res;
}

async function cancel(client, vms, gw) {
  const resvm = await client.machines.delete(vms);
  const resgw = await client.gateway.delete_name(gw);
  log("================= Canceling the deployment =================");
  log(resvm);
  log(resgw);
  log("================= Canceling the deployment =================");
}

async function main() {
  const name = "newmattermost";
  const grid3 = await getClient(`mattermost/${name}`);
  const subdomain = "mm" + grid3.twinId + name;

  //VMNode Selection
  const vmQueryOptions: FilterOptions = {
    cru: 1,
    mru: 2,
    sru: 50,
    availableFor: grid3.twinId,
    farmId: 1,
  };
  //GatewayNode Selection
  const gatewayQueryOptions: FilterOptions = {
    gateway: true,
    availableFor: grid3.twinId,
  };
  const gatewayNode = (await grid3.capacity.filterNodes(gatewayQueryOptions))[0];

  const vms: MachinesModel = {
    name,
    network: {
      name: "wedtest",
      ip_range: "10.249.0.0/16",
    },
    machines: [
      {
        name: "mattermost",
        node_id: +(await pingNodes(grid3, await grid3.capacity.filterNodes(vmQueryOptions))),
        disks: [
          {
            name: "wedDisk",
            size: 50,
            mountpoint: "/var/lib/docker",
          },
        ],
        planetary: true,
        public_ip: false,
        public_ip6: false,
        mycelium: false,
        cpu: 1,
        memory: 1024 * 2,
        rootfs_size: 0,
        flist: "https://hub.grid.tf/tf-official-apps/mattermost-latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: config.ssh_key,
          MATTERMOST_DOMAIN: subdomain + "." + gatewayNode.publicConfig.domain,
          SITE_URL: "https://" + subdomain + "." + gatewayNode.publicConfig.domain,
          DJANGO_SUPERUSER_EMAIL: "admin123@matter.most", // edit me
          DB_PASSWORD: "admin123", // edit me
          // Optional
          // SMTPUsername: "username",
          // SMTPPassword: "password",
          // SMTPServer: "hostname",
          // SMTPPort: "port",
        },
      },
    ],
    metadata: "",
    description: "test deploying MatterMost via ts grid3 client",
  };

  //Deploy VMs
  await deploy(grid3, vms);

  //Get the deployment
  const result = await getDeployment(grid3, name);

  //Name Gateway Model
  const gw: GatewayNameModel = {
    name: subdomain,
    node_id: gatewayNode.nodeId,
    tls_passthrough: false,
    backends: ["http://[" + result[0].planetary + "]:8000"],
  };

  //Deploy gateway
  await deployGW(grid3, gw);

  //Get the deployment
  const gatewayResult = await getDeploymentGW(grid3, gw.name);

  //Get the site link
  const domain = "https://" + gatewayResult[0].domain;
  log(domain);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name }, { name: subdomain });

  await grid3.disconnect();
}

main();
