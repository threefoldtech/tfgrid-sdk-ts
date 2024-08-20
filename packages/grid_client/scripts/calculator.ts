import { CalculatorModel, CUModel, GridClient, SUModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function calculateCU(client: GridClient, CUModel: CUModel) {
  const res = await client.calculator.calCU(CUModel);
  log("================= Calculating CU =================");
  log(res);
  log("================= Calculating CU =================");
}

async function calculateSU(client: GridClient, SUModel: SUModel) {
  const res = await client.calculator.calSU(SUModel);
  log("================= Calculating SU =================");
  log(res);
  log("================= Calculating SU =================");
}

async function getTFTPrice(client: GridClient) {
  const res = await client.calculator.tftPrice();
  log("================= TFT Price =================");
  log(res);
  log("================= TFT Price =================");
}

async function getPricingPolicy(client: GridClient) {
  const res = await client.calculator.getPrices();
  log("================= Pricing Policy =================");
  log(res);
  log("================= Pricing Policy =================");
}

async function calculateDeployment(client: GridClient, CalculatorModel: CalculatorModel) {
  const res = await client.calculator.calculate(CalculatorModel);
  log("================= Deployment Cost =================");
  log(res);
  log("================= Deployment Cost =================");
}

async function calculateDeploymentWithCurrentBalance(client: GridClient, CalculatorModel: CalculatorModel) {
  const res = await client.calculator.calculateWithMyBalance(CalculatorModel);
  log("================= Deployment Cost with current balance =================");
  log(res);
  log("================= Deployment Cost with current balance =================");
}

async function main() {
  const grid3: GridClient = await getClient();
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

main();
