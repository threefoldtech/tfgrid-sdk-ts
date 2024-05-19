import { substrateURL, TFT } from "../src";
import { getClient } from "./client_loader";

const substrate = "wss://tfchain.dev.grid.tf/ws" as substrateURL.DEV;
const tft = new TFT(substrate);

async function main() {
  const grid = await getClient();

  const price = await tft.price();
  console.log(price);

  const tfts = await tft.fromUSD({ usd: 10 });
  console.log(tfts);

  const usd = await tft.toUSD({ tft: 10 });
  console.log(usd);

  const tftsInMonth = await tft.toMonth({ tft: 1 });
  console.log(tftsInMonth);

  const tftsInYear = await tft.toYear({ tft: 20 });
  console.log(tftsInYear);

  grid.disconnect();
}

main();
