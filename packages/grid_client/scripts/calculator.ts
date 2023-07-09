import { CalculatorModel, CUModel, SUModel } from "../src";
import { getClient } from "./client_loader";

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

  const calCU = await grid3.calculator.calCU(CUModel);
  console.log("calCU", calCU);

  const calSU = await grid3.calculator.calSU(SUModel);
  console.log("calSU", calSU);

  const tftPrice = await grid3.calculator.tftPrice();
  console.log("tftPrice", tftPrice);

  const getPrices = await grid3.calculator.getPrices();
  console.log("getPrices", getPrices);

  const calculate = await grid3.calculator.calculate(CalculatorModel);
  console.log("calculate", calculate);

  const calculateWithMyBalance = await grid3.calculator.calculateWithMyBalance(CalculatorModel);
  console.log("calculateWithMyBalance", calculateWithMyBalance);

  await grid3.disconnect();
}

main();
