/* eslint-disable */
import axios from "axios";
import config from "../config";
import { getBalance } from "./balance";
import { jsPDF } from "jspdf";
import { nodeInterface } from "./farms";
import moment from "moment";
import "jspdf-autotable";
import { Client } from "@threefold/tfchain_client";
import { getKeypair } from "@/utils/signer";
import { ApiPromise } from "@polkadot/api";
import profileStore from "@/store";
import toTeraOrGigaOrPeta from "@/explorer/filters/toTeraOrGigaOrPeta";

export interface receiptInterface {
  type: "MINTING" | "FIXUP";
  hash: string;
  mintingStart?: number;
  mintingEnd?: number;
  fixupStart?: number;
  fixupEnd?: number;
  tft?: number;
  cloud_units: {
    cu: number;
    su: number;
    nu: number;
  };
  fixup_cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  correct_cloud_units?: {
    cu: number;
    su: number;
    nu: number;
  };
  startPeriodTimestamp: number;
  endPeriodTimestamp: number;
  fixupReward?: number;
}
interface UptimeEvent {
  uptime: number;
  timestamp: number;
}

export interface NodeAvailability {
  downtime: number;
  currentPeriod: number;
}

export async function getNodeAvailability(nodeId: number) {
  /**
   * Return Node availability over the current minting period
   *
   * @param nodeId - The node id
   * @returns node downtime and elapsed time in seconds since current minting period started (which the downtime was calculated over)
   * */

  // The duration of a standard period, as used by the minting payouts, in seconds
  // https://github.com/threefoldtech/minting_v3/blob/master/src/period.rs
  const STANDARD_PERIOD_DURATION = (24 * 60 * 60 * (365 * 3 + 366 * 2)) / 60;
  // Timestamp of the start of the first period in seconds
  const FIRST_PERIOD_START_TIMESTAMP = 1522501000;
  // uptime events are supposed to happen every 40 minutes.
  // here we set this to one hour (3600 sec) to allow some room.
  const UPTIME_EVENTS_INTERVAL = 3600;
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const secondsSinceCurrentPeriodStart = (secondsSinceEpoch - FIRST_PERIOD_START_TIMESTAMP) % STANDARD_PERIOD_DURATION;
  const currentPeriodStartTimestamp = secondsSinceEpoch - secondsSinceCurrentPeriodStart;

  const res = await axios.post(config.graphqlUrl, {
    query: `{
			uptimeEvents(where: {nodeID_eq: ${nodeId}, timestamp_gt: ${currentPeriodStartTimestamp}}, orderBy: timestamp_ASC) {
			  timestamp
			  uptime
			}
		  }`,
  });
  const uptimeEvents: Array<UptimeEvent> = res.data.data.uptimeEvents.map((item: UptimeEvent) => {
    return { timestamp: +item.timestamp, uptime: +item.uptime };
  });
  // if there are no uptimeEvents (i.e node was never up in the current period), return the time elapsed since the period start as downtime
  if (uptimeEvents.length == 0) {
    console.log(
      `getNodeAvailability: Node ${nodeId} didn't send uptime events for the last ${secondsSinceCurrentPeriodStart} seconds.`,
    );
    return { downtime: secondsSinceCurrentPeriodStart, currentPeriod: secondsSinceCurrentPeriodStart };
  }

  const fakeDataPoint = { timestamp: currentPeriodStartTimestamp, uptime: 0 };
  uptimeEvents.unshift(fakeDataPoint);

  let downtime = 0;
  for (let i = 0; i < uptimeEvents.length - 1; i++) {
    // if uptime decreases with time, then node was down in that time period, so add time period to node downtime
    if (
      uptimeEvents[i].uptime > uptimeEvents[i + 1].uptime ||
      uptimeEvents[i + 1].uptime < uptimeEvents[i + 1].timestamp - uptimeEvents[i].timestamp
    ) {
      downtime += uptimeEvents[i + 1].timestamp - uptimeEvents[i].timestamp - uptimeEvents[i + 1].uptime;
    }
  }

  const elapsedSinceLastUptimeEvent = secondsSinceEpoch - uptimeEvents[uptimeEvents.length - 1].timestamp;
  if (elapsedSinceLastUptimeEvent >= UPTIME_EVENTS_INTERVAL) {
    downtime += elapsedSinceLastUptimeEvent;
  }
  console.log(
    `getNodeAvailability: Node ${nodeId} was down for ${downtime} seconds in the last ${secondsSinceCurrentPeriodStart} seconds.`,
  );
  return { downtime: downtime, currentPeriod: secondsSinceCurrentPeriodStart };
}

