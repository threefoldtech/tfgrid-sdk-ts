import {
  type FilterOptions,
  GatewayFQDNModel,
  GatewayNameModel,
  type GridClient,
  type ZmachineData,
} from "@threefold/grid_client";
import validator from "validator";

import { SolutionCode } from "@/types";
import type { DomainInfo } from "@/types/nodeSelector";

export function loadGatewayNodes(grid: GridClient, options: Omit<FilterOptions, "gateway"> = {}) {
  return grid.capacity
    .filterNodes({
      gateway: true,
      ...options,
    })
    .catch(() => []);
}

export interface GetHostnameOptions {
  deploymentName: string;
  projectName: string;
  twinId: number;
}
export function getSubdomain(options: GetHostnameOptions) {
  const [projectName] = options.projectName.split("/");
  return SolutionCode[projectName as keyof typeof SolutionCode] + options.twinId + options.deploymentName.toLowerCase();
}

export interface DeployGatewayConfig {
  subdomain: string;
  ip: string;
  port: number;
  network?: string;
  tlsPassthrough?: boolean;
}

export async function deployGatewayName(
  grid: GridClient | null,
  domain: DomainInfo | undefined,
  config: DeployGatewayConfig,
) {
  if (!grid) {
    throw new Error("Please provide a valid grid connection");
  }

  if (!domain || !domain.selectedDomain) {
    throw new Error("Please provide a valid domain name data.");
  }

  //invalidating the cashed keys
  await grid.gateway.getObj(config.subdomain);

  const id = process.env.INTERNAL_SOLUTION_PROVIDER_ID;

  const gw = new GatewayNameModel();
  gw.name = config.subdomain;
  gw.node_id = domain.selectedDomain.nodeId;
  gw.tls_passthrough = config.tlsPassthrough || false;
  gw.network = config.network;
  gw.solutionProviderId = id ? +id : undefined;

  if (validator.isIP(config.ip, "6")) {
    gw.backends = [`${config.tlsPassthrough ? "" : "http://"}[${config.ip}]:${config.port}`];
  } else {
    gw.backends = [`${config.tlsPassthrough ? "" : "http://"}${config.ip}:${config.port}`];
  }

  if (domain.useFQDN) {
    (gw as GatewayFQDNModel).fqdn = domain.customDomain;
    return grid.gateway.deploy_fqdn(gw as GatewayFQDNModel);
  }

  return grid.gateway.deploy_name(gw);
}

export async function rollbackDeployment(grid: GridClient, name: string) {
  const result = await grid.machines.delete({ name });

  if (result.deleted.length === 0) {
    throw new Error(`Failed to delete deployment with name "${name}".`);
  }

  return result;
}
export async function rollbackGateway(grid: GridClient, name: string) {
  const result = await grid.gateway.delete_name({ name });
  return result;
}

export type GridGateway = Awaited<ReturnType<GridClient["gateway"]["getObj"]>>[0];
interface LoadDeploymentGatewaysOptions {
  filter?: (gateway: GridGateway) => boolean;
}

export async function loadDeploymentGateways(grid: GridClient, options?: LoadDeploymentGatewaysOptions) {
  const failedToList: string[] = [];
  const gws = await grid.gateway.list();
  const items = await Promise.all(
    gws.map(gw => {
      let timeout: ReturnType<typeof setTimeout>;

      return Promise.race([
        grid.gateway.getObj(gw),
        new Promise((_, rej) => {
          timeout = setTimeout(() => {
            rej("Timeout!");
          }, window.env.TIMEOUT);
        }),
      ])
        .catch(() => {
          failedToList.push(gw);
          return null;
        })
        .finally(() => timeout && clearTimeout(timeout));
    }),
  );

  const filter = options?.filter ?? (() => true);
  return {
    gateways: items
      .flat()
      .filter(Boolean)
      .filter(filter as any) as GridGateway[],
    failedToList,
  };
}

/**
 * Extracts the domain or IP address from a given URL.
 * Supports both IPv4 and IPv6 addresses, handling protocols (http:// or https://).
 *
 * @param {string} domainBackend - The input URL or domain, possibly containing a protocol.
 * @returns {string} - The extracted domain or IP address.
 * @throws {Error} - Throws an error if the input is invalid:
 *   - If the URL does not contain a domain or IP address.
 *   - If the IPv6 address format is invalid.
 *
 * @example
 * extractDomainIP("https://example.com:8080"); // Returns: "example.com"
 * extractDomainIP("https://[::1]:8080"); // Returns: "::1"
 * extractDomainIP("http://:8080"); // Throws an error: "Invalid input "<domain>": No domain or IP address found."
 */

export function extractDomainIP(domainBackend: string) {
  const ip = domainBackend.replace("https://", "").replace("http://", "");
  // Handle IPv6
  if (domainBackend.includes("[")) {
    const ipAddress = ip.replace(/\[/g, "").split("]:")[0];
    if (!ipAddress) {
      throw new Error(`Invalid input "${domainBackend}": Invalid IPv6 address format.`);
    }
    return ipAddress;
  }

  // Check for domain or IP address part
  const result = ip.split(":")[0];

  if (!result) {
    throw new Error(`Invalid input "${domainBackend}": No domain or IP address found.`);
  }

  return result;
}

/**
 * Collect the deployment interfaces ips
 * @param item deployment data
 * @returns {string[]} list of strings
 */
export function getDeploymentIps(item: ZmachineData | any): string[] {
  const ips = [];
  // wg ip
  if (item.interfaces) {
    for (const iface of item.interfaces) {
      if (iface.ip) ips.push(iface.ip);
    }
  }
  // public ip, ipv6
  if (item.publicIP) {
    if (item.publicIP.ip) ips.push(item.publicIP.ip.split("/")[0]);
    if (item.publicIP.ip6) ips.push(item.publicIP.ip6.split("/")[0]);
  }
  if (item.planetary) ips.push(item.planetary);
  if (item.myceliumIP) ips.push(item.myceliumIP);
  return ips;
}
