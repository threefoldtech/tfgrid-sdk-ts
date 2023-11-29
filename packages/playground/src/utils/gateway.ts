import { type FilterOptions, GatewayFQDNModel, GatewayNameModel, type GridClient } from "@threefold/grid_client";

import { SolutionCode } from "@/types";

import { migrateModule } from "./migration";

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

export interface DeployGatewayNameOptions {
  name: string;
  nodeId: number;
  tlsPassthrough?: boolean;
  ip: string;
  port: number;
  networkName: string;
  fqdn?: string;
}
export async function deployGatewayName(grid: GridClient, options: DeployGatewayNameOptions) {
  const gateway = new GatewayNameModel();
  gateway.name = options.name;
  await grid.gateway.getObj(gateway.name); //invalidating the cashed keys
  gateway.node_id = options.nodeId;
  gateway.tls_passthrough = options.tlsPassthrough || false;
  if (gateway.tls_passthrough) {
    gateway.backends = [`${options.ip}:${options.port}`];
  } else {
    gateway.backends = [`http://${options.ip}:${options.port}`];
  }
  gateway.network = options.networkName;
  gateway.solutionProviderId = +process.env.INTERNAL_SOLUTION_PROVIDER_ID!;
  if (options.fqdn) {
    const domain = gateway as GatewayFQDNModel;
    domain.fqdn = options.fqdn;
    return grid.gateway.deploy_fqdn(domain);
  }
  return grid.gateway.deploy_name(gateway);
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
