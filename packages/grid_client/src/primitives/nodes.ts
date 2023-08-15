import { Client as RMBClient } from "@threefold/rmb_direct_client";
import { default as PrivateIp } from "private-ip";
import urlJoin from "url-join";

import { GridClient } from "../client";
import { RMB } from "../clients";
import { Graphql } from "../clients/graphql/client";
import { TFClient } from "../clients/tf-grid/client";
import { send } from "../helpers/requests";
import { FarmFilterOptions, FilterOptions } from "../modules/models";

interface FarmInfo {
  name: string;
  farmId: number;
  twinId: number;
  pricingPolicyId: number;
  certificationType: string;
  stellarAddress: string;
  dedicated: boolean;
  publicIps: PublicIps[];
}
interface PublicIps {
  id: string;
  ip: string;
  contractId: number;
  gateway: string;
}

interface NodeInfo {
  version: number;
  id: string;
  nodeId: number;
  farmId: number;
  twinId: number;
  gridVersion: number;
  uptime: number;
  created: number;
  farmingPolicyId: number;
  updatedAt: string;
  total_resources: NodeResources;
  used_resources: NodeResources;
  location: {
    country: string;
    city: string;
  };
  publicConfig: PublicConfig;
  status: string;
  certificationType: string;
  hasGPU: boolean;
  extraFee: number;
  rentedByTwinId: number;
}
interface PublicConfig {
  domain: string;
  gw4: string;
  gw6: string;
  ipv4: string;
  ipv6: string;
}

interface NodeResources {
  cru: number;
  sru: number;
  hru: number;
  mru: number;
  ipv4u: number;
}
interface NodeCapacity {
  capacity: {
    total_resources: NodeResources;
    used_resources: NodeResources;
  };
}
interface RMBNodeCapacity {
  total: NodeResources;
  used: NodeResources;
}
enum DiskTypes {
  SSD = "ssd",
  HDD = "hdd",
}
export interface StoragePool {
  type: DiskTypes;
  size: number;
  used: number;
}
class Nodes {
  gqlClient: Graphql;
  rmb: RMB;
  constructor(public graphqlURL: string, public proxyURL: string, rmbClient: RMBClient) {
    this.gqlClient = new Graphql(graphqlURL);
    this.rmb = new RMB(rmbClient);
  }

  async getNodeTwinId(node_id: number): Promise<number> {
    const body = `query getNodeTwinId($nodeId: Int!){
            nodes(where: { nodeID_eq: $nodeId }) {
            twinID
            }
        }`;
    return this.gqlClient
      .query(body, { nodeId: node_id })
      .then(response => {
        if (response["data"]["nodes"]["length"] === 0) {
          throw Error(`Couldn't find a node with id: ${node_id}`);
        }
        return response["data"]["nodes"][0]["twinID"];
      })
      .catch(err => {
        throw Error(`Error getting node twin ID for ID ${node_id}: ${err}`);
      });
  }

  async getAccessNodes(): Promise<Record<string, unknown>> {
    const accessNodes = {};
    const nodes = await this.filterNodes({ accessNodeV4: true, accessNodeV6: true });
    for (const node of nodes) {
      const ipv4 = node.publicConfig.ipv4;
      const ipv6 = node.publicConfig.ipv6;
      const domain = node.publicConfig.domain;
      if (PrivateIp(ipv4.split("/")[0]) === false) {
        accessNodes[+node.nodeId] = { ipv4: ipv4, ipv6: ipv6, domain: domain };
      }
    }
    if (Object.keys(accessNodes).length === 0) {
      throw Error("Couldn't find any node with public config");
    }
    console.log(accessNodes);
    return accessNodes;
  }

  async getNodeIdFromContractId(contractId: number, mnemonic: string): Promise<number> {
    const tfclient = new TFClient(
      GridClient.config.substrateURL,
      mnemonic,
      GridClient.config.storeSecret,
      GridClient.config.keypairType,
    );
    return tfclient.contracts
      .get({ id: contractId })
      .then(contract => {
        if (!contract.contractType.nodeContract)
          throw Error(`Couldn't get node id for this contract ${contractId}. It's not a node contract`);
        return contract.contractType.nodeContract.nodeId;
      })
      .catch(err => {
        throw Error(`Error getting node ID from contract ID ${contractId}: ${err}`);
      });
  }

  _g2b(GB: number): number {
    return GB * 1024 ** 3;
  }

