import { DiskModel, MachineModel, MachinesModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

// create network Object
const n = new NetworkModel();
n.name = "demonet";
n.ipRange = "10.250.0.0/16";

// create vm node Object
const vm = new MachineModel();
vm.name = "python";
vm.location.farmId = 1;
vm.disks = [];
vm.publicIp = false;
vm.planetary = true;
vm.cpu = 1;
vm.memory = 1024;
vm.rootfsSize = 0;
vm.flist = "https://hub.grid.tf/tf-official-apps/threefoldtech-ubuntu-20.04.flist";
vm.entrypoint = "/usr/bin/python3 -m http.server --bind :: 8080";
vm.env = {
    SSH_KEY: config.ssh_key,
};
vm.ip = "10.250.2.5"; // create a machine with specific private ip

// create vm node Object
const vm2 = new MachineModel();
vm2.name = "caddy";
vm2.location.farmId = 1;
vm2.disks = [];
vm2.publicIp = false;
vm2.planetary = true;
vm2.cpu = 1;
vm2.memory = 1024;
vm2.rootfsSize = 0;
vm2.flist = "https://hub.grid.tf/ahmed_hanafy_1/ahmedhanafy725-caddy-latest.flist";
vm2.entrypoint = "/start.sh";
vm2.env = {
    SSH_KEY: config.ssh_key,
    IP: vm.ip,
    PORT: "8080",
    TARGET_PORT: "8000",
};

// create VMs Object
const vms = new MachinesModel();
vms.name = "demoVMs";
vms.network = n;
vms.machines = [vm, vm2];
vms.metadata = "{'testVMs': true}";
vms.description = "test deploying VMs via ts grid3 client";

async function main() {
    const grid3 = await getClient();

    // deploy vms
    const res = await grid3.machines.deploy(vms);
    log(res);

    // get the deployment
    const l = await grid3.machines.getObj(vms.name);
    log(l);

    // // delete
    // const d = await grid3.machines.delete({ name: vms.name });
    // log(d);

    await grid3.disconnect();
}

main();
