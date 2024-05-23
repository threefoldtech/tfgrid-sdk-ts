import { CurrencyModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function convertTFTtoUSD(client, amount) {
  const res = await client.currency.convertTFTtoUSD(amount);
  log("================= Convert TFT =================");
  log(res);
  log("================= Convert TFT =================");
}

async function convertUSDtoTFT(client, amount) {
  const res = await client.currency.convertUSDtoTFT(amount);
  log("================= Convert USD =================");
  log(res);
  log("================= Convert USD =================");
}

async function dailyTFT(client, hourlyTFT) {
  const res = await client.currency.dailyTFT(hourlyTFT);
  log("================= Daily TFT =================");
  log(res);
  log("================= Daily TFT =================");
}

async function monthlyTFT(client, hourlyTFT) {
  const res = await client.currency.monthlyTFT(hourlyTFT);
  log("================= Monthly TFT =================");
  log(res);
  log("================= Monthly TFT =================");
}

async function yearlyTFT(client, hourlyTFT) {
  const res = await client.currency.yearlyTFT(hourlyTFT);
  log("================= Yearly TFT =================");
  log(res);
  log("================= Yearly TFT =================");
}

async function dailyUSD(client, hourlyUSD) {
  const res = await client.currency.dailyUSD(hourlyUSD);
  log("================= Daily USD =================");
  log(res);
  log("================= Daily USD =================");
}

async function monthlyUSD(client, hourlyUSD) {
  const res = await client.currency.monthlyUSD(hourlyUSD);
  log("================= Monthly USD =================");
  log(res);
  log("================= Monthly USD =================");
}

async function yearlyUSD(client, hourlyUSD) {
  const res = await client.currency.yearlyUSD(hourlyUSD);
  log("================= Yearly USD =================");
  log(res);
  log("================= Yearly USD =================");
}
async function main() {
  const grid = await getClient();
  grid.currency.rate = await grid.tfclient.tftPrice.get();
  const amount: CurrencyModel = {
    amount: 1,
  };

  await convertTFTtoUSD(grid, amount);
  await convertUSDtoTFT(grid, amount);
  await dailyTFT(grid, amount);
  await monthlyTFT(grid, amount);
  await yearlyTFT(grid, amount);
  await dailyUSD(grid, amount);
  await monthlyUSD(grid, amount);
  await yearlyUSD(grid, amount);

  await grid.disconnect();
}

main();
