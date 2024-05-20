import { CurrencyModel, HourlyTFTModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function convertTFTtoUSD(client, amount) {
  const res = await client.tft.convertTFTtoUSD(amount);
  log("================= Convert TFT =================");
  log(res);
  log("================= Convert TFT =================");
}

async function convertUSDtoTFT(client, amount) {
  const res = await client.tft.convertUSDtoTFT(amount);
  log("================= Convert USD =================");
  log(res);
  log("================= Convert USD =================");
}

async function monthlyTFT(client, hourlyTFT) {
  const res = await client.tft.monthlyTFT(hourlyTFT);
  log("================= Monthly TFT =================");
  log(res);
  log("================= Monthly TFT =================");
}

async function yearlyTFT(client, hourlyTFT) {
  const res = await client.tft.yearlyTFT(hourlyTFT);
  log("================= Yearly TFT =================");
  log(res);
  log("================= Yearly TFT =================");
}
async function main() {
  const grid = await getClient();

  const amount: CurrencyModel = {
    amount: 5,
  };

  const hourlyTFT: HourlyTFTModel = {
    amount: 5,
  };

  await convertTFTtoUSD(grid, amount);
  await convertUSDtoTFT(grid, amount);
  await monthlyTFT(grid, hourlyTFT);
  await yearlyTFT(grid, hourlyTFT);

  await grid.disconnect();
}

main();
