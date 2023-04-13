import { GetDataQueryType, IFarm, INode } from "../graphql/api";

interface IInFilter {
  enabled: boolean;
  value: string[];
}
const createInFilter = () => ({ enabled: false, value: [] });

interface IFilter {
  enabled: boolean;
  value: string[];
}
const createFilter = () => ({ enabled: false, value: [] });

interface IComparisonFilter {
  enabled: boolean;
  value: number;
}

const createComparisonFilter = () => ({ enabled: false, value: 0 });

export interface IPaginationData<T> {
  total: number;
  items: Map<number, T[]>;
}

function createPaginationData<T>(): IPaginationData<T> {
  return {
    total: 0,
    items: new Map<number, T[]>(),
  };
}

export interface IState {
  data: GetDataQueryType | null;
  policies: { [key: string]: string };
  pricingPolicies: Map<number, string>;
  loading: boolean;
  tableLoading: boolean;
  nodes_status: { [key: number]: boolean };
  nodeContractsNo: number;
  accessNodesNo: number;
  countriesNo: number;
  gatewaysNo: number;
  totalCru: number;
  totalSru: number;
  totalHru: number;
  totalMru: number;
  farmsNo: number;
  nodesNo: number;
  twinsNo: number;
  publicIpsNo: number;
  nodesDistribution: { [key: string]: number };
  versions: Array<{ name: string; value: any }>;
  filters: {
    nodes: {
      node_id: IFilter;
      twin_id: IFilter;
      createdById: IFilter;
      farm_ids: IFilter;
      twinId: IFilter;
      country: IFilter;
      farmingPolicyName: IFilter;
      free_hru: IFilter;
      free_mru: IFilter;
      free_sru: IFilter;
      status: IFilter;
      countryFullName: IFilter;
      certificationType: IFilter;
      free_ips: IFilter;
      farm_name: IFilter;
      total_hru: IFilter;
      total_cru: IFilter;
      total_mru: IFilter;
      total_sru: IFilter;
    };
    farms: {
      createdById: IInFilter;
      farmId: IInFilter;
      twinId: IInFilter;
      certificationType: IInFilter;
      name: IInFilter;
      freePublicIPs: IComparisonFilter;
      pricingPolicyName: IInFilter;
    };
  };
  nodes: INode[];

  nodesFilter: any;

  nodesCount: number;
  nodesTablePageNumber: number;
  nodesTablePageSize: number;
  nodesGatewayFilter: boolean;
  nodesUpFilter: boolean;

  /* Refactored Data */
  farms: IPaginationData<IFarm>;
}

export default {
  data: null,
  policies: {},
  pricingPolicies: new Map(),
  loading: false,
  tableLoading: false,
  nodes_status: {},
  nodesDistribution: {},
  nodeContractsNo: 0,
  accessNodesNo: 0,
  countriesNo: 0,
  gatewaysNo: 0,
  totalCru: 0,
  totalSru: 0,
  totalMru: 0,
  totalHru: 0,
  farmsNo: 0,
  nodesNo: 0,
  publicIpsNo: 0,
  versions: [],
  twinsNo: 0,
  filters: {
    nodes: {
      node_id: createFilter(),
      twin_id: createFilter(),
      createdById: createFilter(),
      farm_ids: createFilter(),
      twinId: createFilter(),
      country: createFilter(),
      farmingPolicyName: createFilter(),
      certificationType: createFilter(),
      free_hru: createFilter(),
      free_sru: createFilter(),
      free_mru: createFilter(),
      status: createFilter(),
      countryFullName: createFilter(),
      free_ips: createFilter(),
      farm_name: createFilter(),
      total_hru: createFilter(),
      total_cru: createFilter(),
      total_sru: createFilter(),
      total_mru: createFilter(),
    },
    farms: {
      createdById: createInFilter(),
      farmId: createInFilter(),
      twinId: createInFilter(),
      certificationType: createInFilter(),
      name: createInFilter(),
      freePublicIPs: createComparisonFilter(),
      pricingPolicyName: createInFilter(),
    },
  },
  nodes: [],

  nodesFilter: {},

  nodesCount: 0,
  nodesTablePageNumber: 1,
  nodesTablePageSize: 10,
  nodesUpFilter: true,
  nodesGatewayFilter: false,

  /* Refactored data */
  farms: createPaginationData(),
} as IState;
