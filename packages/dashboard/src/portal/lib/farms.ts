import { Signer } from "@polkadot/api/types";
import { web3FromAddress } from "@polkadot/extension-dapp";
import axios from "axios";
import config from "../config";
import { getNodeAvailability, NodeAvailability } from "./nodes";
import { getNodeMintingFixupReceipts, receiptInterface } from "./nodes";
import { hex2a } from "./util";
export interface nodeInterface {
  id: string;
  nodeId: number;
  farmId: number;
  twinId: number;
  country: string;
  gridVersion: number;
  city: string;
  uptime: number;
  created: number;
  farmingPolicyId: number;
  updatedAt: number;
  total_resources: {
    cru: number;
    sru: number;
    hru: number;
    mru: number;
  };
  used_resources: {
    cru: number;
    sru: number;
    hru: number;
    mru: number;
  };
  location: {
    country: string;
    city: string;
  };
  publicConfig: {
    domain: string;
    gw4: string;
    gw6: string;
    ipv4: string;
    ipv6: string;
  };
  status: string;
  certificationType: string;
  dedicated: boolean;
  rentContractId: number;
  rentedByTwinId: number;
  receipts: receiptInterface[];
  serialNumber: string;
  availability: NodeAvailability;
}
export async function getFarm(api: { query: any }, twinID: number) {
  const farms = await api.query.tfgridModule.farms.entries();

  const twinFarms = farms.filter((farm: { toJSON: () => { (): any; new (): any; twinId: number } }[]) => {
    if (farm[1].toJSON().twinId === twinID) {
      return farm;
    }
  });

  const parsedFarms = twinFarms.map(async (farm: { toJSON: () => any }[]) => {
    const parsedFarm = farm[1].toJSON();
    const v2address = await getFarmPayoutV2Address(api, parsedFarm.id);

    return {
      ...parsedFarm,
      name: hex2a(parsedFarm.name),
      v2address: hex2a(v2address),
    };
  });

  return await Promise.all(parsedFarms);
}
export async function getFarmPayoutV2Address(
  api: {
    query: {
      tfgridModule: { farmPayoutV2AddressByFarmID: (arg0: number) => any };
    };
  },
  id: number,
) {
  const address = await api.query.tfgridModule.farmPayoutV2AddressByFarmID(id);
  return address.toJSON();
}
export async function setFarmPayoutV2Address(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        addStellarPayoutV2address: (
          arg0: number,
          arg1: string,
        ) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  id: number,
  v2address: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule
    .addStellarPayoutV2address(id, v2address)
    .signAndSend(address, { signer: injector.signer }, callback);
}
export async function createFarm(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        createFarm: (
          arg0: string,
          arg1: never[],
        ) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  name: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule.createFarm(name, []).signAndSend(address, { signer: injector.signer }, callback);
}
export async function createIP(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        addFarmIp: (
          arg0: number,
          arg1: string,
          arg2: string,
        ) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  farmID: number,
  ip: string,
  gateway: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule.addFarmIp(farmID, ip, gateway).signAndSend(address, { signer: injector.signer }, callback);
}

export async function batchCreateIP(
  address: string,
  api: any,
  farmID: number,
  ips: string[],
  gateway: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  const calls: any[] = [];
  ips.map(ip => calls.push(api.tx.tfgridModule.addFarmIp(farmID, ip, gateway)));

  return api.tx.utility.batch(calls).signAndSend(address, { signer: injector.signer }, callback);
}

export async function deleteIP(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        removeFarmIp: (
          arg0: number,
          arg1: any,
        ) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  farmID: number,
  ip: { ip: string },
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule.removeFarmIp(farmID, ip.ip).signAndSend(address, { signer: injector.signer }, callback);
}
export async function deleteNode(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        deleteNodeFarm: (arg0: any) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  nodeId: number,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule.deleteNodeFarm(nodeId).signAndSend(address, { signer: injector.signer }, callback);
}
export async function deleteFarm(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        deleteFarm: (arg0: string) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: string, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  farmId: string,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule.deleteFarm(farmId).signAndSend(address, { signer: injector.signer }, callback);
}

export async function getNodesByFarmID(farmIDs: any[], page: number, size: number): Promise<any> {
  const url = `${config.gridproxyUrl}/nodes?ret_count=true&page=${page}&size=${size}&farm_ids=${farmIDs}`;
  const res = await fetch(url);
  const count = res.headers.get("count");

  const _nodes = await res.json();
  // const _nodes = res.flat();

  const nodesWithResources = _nodes.map(async (node: nodeInterface) => {
    try {
      const network = config.network;
      node.receipts = [];
      if (network == "main") node.receipts = await getNodeMintingFixupReceipts(node.nodeId);
      node.availability = await getNodeAvailability(node.nodeId);
    } catch (error) {
      node.receipts = [];
      node.used_resources = {
        sru: 0,
        hru: 0,
        mru: 0,
        cru: 0,
      };
      node.availability = { downtime: 0, currentPeriod: 0 };
    }

    return node;
  });

  const nodes = await Promise.all(nodesWithResources);
  return { nodes, count };
}

export async function getNodesByFarm(farmID: string) {
  const res = await axios.post(config.graphqlUrl, {
    query: `{ nodes (where: {farmID_eq:${farmID}}) { 
      resourcesTotal {
        cru
        hru
        mru
        sru
      }
      publicConfig {
        domain
        gw4
        gw6
        ipv4
        ipv6
      }
      certification
      city
      connectionPrice
      country
      created
      createdAt
      farmID
      farmingPolicyId
      gridVersion
      id
      location {
        latitude
        longitude
      }
      nodeID
      secure
      serialNumber
      twinID
      updatedAt
      uptime
      virtualized
    }}`,
    operation: "getNodes",
  });

  return res.data.data.nodes;
}
export async function addNodePublicConfig(
  address: string,
  api: {
    tx: {
      tfgridModule: {
        addNodePublicConfig: (
          arg0: any,
          arg1: any,
          arg2: any,
        ) => {
          (): any;
          new (): any;
          signAndSend: {
            (arg0: any, arg1: { signer: Signer }, arg2: any): any;
            new (): any;
          };
        };
      };
    };
  },
  farmID: number,
  nodeID: number,
  config: {
    ip4: { ip: string; gw: string };
    ip6?: { ip: string | undefined; gw: string | undefined };
    domain?: string;
  } | null,
  callback: any,
) {
  const injector = await web3FromAddress(address);

  return api.tx.tfgridModule
    .addNodePublicConfig(farmID, nodeID, config)
    .signAndSend(address, { signer: injector.signer }, callback);
}
