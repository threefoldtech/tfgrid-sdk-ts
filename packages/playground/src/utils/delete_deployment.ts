import type { GridClient } from "@threefold/grid_client";

import { ProjectName } from "@/types";

import { loadVM } from "./deploy_vm";
import { getDeploymentIps, getSubdomain, loadDeploymentGateways } from "./gateway";
import { updateGrid } from "./grid";

export interface DeleteDeploymentOptions {
  deploymentName?: string;
  name: string;
  projectName: ProjectName;
  ip?: string[];
  k8s?: boolean;
  isCaprover?: boolean;
}

export async function deleteDeployment(grid: GridClient, options: DeleteDeploymentOptions) {
  /* Delete qsfs_zdbs */
  if (options.projectName === ProjectName.QVM) {
    const qvm = await loadVM(grid, options.name);
    if ((<any>qvm)[0].mounts.length) {
      await grid.qsfs_zdbs.delete({ name: (<any>qvm)[0].mounts[0].name });
    }
  }

  /* Start Delete gateway */

  /* For fvm/vm */
  if (isVm(options.projectName)) {
    await deleteVmGateways(grid, options.ip);
  }

  /* For solutions */
  if (solutionHasGateway(options.projectName)) {
    await deleteDeploymentGateway(grid, options);
  }

  /* End Delete gateway */

  /* Delete deployment */
  if (options.k8s) {
    const result = await grid.k8s.delete({ name: options.name });
    try {
      await deleteK8sGateways(grid, options.name, options.ip);
    } catch (error) {
      console.error("Error during gateway cleanup after K8s deletion:", error);
    }
    return result;
  }
  // if Caprover deployment should handled by machines.delete
  if (options.deploymentName && !options.isCaprover) {
    return grid.machines.delete_machine({ deployment_name: options.deploymentName, name: options.name });
  }

  return grid.machines.delete({ name: options.name });
}

export async function deleteDeploymentGateway(grid: GridClient, options: DeleteDeploymentOptions) {
  const subdomain = getSubdomain({
    deploymentName: options.name,
    projectName: options.projectName,
    twinId: grid.twinId,
  });
  for (const projectName of [options.projectName, ProjectName.Gateway, ""]) {
    if (await deleteGateway(updateGrid(grid, { projectName }), subdomain)) {
      break;
    }
  }

  updateGrid(grid, { projectName: options.projectName });
}

export async function deleteGateway(grid: GridClient, name: string) {
  const { deleted } = await grid.gateway.delete_name({ name });
  return deleted.length > 0;
}
export async function deleteGatewayDeployment(grid: GridClient, name: string) {
  return await grid.gateway.delete_name({ name });
}

export function solutionHasGateway(projectName: ProjectName) {
  const solutions = [
    ProjectName.Discourse,
    ProjectName.Funkwhale,
    ProjectName.Mastodon,
    ProjectName.Mattermost,
    ProjectName.Casperlabs,
    ProjectName.Owncloud,
    ProjectName.Peertube,
    ProjectName.Subsquid,
    ProjectName.Taiga,
    ProjectName.Wordpress,
    ProjectName.Nextcloud,
    ProjectName.Openwebui,
    ProjectName.Gitea,
    ProjectName.Jenkins,
    ProjectName.Jitsi,
    ProjectName.Nostr,
    ProjectName.StaticWebsite,
    ProjectName.NodePilot,
    ProjectName.Openwebui,
  ];

  for (const solution of solutions) {
    if (projectName.includes(solution) || projectName.includes(solution.toLowerCase())) {
      return true;
    }
  }

  return false;
}

function isVm(projectName: string) {
  for (const vm of [ProjectName.Fullvm, ProjectName.VM]) {
    if (projectName.includes(vm) || projectName.includes(vm.toLowerCase())) {
      return true;
    }
  }

  return false;
}

async function deleteGatewaysByIps(grid: GridClient, ips: string[]) {
  if (!ips.length) return;

  const { gateways } = await loadDeploymentGateways(grid, {
    filter: gw => gw.backends.some(bk => ips.some(ip => bk.includes(ip))),
  });

  if (gateways.length === 0) return;

  const deletionPromises = gateways.map(async gateway => {
    if (gateway.type.includes("name")) {
      return await grid.gateway.delete_name(gateway);
    } else {
      return await grid.gateway.delete_fqdn(gateway);
    }
  });

  // Wait for all gateway deletions to complete
  await Promise.allSettled(deletionPromises);
}

async function deleteVmGateways(grid: GridClient, ips?: string[]) {
  if (!ips || ips.length === 0) return;
  await deleteGatewaysByIps(grid, ips);
}

async function deleteK8sGateways(grid: GridClient, deploymentName: string, ips?: string[]) {
  // Get deployment IPs - try from deployment first, fallback to provided IPs
  let deploymentIps: string[] = [];

  try {
    const k8sDeployment = await grid.k8s.getObj(deploymentName);
    const fetchedIps = [
      ...(k8sDeployment.masters?.flatMap(getDeploymentIps) ?? []),
      ...(k8sDeployment.workers?.flatMap(getDeploymentIps) ?? []),
    ];

    if (fetchedIps.length > 0) {
      deploymentIps = fetchedIps;
    } else if (ips && ips.length > 0) {
      deploymentIps = ips;
    }
  } catch (error) {
    console.error("Error while fetching K8s deployment for gateway deletion:", error);
    if (ips && ips.length > 0) {
      deploymentIps = ips;
    }
  }

  if (deploymentIps.length === 0) return;

  // Delete all gateways pointing to this K8s cluster
  await deleteGatewaysByIps(grid, deploymentIps);
}