  async getFarms(page = 1, pageSize = 50, url = ""): Promise<FarmInfo[]> {
    let r: string;
    if (url) r = url;
    else r = this.proxyURL;

    return send("get", urlJoin(r, `/farms?page=${page}&size=${pageSize}`), "", {})
      .then(res => {
        return res;
      })
      .catch(err => {
        throw Error(`Error listing farms with page ${page} and size ${pageSize}: ${err}`);
      });
  }

  async getAllFarms(url = ""): Promise<FarmInfo[]> {
    try {
      const farmsCount = await this.gqlClient.getItemTotalCount("farms", "(orderBy: farmID_ASC)");
      return await this.getFarms(1, farmsCount, url);
    } catch (err) {
      throw Error(`Error listing all farms: ${err}`);
    }
  }

  async checkFarmHasFreePublicIps(farmId: number, farms: FarmInfo[] = null, url = ""): Promise<boolean> {
    if (!farms) {
      farms = await this.getAllFarms(url);
    }
    return farms
      .filter(farm => farm.publicIps.filter(ip => ip.contractId === 0).length > 0)
      .map(farm => farm.farmId)
      .includes(farmId);
  }

  async getNodes(page = 1, pageSize = 50, url = ""): Promise<NodeInfo[]> {
    let r: string;
    if (url) r = url;
    else r = this.proxyURL;
    return send("get", urlJoin(r, `/nodes?page=${page}&size=${pageSize}`), "", {})
      .then(ret => {
        return ret;
      })
      .catch(err => {
        throw Error(`Error listing nodes with page ${page} and size ${pageSize}: ${err}`);
      });
  }

  async getAllNodes(url = ""): Promise<NodeInfo[]> {
    try {
      const nodesCount = await this.gqlClient.getItemTotalCount("nodes", "(orderBy: nodeID_ASC)");
      return await this.getNodes(1, nodesCount, url);
    } catch (err) {
      throw Error(`Error listing all nodes: ${err}`);
    }
  }

  async getNodesByFarmId(farmId: number, url = ""): Promise<NodeInfo[]> {
    let nodesCount = 0;
    try {
      nodesCount = await this.gqlClient.getItemTotalCount(
        "nodes",
        `(where: {farmID_eq: ${farmId}}, orderBy: nodeID_ASC)`,
      );
    } catch (err) {
      throw Error(`Error getting total nodes count: ${err}`);
    }
    let r: string;
    if (url) r = url;
    else r = this.proxyURL;

    return send("get", urlJoin(r, `/nodes?farm_id=${farmId}&size=${nodesCount}`), "", {})
      .then(res => {
        if (res) return res;
        else throw new Error(`The farm with id ${farmId}: doesn't have any nodes`);
      })
      .catch(err => {
        throw Error(`Error getting nodes by farm ID ${farmId}: ${err}`);
      });
  }

  async getNode(nodeId, url = ""): Promise<NodeInfo> {
    let r: string;
    if (url) r = url;
    else r = this.proxyURL;

    return send("get", urlJoin(r, `/nodes?node_id=${nodeId}`), "", {})
      .then(ret => {
        if (ret.length !== 0) return ret[0];
      })
      .catch(err => {
        throw Error(`Error getting node with ID ${nodeId}: ${err}`);
      });
  }

  async getNodeFreeResources(nodeId: number, source: "proxy" | "zos" = "proxy", url = ""): Promise<NodeResources> {
    if (source == "zos") {
      const node_twin_id = await this.getNodeTwinId(nodeId);

      return this.rmb
        .request([node_twin_id], "zos.statistics.get", "")
        .then(res => {
          const node: RMBNodeCapacity = res;
          const ret: NodeResources = { cru: 0, mru: 0, hru: 0, sru: 0, ipv4u: 0 };

          ret.mru = +node.total.mru - +node.used.mru;
          ret.sru = +node.total.sru - +node.used.sru;
          ret.hru = +node.total.hru - +node.used.hru;

          return ret;
        })
        .catch(err => {
          throw Error(`Error getting node ${nodeId}: ${err}`);
        });
    }

    let r: string;
    if (url) r = url;
    else r = this.proxyURL;

    return send("get", urlJoin(r, `/nodes/${nodeId}`), "", {})
      .then(res => {
        const node: NodeCapacity = res;
        const ret: NodeResources = { cru: 0, mru: 0, hru: 0, sru: 0, ipv4u: 0 };

        ret.mru = +node.capacity.total_resources.mru - +node.capacity.used_resources.mru;
        ret.sru = +node.capacity.total_resources.sru - +node.capacity.used_resources.sru;
        ret.hru = +node.capacity.total_resources.hru - +node.capacity.used_resources.hru;

        return ret;
      })
      .catch(err => {
        console.log(err);
        if (err.response.status === 404) {
          throw Error(`Node: ${nodeId} is not found`);
        } else if (err.response.status === 502) {
          throw Error(`Node: ${nodeId} is not reachable`);
        } else {
          throw err;
        }
      });
  }

