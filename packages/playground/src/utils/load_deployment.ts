import { type ClientOptions, type GridClient } from "@threefold/grid_client";

import { batchProcess } from "./batch_process";
import { formatConsumption } from "./contracts";
import { getGrid, updateGrid } from "./grid";
import { normalizeError } from "./helpers";
import { migrateModule } from "./migration";
export interface LoadedDeployments<T> {
  count: number;
  items: T[];
  failedDeployments: FailedDeployment[];
}

interface FailedDeployment {
  name: string;
  nodes: number[];
  contracts: any[];
}

export interface LoadVMsOptions {
  filter?(vm: any): boolean;
}

const gridClientCache = new Map<string, GridClient>();

export async function getGridClient(config: ClientOptions, projectName: string): Promise<GridClient> {
  const cacheKey = `${config.mnemonic}-${projectName}`;
  if (gridClientCache.has(cacheKey)) {
    return gridClientCache.get(cacheKey)!;
  }

  const grid = await getGrid(config, projectName);
  if (!grid) {
    throw new Error("Failed to create grid client");
  }
  gridClientCache.set(cacheKey, grid);
  return grid;
}

async function getDeploymentContracts(grid: GridClient, name: string, projectName: string) {
  const contracts1 = await grid.machines.getDeploymentContracts(name);
  if (contracts1.length) {
    return contracts1;
  }

  // will raise error if can't decrypt
  const contracts2 = await updateGrid(grid, { projectName }).machines.getDeploymentContracts(name);
  return contracts2;
}

export async function loadVms(grid: GridClient, options: LoadVMsOptions = {}) {
  await migrateModule(grid.machines);

  let count = 0;
  const machines = await grid.machines.list();
  count = machines.length;
  const failedDeployments: FailedDeployment[] = [];

  const projectName = grid.clientOptions.projectName || "";

  const grids = await Promise.all(
    machines.map(n => getGridClient(grid.clientOptions, projectName ? `${projectName}/${n}` : n)),
  );

  const machinePromises = machines.map(async (name, index) => {
    try {
      const [contracts, nodeIds] = await Promise.all([
        getDeploymentContracts(grids[index], name, projectName),
        grids[index].machines._getDeploymentNodeIds(name),
      ]);

      if (contracts.length === 0) {
        count--;
        return null;
      }

      const machinePromise = grids[index].machines.getObj(name).then(res => {
        if (!projectName && (!Array.isArray(res) || res.length === 0)) {
          grids[index] = updateGrid(grids[index], { projectName: "" });
          return grids[index].machines.getObj(name);
        }
        return res;
      });

      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Timeout"));
        }, window.env.TIMEOUT);
      });

      try {
        const result = await Promise.race([machinePromise, timeoutPromise]);
        if (result instanceof Error && result.message === "Timeout") {
          console.error(`Timeout loading deployment with name ${name}`);
          return null;
        }
        return result;
      } catch (e) {
        console.error(`Failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`);
        failedDeployments.push({ name, nodes: nodeIds, contracts });
        return null;
      }
    } catch {
      failedDeployments.push({ name, contracts: [], nodes: [] });
      return null;
    }
  });

  const results = await Promise.allSettled(machinePromises);
  const items = results.map(result => (result.status === "fulfilled" ? result.value : null));
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

  const BATCH_SIZE = 10;
  const consumptions = await batchProcess(vms, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(vm => {
        const gridIndex = vms.indexOf(vm);
        return grids[gridIndex].contracts.getConsumption({ id: vm[0].contractId }).catch(() => undefined);
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : undefined));
  });

  const wireguards = await batchProcess(vms, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(vm => {
        const gridIndex = vms.indexOf(vm);
        return getWireguardConfig(grids[gridIndex], vm[0].interfaces[0].network, vm[0].interfaces[0].ip).catch(
          () => [],
        );
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : []));
  });

  const data = vms.map((vm, index) => {
    for (let i = 0; i < vm.length; i++) {
      vm[i].billing = formatConsumption(consumptions[index]?.amountBilled as number);
      if (wireguards[index] && wireguards[index].length > 0) {
        vm[i].wireguard = wireguards[index][0];
      }
    }

    return vm;
  });

  return <LoadedDeployments<any[]>>{
    count,
    items: data,
    failedDeployments,
  };
}
export function getWireguardConfig(grid: GridClient, name: string, ipRange: string) {
  const projectName = grid.clientOptions!.projectName;
  if (!ipRange.endsWith("/16")) {
    const parts = ipRange.split(".");
    parts[2] = parts[3] = "0";
    ipRange = parts.join(".") + "/16";
  }
  return updateGrid(grid, { projectName: "" })
    .networks.getWireGuardConfigs({ name, ipRange })
    .finally(() => updateGrid(grid, { projectName }));
}

