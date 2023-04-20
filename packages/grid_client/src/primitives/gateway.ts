import { GatewayFQDNProxy, GatewayNameProxy } from "../zos/gateway";
import { Workload, WorkloadTypes } from "../zos/workload";

class GWPrimitive {
  createFQDN(
    fqdn: string,
    tls_passthrough: boolean,
    backends: string[],
    name: string,
    network?: string,
    metadata = "",
    description = "",
    version = 0,
  ): Workload {
    const fqdnObj = new GatewayFQDNProxy();
    fqdnObj.fqdn = fqdn;
    fqdnObj.tls_passthrough = tls_passthrough;
    fqdnObj.backends = backends;
    fqdnObj.network = network;

    const fqdn_workload = new Workload();
    fqdn_workload.version = version;
    fqdn_workload.name = name;
    fqdn_workload.type = WorkloadTypes.gatewayfqdnproxy;
    fqdn_workload.data = fqdnObj;
    fqdn_workload.metadata = metadata;
    fqdn_workload.description = description;

    return fqdn_workload;
  }

  updateFQDN(
    fqdn: string,
    tls_passthrough: boolean,
    backends: string[],
    name: string,
    network?: string,
    metadata = "",
    description = "",
    old_version = 1,
  ): Workload {
    return this.createFQDN(fqdn, tls_passthrough, backends, name, network, metadata, description, old_version + 1);
  }

  createName(
    name: string,
    tls_passthrough: boolean,
    backends: string[],
    network?: string,
    metadata = "",
    description = "",
    version = 0,
  ): Workload {
    const nameObj = new GatewayNameProxy();
    nameObj.name = name;
    nameObj.tls_passthrough = tls_passthrough;
    nameObj.backends = backends;
    nameObj.network = network;

    const name_workload = new Workload();
    name_workload.version = version;
    name_workload.name = name;
    name_workload.type = WorkloadTypes.gatewaynameproxy;
    name_workload.data = nameObj;
    name_workload.metadata = metadata;
    name_workload.description = description;

    return name_workload;
  }

  updateName(
    name: string,
    tls_passthrough: boolean,
    backends: string[],
    network?: string,
    metadata = "",
    description = "",
    old_version = 1,
  ): Workload {
    return this.createName(name, tls_passthrough, backends, network, metadata, description, old_version + 1);
  }
}
export { GWPrimitive };
