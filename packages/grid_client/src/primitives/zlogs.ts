import { Workload, WorkloadTypes, Zlogs } from "../zos";

class ZlogsPrimitive {
    create(name: string, output: string, metadata = "", description = "", version = 0): Workload {
        const zlogs = new Zlogs();
        zlogs.zmachine = name;
        zlogs.output = output;

        const zlogs_workload = new Workload();
        zlogs_workload.version = version;
        zlogs_workload.name = "zlogs_" + name;
        zlogs_workload.type = WorkloadTypes.zlogs;
        zlogs_workload.data = zlogs;
        zlogs_workload.metadata = metadata;
        zlogs_workload.description = description;

        return zlogs_workload;
    }
}

export { ZlogsPrimitive };
