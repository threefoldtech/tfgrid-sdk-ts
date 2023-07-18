import { type FilterOptions, GatewayFQDNModel, GatewayNameModel, type GridClient } from "@threefold/grid_client";

import { SolutionCode } from "@/types";

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
  return (
    SolutionCode[options.projectName as keyof typeof SolutionCode] +
    options.twinId +
    options.deploymentName.toLowerCase()
  );
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
  gateway.backends = [`http://${options.ip}:${options.port}`];
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
