import { Expose } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

import { ValidateMembers } from "../helpers";
import { WorkloadData, WorkloadDataResult } from "./workload_base";

@ValidateMembers()
class Volume extends WorkloadData {
  @Expose() @IsInt() @Min(100 * 1024 ** 2) @Max(10 * 1024 ** 4) size: number; // in bytes

  challenge(): string {
    return this.size.toString();
  }
}

class VolumeResult extends WorkloadDataResult {
  @Expose() volume_id: string;
}
export { Volume, VolumeResult };