export function getFarmUptimePercentage(farm: nodeInterface[]) {
  let uptime = 0;
  for (let i = 0; i < farm.length; i++) {
    uptime += +getNodeUptimePercentage(farm[i]);
  }
  return (uptime / farm.length).toFixed(2);
}

export function getNodeUptimePercentage(node: nodeInterface) {
  return (
    ((node.availability.currentPeriod - node.availability.downtime) / node.availability.currentPeriod) *
    100
  ).toFixed(2);
}

export function getTime(num: number | undefined) {
  if (num) {
    return new Date(num);
  }
  return new Date();
}
export function generateNodeSummary(doc: jsPDF, nodes: nodeInterface[]) {
  doc.setFontSize(15);
  const topY = 20;
  const topX = 60;
  const lineOffset = 10;
  const cellOffset = 40;
  const cellX = 15;
  const cellY = topY + lineOffset;

  doc.text(`Farm ${nodes[0].farmId} Nodes Minting Summary`, topX, topY);
  doc.setFontSize(10);

  doc.text(`Nodes: ${nodes.length}`, cellX, cellY);
  doc.text(`Receipts: ${nodes.reduce((total, node) => (total += node.receipts.length), 0)}`, cellX, cellY + lineOffset);
  doc.text(
    `Minting Receipts: ${nodes.reduce(
      (total, node) => (total += node.receipts.filter(receipt => receipt.type == "MINTING").length),
      0,
    )}`,
    cellX,
    cellY + lineOffset * 2,
  );
  doc.text(
    `Fixup Receipts: ${nodes.reduce(
      (total, node) => (total += node.receipts.filter(receipt => receipt.fixupStart).length),
      0,
    )}`,
    cellX,
    cellY + lineOffset * 3,
  );
  doc.text(
    `TFT: ${nodes
      .reduce(
        (total, node) => (total += node.receipts.reduce((totalTFT, receipt) => (totalTFT += receipt.tft || 0), 0)),
        0,
      )
      .toFixed(2)}`,
    cellX,
    cellY + lineOffset * 4,
  );
  doc.text(`Uptime: ${getFarmUptimePercentage(nodes)}%`, cellX, cellY + lineOffset * 5);
}

export interface ITab {
  label: string;
  query: "rentable" | "rented" | "rented_by";
  value: "rentable" | "rented" | "mine";
  index: number;
}
export interface INodeGPU {
  id: string;
  vendor: string;
  device: string;
  contract?: number;
}

