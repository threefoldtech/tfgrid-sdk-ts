import { CalculatorModel, CUModel, SUModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();
  const CalculatorModel: CalculatorModel = {
    cru: 16,
    mru: 8, // GB
    sru: 25,
    hru: 0,
    ipv4u: false,
    certified: true,
    balance: 0,
  };

  const CUModel: CUModel = {
    cru: 1,
    mru: 1, // GB
  };

  const SUModel: SUModel = {
    hru: 1,
    sru: 1, // GB
  };

  //Calculate CU
  await calculateCU(grid3, CUModel);

  //Calculate SU
  await calculateSU(grid3, SUModel);

  //Get TFT price
  await getTFTPrice(grid3);

  //Get Pricing Policy
  await getPricingPolicy(grid3);

  //Get deployment cost
  await calculateDeployment(grid3, CalculatorModel);

  //Get deployment cost with current balance
  await calculateDeploymentWithCurrentBalance(grid3, CalculatorModel);

  await grid3.disconnect();
}

async function calculateCU(client, CUModel) {
  try {
    const res = await client.calculator.calCU(CUModel);
    log("================= Calculating CU =================");
    log(res);
    log("================= Calculating CU =================");
  } catch (error) {
    log("Error while calculating CU " + error);
  }
}

async function calculateSU(client, SUModel) {
  try {
    const res = await client.calculator.calSU(SUModel);
    log("================= Calculating SU =================");
    log(res);
    log("================= Calculating SU =================");
  } catch (error) {
    log("Error while calculating SU " + error);
  }
}

async function getTFTPrice(client) {
  try {
    const res = await client.calculator.tftPrice();
    log("================= TFT Price =================");
    log(res);
    log("================= TFT Price =================");
  } catch (error) {
    log("Error while getting TFT price " + error);
  }
}

async function getPricingPolicy(client) {
  try {
    const res = await client.calculator.getPrices();
    log("================= Pricing Policy =================");
    log(res);
    log("================= Pricing Policy =================");
  } catch (error) {
    log("Error while getting pricing policy " + error);
  }
}

async function calculateDeployment(client, CalculatorModel) {
  try {
    const res = await client.calculator.calculate(CalculatorModel);
    log("================= Deployment Cost =================");
    log(res);
    log("================= Deployment Cost =================");
  } catch (error) {
    log("Error while calculating deployment cost " + error);
  }
}

async function calculateDeploymentWithCurrentBalance(client, CalculatorModel) {
  try {
    const res = await client.calculator.calculateWithMyBalance(CalculatorModel);
    log("================= Deployment Cost with current balance =================");
    log(res);
    log("================= Deployment Cost with current balance =================");
  } catch (error) {
    log("Error while calculating deployment cost " + error);
  }
}

main();
