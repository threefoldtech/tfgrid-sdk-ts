import { CurrencyModel } from "../src";
import { currency as TFTUSDConversionService } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

let currency: TFTUSDConversionService;

function convertTFTtoUSD(amount) {
  const res = currency.convertTFTtoUSD(amount);
  log("================= Convert TFT =================");
  log(res);
  log("================= Convert TFT =================");
}

function convertUSDtoTFT(amount) {
  const res = currency.convertUSDtoTFT(amount);
  log("================= Convert USD =================");
  log(res);
  log("================= Convert USD =================");
}

function dailyTFT(hourlyTFT) {
  const res = currency.dailyTFT(hourlyTFT);
  log("================= Daily TFT =================");
  log(res);
  log("================= Daily TFT =================");
}

function monthlyTFT(hourlyTFT) {
  const res = currency.monthlyTFT(hourlyTFT);
  log("================= Monthly TFT =================");
  log(res);
  log("================= Monthly TFT =================");
}

function yearlyTFT(hourlyTFT) {
  const res = currency.yearlyTFT(hourlyTFT);
  log("================= Yearly TFT =================");
  log(res);
  log("================= Yearly TFT =================");
}

function dailyUSD(hourlyUSD) {
  const res = currency.dailyUSD(hourlyUSD);
  log("================= Daily USD =================");
  log(res);
  log("================= Daily USD =================");
}

function monthlyUSD(hourlyUSD) {
  const res = currency.monthlyUSD(hourlyUSD);
  log("================= Monthly USD =================");
  log(res);
  log("================= Monthly USD =================");
}

function yearlyUSD(hourlyUSD) {
  const res = currency.yearlyUSD(hourlyUSD);
  log("================= Yearly USD =================");
  log(res);
  log("================= Yearly USD =================");
}
async function main() {
  const grid = await getClient();
  const rate = await grid.tfclient.tftPrice.get();
  const decimals = 3;
  currency = new TFTUSDConversionService(rate, decimals);

  const amount: CurrencyModel = {
    amount: 1,
  };

  convertTFTtoUSD(amount);
  convertUSDtoTFT(amount);
  dailyTFT(amount);
  monthlyTFT(amount);
  yearlyTFT(amount);
  dailyUSD(amount);
  monthlyUSD(amount);
  yearlyUSD(amount);

  await grid.disconnect();
}

main();
