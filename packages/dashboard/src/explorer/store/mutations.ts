import { byInternet } from "country-code-lookup";
import { INode } from "./../graphql/api";
import { GetDataQueryType } from "../graphql/api";
import { IState } from "./state";

export enum MutationTypes {
  SET_LOAD = "setLoad",
  SET_TABLE_LOAD = "setTableLoad",
  SET_DATA = "setData",
  SET_FILTER_ENABLE = "setFilterEnable",
  SET_FILTER_VALUE = "setFilterValue",
  SET_POLICIES = "setPolicies",
  SET_NODES_STATUS = "setNodesStatus",
  SET_PRICING_POLICIES = "setPricingPolicies",
  SET_NODES_COUNT = "setNodesCount",
  SET_NODES_TABLE_PAGE_NUMBER = "setNodesTablePageNumber",
  SET_NODES_TABLE_PAGE_SIZE = "setNodesTablePageSize",
  SET_GATEWAY_FILTER = "setGatewayFilter",
  SET_UP_FILTER = "setUpFilter",
  SET_NODES = "setNodes",
  SET_NODES_FILTER = "setNodesFilter",
  CLEAR_NODES_FILTER = "clearNodesFilter",
  CLEAR_NODES_FILTER_KEY = "clearNodesFilterKey",
}

interface ISetNodeFilter {
  key1: keyof IState["filters"];
  key2: any;
  value: any;
}

function fillNodesFields(state: IState, node: any, farms: any): INode {
  return {
    id: node.id,
    createdAt: node.createdAt,
    createdById: "",
    updatedAt: node.updatedAt,
    updatedById: "",
    deletedAt: node.deletedAt,
    deletedById: "",
    version: node.version,
    gridVersion: node.gridVersion,
    nodeId: node.nodeId,
    farmId: node.farmId,
    twinId: node.twinId,
    cityId: 0,
    capacity: node.capacity,

    totalPublicIPs: farms.find((farm: any) => farm.farmId === node.farmId)?.publicIps.length,
    freePublicIPs: farms
      .find((farm: any) => farm.farmId === node.farmId)
      ?.publicIps.filter((ip: any) => ip.contractId === 0).length,
    hru: node.total_resources.hru,
    sru: node.total_resources.sru,
    cru: node.total_resources.cru,
    mru: node.total_resources.mru,
    publicConfig: node.publicConfig,
    uptime: node.uptime,
    created: node.created,
    farmingPolicyId: node.farmingPolicyId,
    location: node.location,
    country: node.country,
    city: node.city,
    interfaces: [
      {
        name: "",
        mac: "",
        ips: "",
        id: "",
      },
    ],
    status: node.status,
    certificationType: node.certificationType,
    farmingPolicyName: state.policies[node.farmingPolicyId],
    countryFullName: node.country && node.country?.length == 2 ? byInternet(node.country)?.country : node.country,
  };
}

export default {
  setLoad(state: IState, payload: boolean) {
    state.loading = payload;
  },
  setTableLoad(state: IState, payload: boolean) {
    state.tableLoading = payload;
  },
  setData(state: IState, payload: GetDataQueryType) {
    state.data = payload;
  },
  setPolicies(state: IState, payload: any) {
    state.policies = payload;
  },
  setPricingPolicies(state: IState, payload: Map<number, string>) {
    state.pricingPolicies = payload;
  },
  setFilterEnable(state: IState, { key1, key2, value }: ISetNodeFilter) {
    (state.filters[key1] as any)[key2].enabled = value;
  },
  setFilterValue(state: IState, { key1, key2, value }: ISetNodeFilter) {
    (state.filters[key1] as any)[key2].value = value;
  },
  setNodesStatus(state: IState, payload: { [key: number]: boolean }) {
    state.nodes_status = payload;
  },
  setNodes(state: IState, payload: any): void {
    // clear the state each time you reload. to avoid duplicated nodes
    state.nodes = [];

    for (let i = 0; i < payload.nodes.length; i++) {
      state.nodes.push(fillNodesFields(state, payload.nodes[i], payload.farms));
    }
  },

  setNodesCount(state: IState, payload: number) {
    state.nodesCount = payload;
  },
  setNodesTablePageNumber(state: IState, payload: number) {
    state.nodesTablePageNumber = payload;
  },
  setNodesTablePageSize(state: IState, payload: number) {
    state.nodesTablePageSize = payload;
  },
  setGatewayFilter(state: IState, payload: boolean) {
    state.nodesGatewayFilter = payload;
  },
  setUpFilter(state: IState, payload: boolean) {
    state.nodesUpFilter = payload;
  },
  setNodesFilter(state: IState, payload: { key: string; value: any }) {
    state.nodesFilter[payload.key] = payload.value;
  },
  clearNodesFilter(state: IState) {
    state.nodesFilter = {};
  },
  clearNodesFilterKey(state: IState, key: string) {
    state.nodesFilter[key] = "";
  },
};
