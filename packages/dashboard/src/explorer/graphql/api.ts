/**
 * @description
 * This file include every single interface in graphql api
 * also has the full interface of each type their
 */

import { gql } from "graphql-tag";

export interface ILocation {
  id: string;
  createdAt: string;
  createdById: string;
  updatedAt?: string;
  updatedById?: string;
  deletedAt?: string;
  deletedById?: string;
  version: number;
  longitude: string;
  latitude: string;
}

export interface ICountry {
  id: string;
  name: string;
  code: string;
  lat: string;
  long: string;
  region: string;
  countryId: number;
  createdAt: string;
  createdById: string;
  deletedAt: string;
  deletedById: string;
  subregion: string;
  updatedById: string;
  updatedAt: string;
  version: number;
}

export interface Interfaces {
  name: string;
  mac: string;
  ips: string;
  id: string;
}
export interface Capacity {
  total_resources: {
    // index signature
    [key: string]: number;
    cru: number;
    sru: number;
    hru: number;
    mru: number;
  };
  used_resources: {
    // index signature
    [key: string]: number;
    cru: number;
    sru: number;
    hru: number;
    mru: number;
  };
}
export interface INode {
  id: string;
  createdAt: string;
  createdById: string;
  updatedAt?: string;
  updatedById?: string;
  deletedAt?: string;
  deletedById?: string;
  version: number;
  gridVersion: number;
  nodeId: number;
  farmId: number;
  twinId: number;
  cityId?: number;
  totalPublicIPs?: number;
  freePublicIPs?: number;
  hru?: string;
  sru?: string;
  cru?: string;
  mru?: string;
  capacity: Capacity;
  publicConfig?: IPublicConfig;
  uptime?: number;
  created: number;
  farmingPolicyId: number;
  location: Location;
  country?: string;
  city?: string;
  interfaces: Interfaces[];
  status: any;
  certificationType: "Diy" | "Certified";
  farmingPolicyName: string;
  countryFullName: string;
}

export interface INodeStatisticsUser {
  deployments: number;
  workloads: number;
}

export interface INodeStatistics {
  users: INodeStatisticsUser;
}

export const PublicConfigType = gql`
  fragment PublicConfigType on PublicConfig {
    domain
    ipv4
    ipv6
    gw4
    gw6
  }
`;

export interface IPublicIPs {
  id: string;
  gateway: string;
  farmId: string;
  contractId: number;
  ip: string;
}

export interface IFarm {
  id: string;
  createdAt: string;
  createdById: string;
  updatedAt?: string;
  updatedById?: string;
  deletedAt?: string;
  deletedById?: string;
  version: number;
  gridVersion: number;
  farmId: number;
  name: string;
  twinId: number;
  pricingPolicyId: number;
  certificationType: "Gold" | "NotCertified";
  publicIPs: IPublicIPs[];
  stellarAddress?: string;
  totalPublicIp: number;
  usedPublicIp: number;
  freePublicIp: number;
}

export interface IGridProxyFarm {
  name: string;
  farmId: number;
  twinId: number;
  pricingPolicyId: number;
  certificationType: "Gold" | "NotCertified";
  stellarAddress: string;
  dedicated: boolean;
  publicIps: IPublicIPs[];
}

export interface INodeContract {
  id: string;
  nodeId: number;
  contractId: number;
  deploymentHash: string;
  state: string;
  twinId: number;
}

export interface ITwin {
  id: string;
  createdAt: string;
  createdById: string;
  updatedAt?: string;
  updatedById?: string;
  deletedAt?: string;
  deletedById?: string;
  version: number;
  gridVersion: number;
  twinId: number;
  accountId: string;
  relay: string;
  pk: string;
}

export interface IPublicConfig {
  ipv4: string;
  ipv6: string;
  gw4: string;
  gw6: string;
  domain: string;
}

type TotalCountType = { totalCount: number };
export interface GetTotalCountQueryType<T = TotalCountType> {
  nodes: T;
  farms: T;
  twins?: T;
  nodeContracts?: T;
}

export const getTotalCountQuery = gql`
  query getTotalCountQuery {
    nodes: nodesConnection(orderBy: nodeID_ASC) {
      totalCount
    }
    farms: farmsConnection(orderBy: farmID_ASC) {
      totalCount
    }
    twins: twinsConnection(orderBy: twinID_ASC) {
      totalCount
    }
    nodeContracts: nodeContractsConnection(orderBy: contractID_ASC) {
      totalCount
    }
  }
`;
export interface GetDataQueryType {
  nodes: INode[];
  farms: IFarm[];
  locations: ILocation[];
  publicConfigs: IPublicConfig[];
}

/* Refactored Code */

export interface IFetchPaginatedData<T> {
  total: { count: number };
  items: T[];
}

export const getPricingPolicies = gql`
  query getPricingPolicies {
    pricingPolicies {
      pricingPolicyID
    }
  }
`;

export const getFarmsQuery = gql`
  query getFarms(
    $limit: Int!
    $offset: Int!
    $farmId_in: [Int!]
    $name_in: [String!]
    $twinId_in: [Int!]
    $certificationType_in: [FarmCertification!]
    $pricingPolicyId_in: [Int!]
    $orderBy: [FarmOrderByInput!]
  ) {
    total: farmsConnection(
      where: {
        farmID_in: $farmId_in
        name_in: $name_in
        twinID_in: $twinId_in
        certification_in: $certificationType_in
        pricingPolicyID_in: $pricingPolicyId_in
      }
      orderBy: farmID_ASC
    ) {
      count: totalCount
    }
    items: farms(
      orderBy: $orderBy
      limit: $limit
      offset: $offset
      where: {
        farmID_in: $farmId_in
        name_in: $name_in
        twinID_in: $twinId_in
        certification_in: $certificationType_in
        pricingPolicyID_in: $pricingPolicyId_in
      }
    ) {
      id: farmID
      name
      publicIPs {
        contractId
      }
      twinId: twinID
      certificationType: certification
      pricingPolicyId: pricingPolicyID
    }
  }
`;

export interface IFilterQuery {
  items: Array<{ value: string }>;
}

export const filterQuery = (prop: string) => {
  const query = `
     query queryFilter($sub_string: String) {
       items: farms(where: { ${prop}_contains: $sub_string}) {
         value: ${prop}
       }
     }
   `;
  return gql(query);
};
