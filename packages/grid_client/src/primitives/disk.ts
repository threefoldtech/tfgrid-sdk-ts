import { Volume } from "../zos/volume";
import { Workload, WorkloadTypes } from "../zos/workload";
import { Mount } from "../zos/zmachine";

class DiskPrimitive {
  createMount(name: string, mountpoint: string): Mount {
    const mount = new Mount();
    mount.name = name;
    mount.mountpoint = mountpoint;
    return mount;
  }
  create(size: number, name: string, metadata = "", description = "", version = 0): Workload {
    const volume = new Volume();
    volume.size = size * 1024 ** 3;

    const volume_workload = new Workload();
    volume_workload.version = version;
    volume_workload.name = name;
    volume_workload.type = WorkloadTypes.volume;
    volume_workload.data = volume;
    volume_workload.metadata = metadata;
    volume_workload.description = description;
    return volume_workload;
  }
  update(size: number, name: string, metadata = "", description = "", old_version = 1): Workload {
    return this.create(size, name, metadata, description, old_version + 1);
  }
}
export { DiskPrimitive };
