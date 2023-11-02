import type { GridClient } from "@threefold/grid_client";

import { ProjectName } from "@/types";

import { loadVM } from "./deploy_vm";
import { getSubdomain, loadDeploymentGateways } from "./gateway";
import { updateGrid } from "./grid";

export interface DeleteDeploymentOptions {
  name: string;
  projectName: ProjectName;
  k8s?: boolean;
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
    await deleteVmGateways(grid);
  }

  /* For solutions */
  if (solutionHasGateway(options.projectName)) {
    await deleteDeploymentGateway(grid, options);
  }

  /* End Delete gateway */

  /* Delete deployment */
  return options.k8s ? grid.k8s.delete({ name: options.name }) : grid.machines.delete({ name: options.name });
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

export function solutionHasGateway(projectName: ProjectName) {
  const solutions = [
    ProjectName.Discourse,
    ProjectName.Funkwhale,
    ProjectName.Mastodon,
    ProjectName.Mattermost,
    ProjectName.Owncloud,
    ProjectName.Peertube,
    ProjectName.Subsquid,
    ProjectName.Taiga,
    ProjectName.Wordpress,
    ProjectName.Nextcloud,
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

async function deleteVmGateways(grid: GridClient) {
  const gateways = await loadDeploymentGateways(grid);
  for (const gateway of gateways) {
    try {
      if (gateway.type.includes("name")) {
        await grid.gateway.delete_name(gateway);
      } else {
        await grid.gateway.delete_fqdn(gateway);
      }
    } catch (error) {
      console.log("Error while deleting vm gateway", error);
    }
  }
}
