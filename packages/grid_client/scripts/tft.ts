import { TFT } from "../src";
import { getClient } from "./client_loader";

const tft = new TFT("wss://tfchain.dev.grid.tf/ws");

async function main() {
  const grid = await getClient();

  const price = await tft.price();
  console.log(price);

  const tfts = await tft.fromUSD(10);
  console.log(tfts);

  const usd = await tft.toUSD(10);
  console.log(usd);

  const tftsInMonth = tft.toMonth(10);
  console.log(tftsInMonth);

  const tftsInYear = tft.toYear(20);
  console.log(tftsInYear);

  grid.disconnect();
}

main();
