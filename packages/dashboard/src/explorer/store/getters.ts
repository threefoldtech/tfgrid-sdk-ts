import { GetDataQueryType } from "../graphql/api";
import { applyFilters, comparisonFilter, conditionFilter, inFilter, rangeFilter } from "../utils/filters";
import { GetterTree } from "vuex";
import { IState } from "./state";
import toTeraOrGigaOrPeta from "../filters/toTeraOrGigaOrPeta";

type ExtractKeyOf<T, K extends keyof T> = T[K] extends Array<infer Q> ? keyof Q : T[K]; // prettier-ignore
type ExtractValue<T, K extends keyof T> = T[K] extends Array<infer Q> ? Q : T[K]; // prettier-ignore

/**
 * @param key1
 * @param key2
 *
 * @description
 * key1: it only accepts one of [GetDataQueryType] keys for example ('nodes' | 'farms' | etc...)
 * key2: When ever you choose a `key1` value it starts to accept the keys of  [GetDataQueryType[key1]]
 *       So let's say your choosen key1 was nodes => key2 should be (keyof INode)
 *
 * @example
 * findById('wrong value', 'any value') // Error!
 * findById('nodes', 'wrong value')     // Error!
 * findById('nodes', 'nodeId')          // Works!
 */
function findById<T = GetDataQueryType, K extends keyof T = keyof T, R extends ExtractKeyOf<T, K> = T[K] extends (infer Q)[] ? keyof Q : T[K]>(key1: K, key2: R): (state: IState) => (id?: string) => ExtractValue<T, K> | null; // prettier-ignore
function findById(key1: any, key2: any) {
  return (state: IState) => {
    return (id?: string) => {
      if (id === undefined || id === null) return null;

      const items = fallbackDataExtractor(key1, state);
      return items.find((item: any) => item[key2] == id);
    };
  };
}

export function fallbackDataExtractor<T = GetDataQueryType, K extends keyof T = keyof T>(key: K): (state: IState) => T[K]; // prettier-ignore
export function fallbackDataExtractor<T = GetDataQueryType, K extends keyof T = keyof T>(key: K, state: IState): T[K]; // prettier-ignore
export function fallbackDataExtractor(key: any, state?: any) {
  if (state) return state.data?.[key] ?? [];
  return (state: any) => state.data?.[key] ?? [];
}

export function getFarmPublicIPs(state: IState, farmId: number): [number, number, number] {
  const farm = fallbackDataExtractor("farms")(state).find(f => f.farmId === farmId);
  if (farm) {
    const freePublicIps = getFarmFreePublicIps(farm);
    const usedPublicIps = getFarmUsedPublicIps(farm);
    const totalPublicIps = farm.publicIPs.length;
    return [totalPublicIps, freePublicIps, usedPublicIps];
  }
  return [0, 0, 0];
}

export function getFarmFreePublicIps(farm: any): number {
  const freePublicIps = farm.publicIPs.filter((x: any) => x.contractId == 0);
  return freePublicIps.length;
}
export function getFarmUsedPublicIps(farm: any): number {
  const freePublicIps = farm.publicIPs.filter((x: any) => x.contractId != 0);
  return freePublicIps.length;
}
export interface IStatistics {
  id: number;
  data: number | string;
  title: string;
  icon: string;
}

