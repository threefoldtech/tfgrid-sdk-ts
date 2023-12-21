import { type FilterOptions, GatewayFQDNModel, GatewayNameModel, type GridClient } from "@threefold/grid_client";

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
  network: string;
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
  gw.backends = [`${config.tlsPassthrough ? "" : "http://"}${config.ip}:${config.port}`];
  gw.network = config.network;
  gw.solutionProviderId = id ? +id : undefined;

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

export type GridGateway = Awaited<ReturnType<GridClient["gateway"]["getObj"]>>[0];
export async function loadDeploymentGateways(grid: GridClient) {
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
  return { gateways: items.flat().filter(Boolean) as GridGateway[], failedToList };
}
