import { WorkloadData, WorkloadDataResult } from "./workload_base";

class Zlogs extends WorkloadData {
    public zmachine: string;
    public output: string;

    public challenge(): string {
        let out = "";
        out += this.zmachine;
        out += this.output;

        return out;
    }
}

class ZlogsResult extends WorkloadDataResult {}

export { Zlogs, ZlogsResult };