export function generatePage(doc: jsPDF, receiptsBatch: receiptInterface[], page: number) {
  const lineOffset = 5;
  const topY = 20 + lineOffset * 6;
  const cellOffset = lineOffset * 12;
  const cellX = 15;
  const cellY = topY + lineOffset * 2;

  if (page > 1) {
    doc.addPage();
  }
  for (let i = 0; i < receiptsBatch.length; i++) {
    if (receiptsBatch[i].type === "MINTING") {
      doc.text(`Minting: ${receiptsBatch[i].hash}`, cellX, cellY + cellOffset * i);
      doc.text(`start: ${getTime(receiptsBatch[i].mintingStart)}`, cellX, cellY + cellOffset * i + lineOffset);
      doc.text(`end: ${getTime(receiptsBatch[i].mintingEnd)}`, cellX, cellY + cellOffset * i + lineOffset * 2);
      doc.text(`TFT: ${receiptsBatch[i].tft?.toFixed(2)}`, cellX, cellY + cellOffset * i + lineOffset * 3);
      doc.text(
        `Cloud Units: ${receiptsBatch[i].cloud_units.cu} CU, ${receiptsBatch[i].cloud_units.nu} NU, ${receiptsBatch[i].cloud_units.su} SU`,
        cellX,
        cellY + cellOffset * i + lineOffset * 4,
      );
    } else {
      doc.text(`Fixup: ${receiptsBatch[i].hash}`, cellX, cellY + cellOffset * i);
      doc.text(`start: ${getTime(receiptsBatch[i].fixupStart)}`, cellX, cellY + cellOffset * i + lineOffset);
      doc.text(`end: ${getTime(receiptsBatch[i].fixupEnd)}`, cellX, cellY + cellOffset * i + lineOffset * 2);
      doc.text(`TFT: ${receiptsBatch[i].tft?.toFixed(2)}`, cellX, cellY + cellOffset * i + lineOffset * 3);
      doc.text(
        `Fixup TFT: ${receiptsBatch[i].fixupReward?.toFixed(2) || 0}`,
        cellX,
        cellY + cellOffset * i + lineOffset * 4,
      );
      doc.text(
        `CU (Minted|Actual|FixedUp):   (${receiptsBatch[i].cloud_units.cu} | ${
          receiptsBatch[i].correct_cloud_units?.cu || 0
        } | ${receiptsBatch[i].fixup_cloud_units?.cu || 0})`,
        cellX,
        cellY + cellOffset * i + lineOffset * 5,
      );
      doc.text(
        `NU (Minted|Actual|FixedUp):   (${receiptsBatch[i].cloud_units.nu} | ${
          receiptsBatch[i].correct_cloud_units?.nu || 0
        } | ${receiptsBatch[i].fixup_cloud_units?.nu || 0})`,
        cellX,
        cellY + cellOffset * i + lineOffset * 6,
      );
      doc.text(
        `SU (Minted|Actual|FixedUp):   (${receiptsBatch[i].cloud_units.su} | ${
          receiptsBatch[i].correct_cloud_units?.su || 0
        } | ${receiptsBatch[i].fixup_cloud_units?.su || 0})`,
        cellX,
        cellY + cellOffset * i + lineOffset * 7,
      );
    }
    if (i !== receiptsBatch.length - 1) {
      doc.line(cellX, cellY + cellOffset * i + lineOffset * 8, cellX + 175, cellY + cellOffset * i + lineOffset * 8);
    }
  }

  return doc;
}

export function generateReceipt(doc: jsPDF, node: nodeInterface) {
  // Set font size and initial positioning
  doc.setFontSize(15);
  const topY = 20;
  const lineOffset = 5;
  const cellOffset = 30;
  const cellX = 15;
  const cellY = topY + lineOffset * 8;

  // Add header information on the first page
  doc.text(`Node ${node.nodeId} Summary`, 80, topY);
  doc.setFontSize(10);
  doc.text(`Receipts total: ${node.receipts.length}`, cellX, topY + lineOffset);
  doc.text(
    `Minting total: ${node.receipts.filter(receipt => receipt.type == "MINTING").length}`,
    cellX,
    topY + lineOffset * 2,
  );
  doc.text(`Fixup total: ${node.receipts.filter(receipt => receipt.fixupStart).length}`, cellX, topY + lineOffset * 3);

  doc.text(
    `TFT total: ${node.receipts.reduce((total, receipt) => (total += receipt.tft || 0), 0).toFixed(2)}`,
    cellX,
    topY + lineOffset * 4,
  );
  doc.text(
    `Uptime: ${getNodeUptimePercentage(node)}% - ${Math.floor(moment.duration(node.uptime, "seconds").asDays())} days`,
    cellX,
    topY + lineOffset * 5,
  );

  // Draw a line after the header information
  doc.line(cellX, topY + lineOffset * 6, cellX + 175, topY + lineOffset * 6);

  const size = 4;
  let page = 0;
  for (let i = 0; i < node.receipts.length - 1; i += size) {
    page++;
    doc = generatePage(doc, node.receipts.slice(i, i + size), page);
  }

  return doc;
}
export function byteToGB(capacity: number) {
  return (capacity / 1024 / 1024 / 1024).toFixed(2);
}

export async function createRentContract(
  api: ApiPromise,
  address: string,
  nodeId: string,
  solutionProviderID: string | null,
  callback: any,
) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  return api.tx.smartContractModule
    .createRentContract(nodeId, solutionProviderID)
    .signAndSend(keypair, { nonce }, callback);
}
export async function cancelRentContract(api: ApiPromise, address: string, contractId: string, callback: any) {
  const keypair = await getKeypair();
  const nonce = await api.rpc.system.accountNextIndex(address);
  return api.tx.smartContractModule.cancelContract(contractId).signAndSend(keypair, { nonce }, callback);
}

