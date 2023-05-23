import { Expose } from "class-transformer";
import { ArrayNotEmpty, IsBoolean, IsFQDN, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

import { WorkloadData, WorkloadDataResult } from "./workload_base";

class GatewayFQDNProxy extends WorkloadData {
  @Expose() @IsFQDN() fqdn: string;
  @Expose() @IsBoolean() tls_passthrough: boolean;
  @Expose() @ArrayNotEmpty() @IsUrl({ protocols: ["http", "https"] }, { each: true }) backends: string[];
  @Expose() @IsString() @IsOptional() network?: string;

  challenge(): string {
    let out = "";
    out += this.fqdn;
    out += this.tls_passthrough.toString();
    for (const backend of this.backends) {
      out += backend;
    }
    if (this.network) out += this.network;
    return out;
  }
}

class GatewayNameProxy extends WorkloadData {
  @Expose() @IsString() @IsNotEmpty() name: string;
  @Expose() @IsBoolean() tls_passthrough: boolean;
  @Expose() @ArrayNotEmpty() @IsUrl({ protocols: ["http", "https"] }, { each: true }) backends: string[];
  @Expose() @IsString() @IsOptional() network?: string;

  challenge(): string {
    let out = "";
    out += this.name;
    out += this.tls_passthrough.toString();
    for (const backend of this.backends) {
      out += backend;
    }
    if (this.network) out += this.network;
    return out;
  }
}

class GatewayResult extends WorkloadDataResult {
  fqdn: string;
}

export { GatewayFQDNProxy, GatewayNameProxy, GatewayResult };
