import { Expose } from "class-transformer";
import { ValidateMembers } from "../helpers";
import { WorkloadData, WorkloadDataResult } from "./workload_base";
import { WorkloadTypes } from "./workload";

@ValidateMembers()
class Zlogs extends WorkloadData {
  @Expose() readonly __type: string = "zlogs";
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