export async function setDedicatedNodeExtraFee(address: string, nodeId: number, extraFee: number) {
  const keypair = await getKeypair();
  const client = new Client({
    url: window.configs.APP_API_URL,
    mnemonicOrSecret: profileStore.state.profile!.mnemonic,
  });
  return await (await client.contracts.setDedicatedNodeExtraFee({ nodeId, extraFee })).apply();
}

export async function getActiveContracts(api: ApiPromise, nodeId: string) {
  console.log("getActiveContracts", api.query.smartContractModule.activeNodeContracts(nodeId));
  return await api.query.smartContractModule.activeNodeContracts(nodeId);
}

export async function getNodeMintingFixupReceipts(nodeId: number) {
  let nodeReceipts: receiptInterface[] = [];
  const res = await axios.get(`https://alpha.minting.tfchain.grid.tf/api/v1/node/${nodeId}`).then(res =>
    res.data.map(
      (rec: {
        hash: any;
        receipt: {
          Minting: {
            period: { start: number; end: number };
            reward: { musd: number; tft: number };
            cloud_units: { cu: number; su: number; nu: number };
          };
          Fixup: {
            period: { start: number; end: number };
            minted_cloud_units: { cu: number; su: number; nu: number };
            fixup_cloud_units: { cu: number; su: number; nu: number };
            correct_cloud_units: { cu: number; su: number; nu: number };
            minted_reward: { musd: number; tft: number };
            fixup_reward: { musd: number; tft: number };
          };
        };
      }) => {
        if (rec.receipt.Minting) {
          nodeReceipts.push({
            type: "MINTING",
            hash: rec.hash,
            cloud_units: rec.receipt.Minting.cloud_units,
            mintingStart: rec.receipt.Minting.period.start * 1000,
            mintingEnd: rec.receipt.Minting.period.end * 1000,
            tft: rec.receipt.Minting.reward.tft / 1e7,
            startPeriodTimestamp: rec.receipt.Minting.period.start,
            endPeriodTimestamp: rec.receipt.Minting.period.end,
          });
        } else {
          nodeReceipts.push({
            type: "FIXUP",
            hash: rec.hash,
            cloud_units: rec.receipt.Fixup.minted_cloud_units,
            fixup_cloud_units: rec.receipt.Fixup.fixup_cloud_units,
            correct_cloud_units: rec.receipt.Fixup.correct_cloud_units,
            fixupStart: rec.receipt.Fixup.period.start * 1000 || 0,
            fixupEnd: rec.receipt.Fixup.period.end * 1000 || 0,
            startPeriodTimestamp: rec.receipt.Fixup.period.start,
            endPeriodTimestamp: rec.receipt.Fixup.period.end,
            tft: rec.receipt.Fixup.minted_reward.tft / 1e7,
            fixupReward: rec.receipt.Fixup.fixup_reward.tft / 1e7,
          });
        }
      },
    ),
  );

  // sort based on the start date
  nodeReceipts = nodeReceipts.sort((a, b) => b.startPeriodTimestamp - a.startPeriodTimestamp);
  return nodeReceipts;
}
export async function getNodeGPUs(nodeId: number): Promise<INodeGPU[] | undefined> {
  let nodeGPUs: INodeGPU[] | undefined;

  try {
    nodeGPUs = await (
      await axios.get(`${config.gridproxyUrl}/nodes/${nodeId}/gpu`, {
        timeout: 5000,
      })
    ).data;
  } catch (err) {
    nodeGPUs = undefined;
  }
  return nodeGPUs;
}

export async function getNodeUsedResources(nodeId: string) {
  const res = await axios.get(`${config.gridproxyUrl}/nodes/${nodeId}`, {
    timeout: 1000,
  });

  if (res.status === 200) {
    if (res.data == "likely down") {
      throw Error("likely down");
    } else {
      return res.data.capacity.used_resources;
    }
  }
}

