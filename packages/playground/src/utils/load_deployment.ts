import type { GridClient } from "@threefold/grid_client";

import { formatConsumption } from "./contracts";
import { getGrid, updateGrid } from "./grid";
import { normalizeError } from "./helpers";

export interface LoadedDeployments<T> {
  count: number;
  items: T[];
}

export interface LoadVMsOptions {
  filter?(vm: any): boolean;
}
export async function loadVms(grid: GridClient, options: LoadVMsOptions = {}) {
  const machines = await grid.machines.list();
  let count = machines.length;
  const failedDeployments: string[] = [];

  const projectName = grid.clientOptions.projectName;
  const grids = (await Promise.all(
    machines.map(n => getGrid(grid.clientOptions, `${projectName}/${n}`)),
  )) as GridClient[];

  const promises = machines.map((name, index) => {
    return grids[index].machines.getObj(name).catch(e => {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      failedDeployments.push(name);
    });
  });
  const items = await Promise.all(promises);
  const vms = items
    .map((item: any, index) => {
      if (item) {
        item.deploymentName = machines[index];
        item.projectName = grids[index].clientOptions!.projectName;
        item.forEach((i: any) => {
          i.deploymentName = machines[index];
          i.projectName = grids[index].clientOptions!.projectName;
        });
      }
      return item;
    })
    .filter(item => {
      if (item?.length === 0) {
        count--;
        return false;
      }
      return item && item.length > 0;
    })
    .filter(item => {
      if (options.filter && !options.filter(item)) {
        count--;
        return false;
      }
      return true;
    }) as any[][];
  const consumptions = await Promise.all(
    vms.map((vm, index) => {
      return grids[index].contracts.getConsumption({ id: vm[0].contractId }).catch(() => undefined);
    }),
  );
  const wireguards = await Promise.all(
    vms.map((vm, index) => getWireguardConfig(grids[index], vm[0].interfaces[0].network).catch(() => [])),
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
  const failedK8s: string[] = [];

  const projectName = grid.clientOptions.projectName;
  const grids = (await Promise.all(
    clusters.map(n => getGrid(grid.clientOptions, `${projectName}/${n}`)),
  )) as GridClient[];

  const promises = clusters.map((name, index) => {
    return grids[index].k8s.getObj(name).catch(e => {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      failedK8s.push(name);
      return null;
    });
  });
  const items = (await Promise.all(promises)) as any[];
  const k8s = items
    .map((item, index) => {
      if (item) {
        item.deploymentName = clusters[index];
        item.projectName = grids[index].clientOptions!.projectName;
      }
      return item;
    })
    .filter(item => item && item.masters.length > 0) as K8S[];
  const consumptions = await Promise.all(
    k8s.map((cluster, index) => {
      return grids[index].contracts.getConsumption({ id: cluster.masters[0].contractId }).catch(() => undefined);
    }),
  );

  const wireguards = await Promise.all(
    k8s.map((cluster, index) =>
      getWireguardConfig(grids[index], cluster.masters[0].interfaces[0].network).catch(() => []),
    ),
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
    failedK8s,
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
