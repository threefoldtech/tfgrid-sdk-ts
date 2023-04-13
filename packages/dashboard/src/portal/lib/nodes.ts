/* eslint-disable */
import { Signer } from "@polkadot/api/types";
import { web3FromAddress } from "@polkadot/extension-dapp";
import axios from "axios";
import config from "../config";
import { getBalance } from "./balance";
import { jsPDF } from "jspdf";
import { nodeInterface } from "./farms";
import moment from "moment";
import "jspdf-autotable";
import { apiInterface } from "./util";
import { Any } from "@/hub/types/google/protobuf/any";
export interface receiptInterface {
  hash: string;
  mintingStart?: number;
  mintingEnd?: number;
  measuredUptime?: number;
  fixupStart?: number;
  fixupEnd?: number;
  tft?: number;
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
  const topX = 80;
  const lineOffset = 10;
  const cellOffset = 40;
  const cellX = 15;
  const cellY = topY + lineOffset;

  doc.text("Total Nodes Summary", topX, topY);
  doc.setFontSize(10);

  doc.text(`Nodes: ${nodes.length}`, cellX, cellY);
  doc.text(`Receipts: ${nodes.reduce((total, node) => (total += node.receipts.length), 0)}`, cellX, cellY + lineOffset);
  doc.text(
    `Minting Receipts: ${nodes.reduce(
      (total, node) => (total += node.receipts.filter(receipt => receipt.measuredUptime).length),
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
  doc.text(
    `Uptime: ${(
      (nodes.reduce(
        (totalM, node) =>
          (totalM += node.receipts.reduce((total, receipt) => (total += receipt.measuredUptime || 0), 0)),
        0,
      ) /
        nodes.reduce(
          (totalU, node) => (totalU += Math.floor(moment.duration(node.uptime, "seconds").asSeconds())),
          0,
        )) *
      100
    ).toFixed(2)}% - ${nodes.reduce(
      (total, node) => (total += Math.floor(moment.duration(node.uptime, "seconds").asDays())),
      0,
    )} days`,
    cellX,
    cellY + lineOffset * 5,
  );
}

export interface ITab {
  label: string;
  query: "rentable" | "rented" | "rented_by";
  value: "rentable" | "rented" | "mine";
  index: number;
}

export function generateReceipt(doc: jsPDF, node: nodeInterface) {
  doc.setFontSize(15);

  const topY = 20;
  const lineOffset = 5;
  const cellOffset = 30;
  const cellX = 15;
  const cellY = topY + lineOffset * 8;

  doc.text(`Node ${node.nodeId} Summary`, 80, topY);
  doc.setFontSize(10);
  doc.text(`Receipts total: ${node.receipts.length}`, cellX, topY + lineOffset);
  doc.text(
    `Minting total: ${node.receipts.filter(receipt => receipt.measuredUptime).length}`,
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

  doc.line(cellX, topY + lineOffset * 6, cellX + 175, topY + lineOffset * 6);

  node.receipts.map((receipt, i) => {
    if (receipt.measuredUptime) {
      doc.text(`Minting: ${receipt.hash}`, cellX, cellY + cellOffset * i);
      doc.text(`start: ${getTime(receipt.mintingStart)}`, cellX, cellY + cellOffset * i + lineOffset);
      doc.text(`end: ${getTime(receipt.mintingEnd)}`, cellX, cellY + cellOffset * i + lineOffset * 2);
      doc.text(`TFT: ${receipt.tft?.toFixed(2)}`, cellX, cellY + cellOffset * i + lineOffset * 3);
    } else {
      doc.text(`Fixup: ${receipt.hash}`, cellX, cellY + cellOffset * i);
      doc.text(`start: ${getTime(receipt.fixupStart)}`, cellX, cellY + cellOffset * i + lineOffset);
      doc.text(`end: ${getTime(receipt.fixupEnd)}`, cellX, cellY + cellOffset * i + lineOffset * 2);
    }
    if (i !== node.receipts.length - 1) {
      doc.line(cellX, cellY + cellOffset * i + lineOffset * 4, cellX + 175, cellY + cellOffset * i + lineOffset * 4);
    }
  });

  return doc;
}
export function byteToGB(capacity: number) {
  return (capacity / 1024 / 1024 / 1024).toFixed(0);
}
export async function createRentContract(
  api: apiInterface,
  address: string,
  nodeId: string,
  solutionProviderID: string | null,
  callback: any,
) {
  const injector = await web3FromAddress(address);
  return api.tx.smartContractModule
    .createRentContract(nodeId, solutionProviderID)
    .signAndSend(address, { signer: injector.signer }, callback);
}
export async function cancelRentContract(api: apiInterface, address: string, contractId: string, callback: any) {
  const injector = await web3FromAddress(address);
  return api.tx.smartContractModule
    .cancelContract(contractId)
    .signAndSend(address, { signer: injector.signer }, callback);
}

export async function getActiveContracts(api: apiInterface, nodeId: string) {
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
            measured_uptime: number;
            reward: { musd: number; tft: number };
          };
          Fixup: { period: { start: number; end: number } };
        };
      }) => {
        if (rec.receipt.Minting) {
          nodeReceipts.push({
            hash: rec.hash,
            mintingStart: rec.receipt.Minting.period.start * 1000,
            mintingEnd: rec.receipt.Minting.period.end * 1000,
            measuredUptime: rec.receipt.Minting.measured_uptime || 0,
            tft: rec.receipt.Minting.reward.tft / 1e7,
          });
        } else {
          nodeReceipts.push({
            hash: rec.hash,
            fixupStart: rec.receipt.Fixup.period.start * 1000 || 0,
            fixupEnd: rec.receipt.Fixup.period.end * 1000 || 0,
          });
        }
      },
    ),
  );

  return nodeReceipts;
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
export async function getPrices(api: apiInterface) {
  const pricing = await api.query.tfgridModule.pricingPolicies(1);
  return pricing.toJSON();
}

export function countPrice(
  prices: { cu: { value: number }; su: { value: number } },
  node: { total_resources: { sru: number; hru: number; mru: number; cru: any } },
) {
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

export async function getTFTPrice(api: apiInterface) {
  const pricing = await api.query.tftPriceModule.tftPrice();
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
  api: apiInterface,
  address: string,
  currentTwinID: string,
  query: string,
  page: number,
  size: number,
) {
  let { nodes, count } = await getDedicatedNodes(currentTwinID, query, page, size);

  const pricing = await getPrices(api);

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
    resources: { cru: any; mru: any; hru: any; sru: any };
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
        cru: node.total_resources.cru,
        mru: node.total_resources.mru,
        hru: node.total_resources.hru,
        sru: node.total_resources.sru,
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
  return { dNodes, count };
}