export type K8S = { masters: any[]; workers: any[]; deploymentName: string; projectName: string; wireguard?: any };
export async function loadK8s(grid: GridClient) {
  await migrateModule(grid.k8s);

  const clusters = await grid.k8s.list();
  if (clusters.length === 0) {
    return <LoadedDeployments<K8S>>{
      count: 0,
      items: [],
      failedDeployments: [],
    };
  }

  const projectName = grid.clientOptions.projectName;
  const grids = (await Promise.all(
    clusters.map(n => getGrid(grid.clientOptions, projectName ? `${projectName}/${n}` : n)),
  )) as GridClient[];
  const failedDeployments: FailedDeployment[] = [];

  const BATCH_SIZE = 5;
  const contractsAndNodeIds: { contracts: any[]; nodeIds: number[]; success: boolean }[] = await batchProcess(
    clusters,
    BATCH_SIZE,
    async batch => {
      return await Promise.all(
        batch.map(async name => {
          const globalIndex = clusters.indexOf(name);
          try {
            const [contracts, nodeIds] = await Promise.all([
              grids[globalIndex].k8s.getDeploymentContracts(name),
              grids[globalIndex].k8s._getDeploymentNodeIds(name),
            ]);
            return { contracts, nodeIds, success: true };
          } catch {
            failedDeployments.push({ name, contracts: [], nodes: [] });
            return { contracts: [], nodeIds: [], success: false };
          }
        }),
      );
    },
  );

  const clusterObjs: any[] = await batchProcess(clusters, BATCH_SIZE, async batch => {
    return await Promise.all(
      batch.map(async name => {
        const index = clusters.indexOf(name);
        const { contracts, nodeIds, success } = contractsAndNodeIds[index];
        if (!success) return null;

        try {
          const clusterPromise = grids[index].k8s.getObj(name).then(res => {
            if (!projectName && res && res.masters && res.masters.length === 0) {
              grids[index] = updateGrid(grids[index], { projectName: "" });
              return grids[index].k8s.getObj(name);
            }
            return res;
          });
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Timeout"));
            }, window.env.TIMEOUT);
          });

          const result = await Promise.race([clusterPromise, timeoutPromise]);
          if (result instanceof Error && result.message === "Timeout") {
            console.error(`Timeout loading deployment with name ${name}`);
            return null;
          } else if ((result as any).masters.length === 0 && (result as any).workers.length === 0) {
            console.error(`Failed to load deployment with name ${name}`);
            failedDeployments.push({ name, nodes: nodeIds, contracts: contracts });
            return null;
          } else {
            return result;
          }
        } catch (e) {
          console.error(
            `Failed to load deployment with name ${name}:\n${normalizeError(e, "No errors were provided.")}`,
          );
          failedDeployments.push({ name, nodes: nodeIds, contracts: contracts });
          return null;
        }
      }),
    );
  });

  const items = clusterObjs.filter(Boolean) as any[];
  const k8s = items
    .map(item => {
      if (item) {
        item.deploymentName = clusters[clusterObjs.indexOf(item)];
        item.projectName = grids[clusterObjs.indexOf(item)].clientOptions!.projectName;
      }
      return item;
    })
    .filter(item => item && item.masters.length > 0) as K8S[];

  const consumptions = await batchProcess(k8s, BATCH_SIZE, async batch => {
    return Promise.all(
      batch.map(cluster => {
        const gridIndex = clusters.findIndex(name => name === cluster.deploymentName);
        return grids[gridIndex].contracts.getConsumption({ id: cluster.masters[0].contractId }).catch(() => undefined);
      }),
    );
  });

  const wireguards = await batchProcess(k8s, BATCH_SIZE, async batch => {
    return Promise.all(
      batch.map(cluster => {
        const gridIndex = clusters.findIndex(name => name === cluster.deploymentName);
        return getWireguardConfig(
          grids[gridIndex],
          cluster.masters[0].interfaces[0].network,
          cluster.masters[0].interfaces[0].ip,
        ).catch(() => []);
      }),
    );
  });

  const data = k8s.map((cluster, index) => {
    cluster.masters[0].billing = formatConsumption(consumptions[index]?.amountBilled as number);

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
      insertIfNotFound(current, res);
      res.count += current.count;
      return res;
    },
    { count: 0, items: [], failedDeployments: [] },
  );
}

function insertIfNotFound(newItems: LoadedDeployments<any>, oldItems: LoadedDeployments<any>) {
  for (const item of newItems.items) {
    let found = false;
    for (const i of oldItems.items) {
      if (item.deploymentName === i.deploymentName) {
        found = true;
        newItems.count--;
      }
    }
    if (!found) {
      oldItems.items.push(item);
    }
  }
  for (const item of newItems.failedDeployments) {
    let found = false;
    for (const i of oldItems.failedDeployments) {
      if (item.name === i.name) {
        found = true;
        newItems.count--;
      }
    }
    if (!found) {
      oldItems.failedDeployments.push(item);
    }
  }
}
