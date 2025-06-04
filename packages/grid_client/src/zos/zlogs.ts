import { Expose } from "class-transformer";
import { IsString } from "class-validator";

import { ValidateMembers } from "../helpers";
import { WorkloadData, WorkloadDataResult } from "./workload_base";

@ValidateMembers()
class Zlogs extends WorkloadData {
  @Expose() readonly __type: string = "zlogs";
  @Expose() @IsString() zmachine: string;
  @Expose() @IsString() public output: string;

  public challenge(): string {
    let out = "";
    out += this.zmachine;
    out += this.output;

    return out;
  }
}

class ZlogsResult extends WorkloadDataResult {}

export { Zlogs, ZlogsResult };