export async function getFarmDetails(farmID: string) {
  try {
    const res = await axios.get(`${config.gridproxyUrl}/farms?farm_id=${farmID}`, {
      timeout: 5000,
      validateStatus: function (status) {
        return status === 200;
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error("Unexpected error while fetching farm data: " + error.response.data.error);
  }
}
export async function getIpsForFarm(farmID: string) {
  const res = await axios.post(
    config.graphqlUrl,
    {
      query: `query MyQuery {
          farms(where: {farmID_eq: ${farmID}}) {
            publicIPs {
              id
            }
          }
        }
        `,
      operation: "getNodes",
    },
    { timeout: 3000 },
  );
  return res.data.data.farms[0].publicIPs.length;
}
export function calSU(hru: number, sru: number) {
  return hru / 1200 + sru / 200;
}
export function calCU(cru: number, mru: number) {
  const mru_used_1 = mru / 4;
  const cru_used_1 = cru / 2;
  const cu1 = mru_used_1 > cru_used_1 ? mru_used_1 : cru_used_1;

  const mru_used_2 = mru / 8;
  const cru_used_2 = cru;
  const cu2 = mru_used_2 > cru_used_2 ? mru_used_2 : cru_used_2;

  const mru_used_3 = mru / 2;
  const cru_used_3 = cru / 4;
  const cu3 = mru_used_3 > cru_used_3 ? mru_used_3 : cru_used_3;

  let cu = cu1 > cu2 ? cu2 : cu1;
  cu = cu > cu3 ? cu3 : cu;

  return cu;
}
export async function getPrices(api: ApiPromise) {
  const pricing = await api.query.tfgridModule.pricingPolicies(1);
  return pricing.toJSON();
}

export function countPrice(prices: { cu: { value: number }; su: { value: number } }, node: any) {
  const resources = {
    sru: node.total_resources.sru / 1024 / 1024 / 1024,
    hru: node.total_resources.hru / 1024 / 1024 / 1024,
    mru: node.total_resources.mru / 1024 / 1024 / 1024,
    cru: node.total_resources.cru,
  };
  const SU = calSU(resources.hru, resources.sru);
  const CU = calCU(resources.cru, resources.mru);

  const totalPrice = CU * prices.cu.value * 24 * 30 + SU * prices.su.value * 24 * 30;

  const usdPrice = totalPrice / 10000000;

  return usdPrice.toFixed(2);
}

export async function getTFTPrice(api: ApiPromise) {
  const pricing = (await api.query.tftPriceModule.tftPrice()) as any;
  return pricing.words[0] / 1000;
}

export async function calDiscount(TFTbalance: number, pricing: { discountForDedicationNodes: any }, price: any) {
  // discount for Dedicated Nodes
  const discount = pricing.discountForDedicationNodes;
  let totalPrice = price - price * (discount / 100);

  const discountPackages: any = {
    none: {
      duration: 0,
      discount: 0,
    },
    default: {
      duration: 3,
      discount: 20,
    },
    bronze: {
      duration: 6,
      discount: 30,
    },
    silver: {
      duration: 12,
      discount: 40,
    },
    gold: {
      duration: 36,
      discount: 60,
    },
  };

  let selectedPackage = "none";

  for (const pkg in discountPackages) {
    if (TFTbalance > totalPrice * discountPackages[pkg].duration) {
      selectedPackage = pkg;
    }
  }

  totalPrice = totalPrice - totalPrice * (discountPackages[selectedPackage].discount / 100);

  return [totalPrice.toFixed(2), discountPackages[selectedPackage].discount];
}

export async function getNodeByID(nodeId: any) {
  const node = await fetch(`${config.gridproxyUrl}/nodes/${nodeId}`).then(res => res.json());
  return node;
}

export async function getDedicatedNodes(twinId: string, query: string, page: number, size: number) {
  let baseUrl = `${config.gridproxyUrl}/nodes?status=up&ret_count=true&page=${page}&size=${size}`;
  if (query != "rented_by") {
    baseUrl += `&${query}=true`;
  } else {
    baseUrl += `&${query}=${twinId}`;
  }

  const res = await fetch(baseUrl);
  const count = res.headers.get("count");
  const nodes = await res.json();
  return { nodes, count };
}

export async function getDNodes(
  api: ApiPromise,
  address: string,
  currentTwinID: string,
  query: string,
  page: number,
  size: number,
) {
  let { nodes, count } = await getDedicatedNodes(currentTwinID, query, page, size);

  const pricing = (await getPrices(api)) as any;

  // discount for Twin Balance
  const TFTprice = await getTFTPrice(api);
  const balance = await getBalance(api, address);
  const TFTbalance = TFTprice * balance.free;

  let dNodes: {
    nodeId: string;
    price: string;
    discount: any;
    applyedDiscount: { first: any; second: any };
    location: { country: any; city: any; long: any; lat: any };
    resources: { cru: any; mru: any; hru: any; sru: any; gpu: number };
    farm: { id: string; name?: string; farmCertType?: string; pubIps?: string };
    rentContractId: any;
    rentedByTwinId: any;
    usedResources: { cru: any; mru: any; hru: any; sru: any };
    rentStatus: any;
  }[] = [];

  for (const node of nodes) {
    const price = countPrice(pricing, node);
    const [discount, discountLevel] = await calDiscount(TFTbalance, pricing, price);
    dNodes.push({
      farm: {
        id: node.farmId,
      },
      nodeId: node.nodeId,
      price: price,
      discount: discount,
      applyedDiscount: {
        first: pricing.discountForDedicationNodes,
        second: discountLevel,
      },
      location: {
        country: node.country,
        city: node.city,
        long: node.location.longitude ? node.location.longitude : "Unknown",
        lat: node.location.latitude ? node.location.latitude : "Unknown",
      },
      resources: {
        cru: toTeraOrGigaOrPeta(node.total_resources.cru.toString()),
        mru: toTeraOrGigaOrPeta(node.total_resources.mru.toString()),
        hru: toTeraOrGigaOrPeta(node.total_resources.hru.toString()),
        sru: toTeraOrGigaOrPeta(node.total_resources.sru.toString()),
        gpu: node.num_gpu,
      },
      usedResources: {
        cru: node.used_resources.cru,
        mru: node.used_resources.mru,
        hru: node.used_resources.hru,
        sru: node.used_resources.sru,
      },
      rentContractId: node.rentContractId,
      rentedByTwinId: node.rentedByTwinId,
      rentStatus: node.rentContractId === 0 ? "free" : node.rentedByTwinId == currentTwinID ? "yours" : "taken",
    });
  }
  return dNodes;
}

export async function updateDedicatedNodes(api: ApiPromise, address: string, currentTwinID: number, nodes: any[]) {
  const pricing = (await getPrices(api)) as any;
  // discount for Twin Balance
  const TFTprice = await getTFTPrice(api);
  const balance = await getBalance(api, address);
  const TFTbalance = TFTprice * balance.free;

  let dNodes: {
    nodeId: string;
    price: string;
    discount: any;
    applyedDiscount: { first: any; second: any };
    location: { country: any; city: any; long: any; lat: any };
    resources: { cru: any; mru: any; hru: any; sru: any; gpu: number };
    farm: { id: string; name?: string; farmCertType?: string; pubIps?: string };
    rentContractId: any;
    rentedByTwinId: any;
    usedResources: { cru: any; mru: any; hru: any; sru: any };
    rentStatus: any;
  }[] = [];

  for (const node of nodes) {
    const price = countPrice(pricing, node);
    const [discount, discountLevel] = await calDiscount(TFTbalance, pricing, price);
    dNodes.push({
      farm: {
        id: node.farmId,
      },
      nodeId: node.nodeId,
      price: price,
      discount: discount,
      applyedDiscount: {
        first: pricing.discountForDedicationNodes,
        second: discountLevel,
      },
      location: {
        country: node.country,
        city: node.city,
        long: node.location.longitude ? node.location.longitude : "Unknown",
        lat: node.location.latitude ? node.location.latitude : "Unknown",
      },
      resources: {
        cru: toTeraOrGigaOrPeta(node.total_resources.cru.toString()),
        mru: toTeraOrGigaOrPeta(node.total_resources.mru.toString()),
        hru: toTeraOrGigaOrPeta(node.total_resources.hru.toString()),
        sru: toTeraOrGigaOrPeta(node.total_resources.sru.toString()),
        gpu: node.num_gpu,
      },
      usedResources: {
        cru: node.used_resources.cru,
        mru: node.used_resources.mru,
        hru: node.used_resources.hru,
        sru: node.used_resources.sru,
      },
      rentContractId: node.rentContractId,
      rentedByTwinId: node.rentedByTwinId,
      rentStatus: node.rentContractId === 0 ? "free" : node.rentedByTwinId == currentTwinID ? "yours" : "taken",
    });
  }
  return dNodes;
}