// prettier-ignore
export function getStatistics(state: IState): IStatistics[] {
  if (!state.data) {
    return [];
  }
  return [
    { id: 0, data: state.nodesNo, title: "Nodes Online", icon: "mdi-laptop" },
    { id: 1, data: state.farmsNo, title: "Farms", icon: "mdi-tractor" },
    { id: 2, data: state.countriesNo, title: "Countries", icon: "mdi-earth" },
    { id: 3, data: state.totalCru, title: "CPUs Online", icon: "mdi-cpu-64-bit" },
    { id: 4, data: toTeraOrGigaOrPeta(state.totalSru.toString()), title: "SSD Storage", icon: "mdi-nas" },
    { id: 5, data: toTeraOrGigaOrPeta(state.totalHru.toString()), title: "HDD Storage", icon: "mdi-harddisk" },
    { id: 6, data: toTeraOrGigaOrPeta(state.totalMru.toString()), title: "RAM Online", icon: "mdi-memory" },
    { id: 7, data: state.accessNodesNo, title: "Access Nodes", icon: "mdi-gate" },
    { id: 8, data: state.gatewaysNo, title: "Gateways Online", icon: "mdi-boom-gate-outline" },
    { id: 9, data: state.twinsNo, title: "Twins", icon: "mdi-brain" },
    { id: 10, data: state.publicIpsNo, title: "Public IPs", icon: "mdi-access-point" },
    { id: 11, data: state.nodeContractsNo, title: "Contracts", icon: "mdi-file-document-edit-outline" },
  ]
}

export default {
  loading: state => state.loading,
  tableLoading: state => state.tableLoading,

  nodes: state => {
    return state.nodes;
  },
  farms: state => {
    const farms = fallbackDataExtractor("farms")(state);

    return farms.map(f => {
      return {
        ...f,
        pricingPolicyName: state.pricingPolicies.get(f.pricingPolicyId),
      };
    });
  },
  locations: fallbackDataExtractor("locations"),

  /* Getters By Id */
  node: findById("nodes", "nodeId"),
  farm: findById("farms", "farmId"),
  location: findById("locations", "id"),

  /* filters helpers */
  getFilter: state => {
    return (key1: string, key2: string) => {
      return (state.filters as any)[key1][key2];
    };
  },

  filtered_farm: applyFilters(
    state => {
      const farms = fallbackDataExtractor("farms")(state);
      return farms.map(f => {
        return {
          ...f,
          totalPublicIPs: f.publicIPs.length,
          freePublicIPs: getFarmFreePublicIps(f),
          usedPublicIPs: getFarmUsedPublicIps(f),
          pricingPolicyName: state.pricingPolicies.get(f.pricingPolicyId),
        };
      });
    },
    state => state.filters.farms,
    inFilter("createdById"),
    inFilter("farmId"),
    inFilter("twinId"),
    inFilter("certificationType"),
    inFilter("name"),
    comparisonFilter("freePublicIPs", ">="),
    inFilter("pricingPolicyName"),
  ),

  /* visual helpers */
  maxValueOf(state) {
    return (key: keyof GetDataQueryType, valueOf: string) => {
      const items: any[] = fallbackDataExtractor(key, state);
      const values = items.map((i: any) => +(i as any)[valueOf]) as any[];
      return Math.max(...values);
    };
  },

  listFilteredNodes: applyFilters(
    state => state.nodes,
    state => state.filters.nodes,
    inFilter("nodeId"),
    inFilter("createdById"),
    inFilter("farmId"),
    inFilter("twinId"),
    inFilter("country"),
    inFilter("farmingPolicyName"),
    inFilter("countryFullName"),
    inFilter("certificationType"),
    rangeFilter("hru"),
    rangeFilter("mru"),
    rangeFilter("sru"),
    rangeFilter("cru"),
    conditionFilter("status"),
    comparisonFilter("freePublicIPs", ">="),
  ),

  getSingleNode: state => (nodeId: any) => {
    return state.nodes.find(node => node.nodeId == nodeId);
  },

  statistics: getStatistics,
  nodesDistribution: state => state.nodesDistribution,

  getNodesCount: state => state.nodesCount,
  getNodesTablePageNumber: state => state.nodesTablePageNumber,
  getNodesTablePageSize: state => state.nodesTablePageSize,
  getNodesUpFilter: state => state.nodesUpFilter,
  getNodesGatewayFilter: state => state.nodesGatewayFilter,

  getNodesFilter: state => state.nodesFilter,
} as GetterTree<IState, IState>;
