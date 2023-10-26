import type { GridClient } from "@threefold/grid_client";

import { formatConsumption } from "./contracts";
import { updateGrid } from "./grid";
import { normalizeError } from "./helpers";

export interface LoadedDeployments<T> {
  count: number;
  items: T[];
}

interface FailedDeployment {
  name: string;
  nodes: number[];
}

export interface LoadVMsOptions {
  filter?(vm: any): boolean;
}
export async function loadVms(grid: GridClient, options: LoadVMsOptions = {}) {
  const machines = await grid.machines.list();
  let count = machines.length;
  const failedDeployments: FailedDeployment[] = [];

  const promises = machines.map(async name => {
    const nodeIds = await grid.machines._getDeploymentNodeIds(name);
    const machinePromise = grid.machines.getObj(name);
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout"));
      }, 10000);
    });

    try {
      const result = await Promise.race([machinePromise, timeoutPromise]);
      if (result instanceof Error && result.message === "Timeout") {
        console.log(`%c[Error] Timeout loading deployment with name ${name}`, "color: rgb(207, 102, 121)");
        return null;
      } else if ((result as any).length === 0) {
        console.log(`%c[Error] failed to load deployment with name ${name}`, "color: rgb(207, 102, 121)");
        failedDeployments.push({ name, nodes: nodeIds });
      } else {
        return result;
      }
    } catch (e) {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      failedDeployments.push({ name, nodes: nodeIds });
    }
  });
  const items = await Promise.all(promises);
  const vms = items
    .map((item: any, index) => {
      if (item) {
        item.deploymentName = machines[index];
        item.projectName = grid.clientOptions!.projectName;
        item.forEach((i: any) => {
          i.deploymentName = machines[index];
          i.projectName = grid.clientOptions!.projectName;
        });
      }
      return item;
    })
    .filter(item => item && item.length > 0)
    .filter(item => {
      if (options.filter && !options.filter(item)) {
        count--;
        return false;
      }
      return true;
    }) as any[][];
  const consumptions = await Promise.all(
    vms.map(vm => {
      return grid.contracts.getConsumption({ id: vm[0].contractId }).catch(() => undefined);
    }),
  );
  const wireguards = await Promise.all(
    vms.map(vm => getWireguardConfig(grid, vm[0].interfaces[0].network).catch(() => [])),
  );

  const data = vms.map((vm, index) => {
    vm[0].billing = formatConsumption(consumptions[index] as number);
    if (wireguards[index] && wireguards[index].length > 0) {
      vm[0].wireguard = wireguards[index][0];
    }

    return vm;
  });

  return <LoadedDeployments<any[]>>{
    count,
    items: data,
    failedDeployments,
  };
}
export function getWireguardConfig(grid: GridClient, name: string) {
  const projectName = grid.clientOptions!.projectName;
  return updateGrid(grid, { projectName: "" })
    .networks.getWireGuardConfigs({ name })
    .finally(() => updateGrid(grid, { projectName }));
}

export type K8S = { masters: any[]; workers: any[]; deploymentName: string; wireguard?: any };
export async function loadK8s(grid: GridClient) {
  const clusters = await grid.k8s.list();
  const failedDeployments: FailedDeployment[] = [];

  const promises = clusters.map(async (name, index) => {
    const nodeIds = await grid.k8s._getDeploymentNodeIds(name);
    const clusterPromise = grid.k8s.getObj(name);
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout"));
      }, 10000);
    });

    try {
      const result = await Promise.race([clusterPromise, timeoutPromise]);
      if (result instanceof Error && result.message === "Timeout") {
        console.log(`%c[Error] Timeout loading deployment with name ${name}`, "color: rgb(207, 102, 121)");
        return null;
      } else if ((result as any).masters.length === 0 && (result as any).workers.length === 0) {
        console.log(`%c[Error] failed to load deployment with name ${name}`, "color: rgb(207, 102, 121)");
        failedDeployments.push({ name, nodes: nodeIds });
      } else {
        return result;
      }
    } catch (e) {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      failedDeployments.push({ name, nodes: nodeIds });
    }
  });
  const items = (await Promise.all(promises)) as any[];
  const k8s = items
    .map((item, index) => {
      if (item) {
        item.deploymentName = clusters[index];
        item.projectName = grid.clientOptions!.projectName;
      }
      return item;
    })
    .filter(item => item && item.masters.length > 0) as K8S[];
  const consumptions = await Promise.all(
    k8s.map(cluster => {
      return grid.contracts.getConsumption({ id: cluster.masters[0].contractId }).catch(() => undefined);
    }),
  );

  const wireguards = await Promise.all(
    k8s.map(cluster => getWireguardConfig(grid, cluster.masters[0].interfaces[0].network).catch(() => [])),
  );
  const data = k8s.map((cluster, index) => {
    cluster.masters[0].billing = formatConsumption(consumptions[index] as number);

    if (wireguards && wireguards[index]) {
      cluster.wireguard = wireguards[index][0];
    }
    return cluster as K8S;
  });

  return <LoadedDeployments<K8S>>{
    count: clusters.length,
    items: data,
    failedDeployments,
  };
}

export function mergeLoadedDeployments<T>(...deployments: LoadedDeployments<T>[]) {
  return deployments.reduce(
    (res, current) => {
      res.count += current.count;
      res.items = res.items.concat(current.items);
      return res;
    },
    { count: 0, items: [] },
  );
}
