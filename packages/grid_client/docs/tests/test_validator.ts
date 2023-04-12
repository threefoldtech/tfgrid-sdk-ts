import { validateObject, MachineModel, NetworkModel, DiskModel, MachinesModel } from "../../src";
import { log } from "../../scripts/utils";


async function test() {
    // create network Object;
    const n = new NetworkModel();
    n.name = "wedtest_";
    n.ip_range = "10.249.0.0/16";

    // create disk Object
    const disk = new DiskModel();
    disk.name = "wedDisk";
    disk.size = 8;
    disk.mountpoint = "/testdisk";

    // create vm node Object
    const vm = new MachineModel();
    vm.name = "testvm";
    vm.node_id = 17;
    vm.disks = [disk];
    vm.public_ip = false;
    vm.planetary = true;
    vm.cpu = 0;
    vm.memory = 10 * 2;
    vm.rootfs_size = 1;
    vm.flist = "https://hub.grid.tf/tf-official-apps/base:latest.flist";
    vm.entrypoint = "/sbin/zinit init";

    // create VMs Object
    const vms = new MachinesModel();
    vms.name = "newVMS";
    vms.network = n;
    vms.machines = [vm];
    vms.metadata = "{'testVMs': true}";
    vms.description = "test deploying VMs via ts grid3 client";


    const errors = await validateObject(vms, false);
    for (const e of errors) {
        log(`property: ${e.property}`);
        log(e);
    }
}

function getConstrains(error) {
    if (error.children.length === 0) {
        return error.constrains;
    }

}

test();