  async filterNodes(options: FilterOptions = {}, url = ""): Promise<NodeInfo[]> {
    let nodes: NodeInfo[] = [];
    url = url || this.proxyURL;
    const query = this.getNodeUrlQuery(options);
    try {
      nodes = await send("get", urlJoin(url, `/nodes?${query}`), "", {});
    } catch {
      throw Error(`Invalid query: ${query}`);
    }
    if (nodes.length) {
      nodes = nodes.filter(n => !(options.nodeExclude && options.nodeExclude?.includes(n.nodeId)));
    }
    return nodes;
  }
  async filterFarms(options: FilterOptions = {}, url = ""): Promise<FarmInfo[]> {
    let farms: FarmInfo[] = [];
    url = url || this.proxyURL;
    const query = this.getFarmUrlQuery(options);
    try {
      farms = await send("get", urlJoin(url, `/farms?${query}`), "", {});
    } catch {
      throw Error(`Invalid query: ${query}`);
    }
    return farms;
  }

  /**
   * Get farm id from farm name.
   * It returns 0 in case the farm name is not found.
   * @param  {string} name
   * @returns {Promise<number>}
   */
  async getFarmIdFromFarmName(name: string, farms: FarmInfo[] = null, url = ""): Promise<number> {
    if (!farms) {
      farms = await this.getAllFarms(url);
    }
    const filteredFarms = farms.filter(f => String(f.name).toLowerCase() === name.toLowerCase());
    if (filteredFarms.length === 0) {
      return 0; // not found
    }
    return filteredFarms[0].farmId;
  }

  getNodeUrlQuery(options: FilterOptions = {}) {
    const params = {
      free_mru: Math.ceil(this._g2b(options.mru)) || "",
      free_sru: Math.ceil(this._g2b(options.sru)) || "",
      free_hru: Math.ceil(this._g2b(options.hru)) || "",
      free_ips: options.publicIPs ? 1 : "",
      ipv4: options.accessNodeV4,
      ipv6: options.accessNodeV6,
      gateway: options.gateway,
      certification_type: options.certified ? "Certified" : "",
      farm_ids: [options.farmId],
      farm_name: options.farmName,
      country: options.country,
      city: options.city,
      dedicated: options.dedicated,
      available_for: options.availableFor,
      status: "up",
      page: options.page,
      size: options.size,
      has_gpu: options.hasGPU,
      rented_by: options.rentedBy,
      rentable: options.rentable,
    };
    if (options.gateway) {
      params["ipv4"] = true;
      params["ipv6"] = true;
      params["domain"] = true;
    }
    return Object.entries(params)
      .map(param => param.join("="))
      .join("&");
  }

  getFarmUrlQuery(options: FarmFilterOptions = {}) {
    const params = {
      node_free_mru: Math.ceil(this._g2b(options.nodeMRU)) || "",
      node_free_sru: Math.ceil(this._g2b(options.nodeSRU)) || "",
      node_free_hru: Math.ceil(this._g2b(options.nodeHRU)) || "",
      free_ips: options.publicIp ? 1 : "",
      certification_type: options.certificationType,
      farm_name: options.farmName,
      country: options.country,
      dedicated: options.dedicated,
      node_available_for: options.availableFor,
      node_status: "up",
      page: options.page,
      size: options.size,
      node_has_gpu: options.nodeHasGPU,
      node_rented_by: options.nodeRentedBy,
      node_certified: options.nodeCertified,
    };
    return Object.entries(params)
      .map(param => param.join("="))
      .join("&");
  }

  async nodeHasResources(nodeId: number, options: FilterOptions): Promise<boolean> {
    const resources = await this.getNodeFreeResources(nodeId, "zos");
    if (
      resources.mru < this._g2b(options.mru) ||
      resources.sru < this._g2b(options.sru) ||
      resources.hru < this._g2b(options.hru)
    ) {
      return false;
    }
    return true;
  }

