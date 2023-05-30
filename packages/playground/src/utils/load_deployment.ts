import type { GridClient, NetworkGetModel } from "@threefold/grid_client";

import { formatConsumption } from "./contracts";
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

  const promises = machines.map(name => {
    return grid.machines.getObj(name).catch(e => {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      return null;
    });
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

  const data = vms.map((vm, index) => {
    vm[0].billing = formatConsumption(consumptions[index] as number);
    return vm;
  });

  return <LoadedDeployments<any[]>>{
    count,
    items: data,
  };
}
export default function getWireguardConfig(grid: GridClient, name: string) {
  return grid.networks.getWireGuardConfigs({ name });
}

export type K8S = { masters: any[]; workers: any[]; deploymentName: string; wireguard?: any };
export async function loadK8s(grid: GridClient) {
  const clusters = await grid.k8s.list();
  const promises = clusters.map(name => {
    return grid.k8s.getObj(name).catch(e => {
      console.log(
        `%c[Error] failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
        "color: rgb(207, 102, 121)",
      );
      return null;
    });
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
    cluster.wireguard = wireguards[index][0];
    return cluster as K8S;
  });

  return <LoadedDeployments<K8S>>{
    count: clusters.length,
    items: data,
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
