import "jspdf-autotable";

import axios from "axios";
import type { jsPDF } from "jspdf";
import moment from "moment";

import { gqlClient } from "@/clients";

export interface NodeInterface {
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
  extraFee: number;
  rentContractId: number;
  rentedByTwinId: number;
  receipts: receiptInterface[];
  serialNumber: string;
  availability: NodeAvailability;
}

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

  const res = await gqlClient.uptimeEvents(
    { timestamp: true, uptime: true },
    {
      orderBy: ["timestamp_ASC"],
      where: { nodeID_eq: nodeId, timestamp_gt: currentPeriodStartTimestamp as unknown as bigint },
    },
  );

  const uptimeEvents: Array<UptimeEvent> = res.map((item: any) => {
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

export function getFarmUptimePercentage(farm: NodeInterface[]) {
  let uptime = 0;
  for (let i = 0; i < farm.length; i++) {
    uptime += +getNodeUptimePercentage(farm[i].nodeId);
  }
  return (uptime / farm.length).toFixed(2);
}

export async function getNodeUptimePercentage(nodeId: number) {
  const availability = await getNodeAvailability(nodeId);
  return (((availability?.currentPeriod - availability?.downtime) / availability?.currentPeriod) * 100).toFixed(2);
}
export function getTime(num: number | undefined) {
  if (num) {
    return new Date(num);
  }
  return new Date();
}
export function generateNodeSummary(doc: jsPDF, nodes: NodeInterface[]) {
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

export function generateReceipt(doc: jsPDF, node: NodeInterface) {
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
    `Uptime: ${getNodeUptimePercentage(node.nodeId)}% - ${Math.floor(
      moment.duration(node.uptime, "seconds").asDays(),
    )} days`,
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