  async nodeAvailableForTwinId(nodeId: number, twinId: number): Promise<boolean> {
    return send("get", urlJoin(this.proxyURL, `/nodes/${nodeId}`), "", {})
      .then(node => {
        if (node.rentedByTwinId != twinId && (node.dedicated || node.rentContractId != 0)) {
          return false;
        }
        return true;
      })
      .catch(err => {
        throw Error(`Error checking if node ${nodeId} is available for twin ${twinId}: ${err}`);
      });
  }

  /**
   * Allocates a disk of a given size to a list of disk pools.
   *
   * @param diskPools - An array of numbers representing the available disk space in each pool.
   * @param disk - The size of the disk to be allocated.
   * @returns A boolean value indicating whether the disk was successfully allocated or not.
   *          Returns true if the disk was allocated to a pool, false otherwise.
   */
  allocateDiskToPools(diskPools: number[], disk: number): boolean {
    for (const index in diskPools) {
      if (diskPools[index] >= disk) {
        diskPools[index] -= disk;
        return true;
      }
    }
    return false;
  }

  /**
   * Sorts an array of numbers in descending order.
   *
   * @param array - The array of numbers to be sorted in descending order.
   */
  sortArrayDesc(array: number[]): void {
    array.sort((a, b) => b - a);
  }

  /**
   * Fits disks into disk pools based on their sizes.
   *
   * @param disks - An array of disk sizes required to be fitted into the pool.
   * @param pool - An array representing the available disk space in the pool.
   * @param type - A DiskTypes enum value representing the type of disk being allocated.
   * @throws {Error} - If the required disk cannot be fitted into the pool.
   */
  fitDisksInDisksPool(disks: number[], pools: number[], type: DiskTypes): void {
    disks.forEach(disk => {
      if (!this.allocateDiskToPools(pools, disk)) {
        throw new Error(
          `Cannot fit the required ${type.toUpperCase()} disk with size ${(disk / 1024 ** 3).toFixed(2)} GB`,
        );
      }
      this.sortArrayDesc(pools);
    });
  }

  /**
   * Verifies the storage pool capacity of a node for different disk types.
   *
   * @param ssdDisks - An array of SSD disk sizes required for the deployment.
   * @param hddDisks - An array of HDD disk sizes required for the deployment.
   * @param rootFileSystemDisks - An array of disk sizes required for the deployment's root file system.
   * @param nodeId - The ID of the node to be verified.
   * @returns {Promise<boolean>} - True if the node has enough capacity, otherwise false.
   * @throws {Error} - If there is an error in getting the node's information or if the required deployment can't be fitted.
   */
  async verifyNodeStoragePoolCapacity(
    ssdDisks: number[],
    hddDisks: number[],
    rootFileSystemDisks: number[],
    nodeId: number,
  ): Promise<boolean> {
    const ssdPools: number[] = [];
    const hddPools: number[] = [];

    try {
      const nodeTwinId = await this.getNodeTwinId(nodeId);
      ((await this.rmb.request([nodeTwinId], "zos.storage.pools", "")) as StoragePool[]).forEach(
        (disk: StoragePool) => {
          disk.type === DiskTypes.SSD ? ssdPools.push(disk.size - disk.used) : hddPools.push(disk.size - disk.used);
        },
      );
    } catch (err) {
      throw new Error(`Error getting node ${nodeId}: ${err}`);
    }

    this.sortArrayDesc(hddPools);
    this.sortArrayDesc(ssdPools);

    this.sortArrayDesc(rootFileSystemDisks);
    this.sortArrayDesc(ssdDisks);
    this.sortArrayDesc(hddDisks);

    try {
      this.fitDisksInDisksPool(ssdDisks, ssdPools, DiskTypes.SSD);
      this.fitDisksInDisksPool(hddDisks, hddPools, DiskTypes.HDD);
      this.fitDisksInDisksPool(rootFileSystemDisks, ssdPools, DiskTypes.SSD);
      return true;
    } catch (error) {
      throw new Error(
        `${(error as Error).message}, on Node ${nodeId} with disk pools:
         SSD:  ${ssdPools.map(disk => (disk / 1024 ** 3).toFixed(2).toString() + "GB ")} 
         HDD:  ${hddPools.map(disk => (disk / 1024 ** 3).toFixed(2).toString() + "GB ")}
    Please select another Node\n`,
      );
    }
  }

  // TODO : add get node by its node ID like the one in modules
}

export { Nodes, FarmInfo, NodeResources, NodeInfo, PublicIps, PublicConfig };
