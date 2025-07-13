import { type ClientOptions, type GridClient } from "@threefold/grid_client";

import { batchProcess } from "./batch_process";
import { formatConsumption } from "./contracts";
import { getGrid } from "./grid";
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

  const gridWithProject = await getGridClient(grid.clientOptions, projectName);
  const contracts2 = await gridWithProject.machines.getDeploymentContracts(name);
  return contracts2;
}

export async function loadVms(grid: GridClient, options: LoadVMsOptions = {}) {
  await migrateModule(grid.machines);

  let count = 0;
  const machines = await grid.machines.list();
  count = machines.length;
  const failedDeployments: FailedDeployment[] = [];

  const projectName = grid.clientOptions.projectName || "";

  const gridsResults = await Promise.allSettled(
    machines.map(n => getGridClient(grid.clientOptions, projectName ? `${projectName}/${n}` : n)),
  );
  const grids = gridsResults.map(r => (r.status === "fulfilled" ? r.value : undefined));

  const machinePromises = machines.map(async (name, index) => {
    try {
      if (!grids[index]) {
        throw new Error("Grid client unavailable");
      }
      const [contractsResult, nodeIdsResult] = await Promise.allSettled([
        getDeploymentContracts(grids[index]!, name, projectName),
        grids[index]!.machines._getDeploymentNodeIds(name),
      ]);
      const contracts = contractsResult.status === "fulfilled" ? contractsResult.value : [];
      const nodeIds = nodeIdsResult.status === "fulfilled" ? nodeIdsResult.value : [];

      if (contracts.length === 0) {
        count--;
        return null;
      }

      const machinePromise = grids[index]!.machines.getObj(name).then(res => {
        if (!projectName && (!Array.isArray(res) || res.length === 0)) {
          return getGridClient(grid.clientOptions, "").then(emptyProjectGrid => {
            grids[index] = emptyProjectGrid;
            return emptyProjectGrid.machines.getObj(name);
          });
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
        item.projectName = grids[index]?.clientOptions?.projectName;
        item.forEach((i: any) => {
          i.deploymentName = machines[index];
          i.projectName = grids[index]?.clientOptions?.projectName;
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
        if (!grids[gridIndex]) return Promise.resolve(undefined);
        return grids[gridIndex]!.contracts.getConsumption({ id: vm[0].contractId }).catch(() => undefined);
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : undefined));
  });

  const wireguards = await batchProcess(vms, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(vm => {
        const gridIndex = vms.indexOf(vm);
        if (!grids[gridIndex]) return Promise.resolve([]);
        return getWireguardConfig(grids[gridIndex]!, vm[0].interfaces[0].network, vm[0].interfaces[0].ip).catch(
          () => [],
        );
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : []));
  });

  const data = vms.map((vm, index) => {
    for (let i = 0; i < vm.length; i++) {
      vm[i].billing = formatConsumption(consumptions.results[index]?.amountBilled as number);
      if (wireguards.results[index] && wireguards.results[index].length > 0) {
        vm[i].wireguard = wireguards.results[index][0];
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
export async function getWireguardConfig(grid: GridClient, name: string, ipRange: string) {
  if (!ipRange.endsWith("/16")) {
    const parts = ipRange.split(".");
    parts[2] = parts[3] = "0";
    ipRange = parts.join(".") + "/16";
  }

  // Use cached getGridClient with empty project name instead of updateGrid
  const emptyProjectGrid = await getGridClient(grid.clientOptions, "");
  return emptyProjectGrid.networks.getWireGuardConfigs({ name, ipRange });
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
  const gridsK8sResults = await Promise.allSettled(
    clusters.map(n => getGrid(grid.clientOptions, projectName ? `${projectName}/${n}` : n)),
  );
  const grids = gridsK8sResults.map(r => (r.status === "fulfilled" ? r.value : undefined)) as (
    | GridClient
    | undefined
  )[];
  const failedDeployments: FailedDeployment[] = [];

  const BATCH_SIZE = 5;
  const contractsAndNodeIdsResults = await batchProcess(clusters, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(async name => {
        const globalIndex = clusters.indexOf(name);
        if (!grids[globalIndex]) return { contracts: [], nodeIds: [], success: false };
        try {
          const [contractsResult, nodeIdsResult] = await Promise.allSettled([
            grids[globalIndex]!.k8s.getDeploymentContracts(name),
            grids[globalIndex]!.k8s._getDeploymentNodeIds(name),
          ]);
          const contracts = contractsResult.status === "fulfilled" ? contractsResult.value : [];
          const nodeIds = nodeIdsResult.status === "fulfilled" ? nodeIdsResult.value : [];
          return { contracts, nodeIds, success: true };
        } catch {
          failedDeployments.push({ name, contracts: [], nodes: [] });
          return { contracts: [], nodeIds: [], success: false };
        }
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : { contracts: [], nodeIds: [], success: false }));
  });

  const contractsAndNodeIds = contractsAndNodeIdsResults.results;

  const clusterObjsResults = await batchProcess(clusters, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(async name => {
        const index = clusters.indexOf(name);
        const { contracts, nodeIds, success } = contractsAndNodeIds[index] || {
          contracts: [],
          nodeIds: [],
          success: false,
        };
        if (!success || !grids[index]) return null;

        try {
          const clusterPromise = grids[index]!.k8s.getObj(name).then(res => {
            if (!projectName && res && res.masters && res.masters.length === 0) {
              return getGridClient(grid.clientOptions, "").then(emptyProjectGrid => {
                grids[index] = emptyProjectGrid;
                return emptyProjectGrid.k8s.getObj(name);
              });
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
    return results.map(r => (r.status === "fulfilled" ? r.value : null));
  });
  const clusterObjs = clusterObjsResults.results;

  const items = clusterObjs.filter(Boolean) as any[];
  const k8s = items
    .map(item => {
      if (item) {
        item.deploymentName = clusters[clusterObjs.indexOf(item)];
        item.projectName = grids[clusterObjs.indexOf(item)]?.clientOptions?.projectName;
      }
      return item;
    })
    .filter(item => item && item.masters.length > 0) as K8S[];

  const consumptionsResults = await batchProcess(k8s, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(cluster => {
        const gridIndex = clusters.findIndex(name => name === cluster.deploymentName);
        if (!grids[gridIndex]) return Promise.resolve(undefined);
        return grids[gridIndex]!.contracts.getConsumption({ id: cluster.masters[0].contractId }).catch(() => undefined);
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : undefined));
  });
  const consumptions = consumptionsResults.results;

  const wireguardsResults = await batchProcess(k8s, BATCH_SIZE, async batch => {
    const results = await Promise.allSettled(
      batch.map(cluster => {
        const gridIndex = clusters.findIndex(name => name === cluster.deploymentName);
        if (!grids[gridIndex]) return Promise.resolve([]);
        return getWireguardConfig(
          grids[gridIndex]!,
          cluster.masters[0].interfaces[0].network,
          cluster.masters[0].interfaces[0].ip,
        ).catch(() => []);
      }),
    );
    return results.map(r => (r.status === "fulfilled" ? r.value : []));
  });
  const wireguards = wireguardsResults.results;

  const data = k8s.map((cluster, index) => {
    cluster.masters[0].billing = formatConsumption(consumptions[index]?.amountBilled as number);

    if (wireguards[index] && wireguards[index].length > 0) {
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
