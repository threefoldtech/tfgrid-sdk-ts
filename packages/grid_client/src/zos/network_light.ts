import { Expose, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

import { ValidateMembers } from "../helpers";
import { WorkloadTypes } from "./workload";
import { WorkloadData } from "./workload_base";
import { Mycelium, Peer } from "./znet";

@ValidateMembers()
class NetworkLight extends WorkloadData {
  @Expose() __type: WorkloadTypes = WorkloadTypes.networklight;
  @Expose() @IsString() @IsOptional() ip_range?: string;
  @Expose() @IsString() @IsNotEmpty() subnet: string;
  @Expose() @IsString() @IsOptional() wireguard_private_key?: string;
  @Expose() @IsInt() @IsOptional() wireguard_listen_port?: number;
  @Expose() @IsOptional() @Type(() => Peer) @ValidateNested({ each: true }) peers?: Peer[];
  @Expose() @IsOptional() @Type(() => Mycelium) @ValidateNested() mycelium?: Mycelium;

  challenge(): string {
    let out = "";
    out += this.ip_range || "";
    out += this.subnet;
    out += this.wireguard_private_key || "";
    out += this.wireguard_listen_port || "";
    if (this.peers) {
      for (let i = 0; i < this.peers.length; i++) {
        out += this.peers[i].challenge();
      }
    }
    out += this.mycelium?.challenge();
    return out;
  }
}

export { NetworkLight };
